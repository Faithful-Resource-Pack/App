<template>
	<v-container>
		<fullscreen-preview ref="headerPreview" :src="header" />

		<div class="text-center" v-if="loading">
			<h2 class="mb-3">{{ $root.lang().addons.general.loading_addon }}</h2>
			<v-progress-circular :size="70" :width="7" color="primary" indeterminate />
		</div>
		<v-list
			v-else
			:class="['main-container', 'my-2 pa-4', { 'mx-n3': !$vuetify.breakpoint.mdAndUp }]"
			:rounded="$vuetify.breakpoint.mdAndUp"
			two-line
		>
			<v-form lazy-validation v-model="validForm" ref="form">
				<a href="https://docs.faithfulpack.net/pages/manuals/add-on-rules" target="_blank">
					<v-alert type="warning" class="pb-4" color="orange darken-3">
						<span style="color: inherit; text-decoration: underline">
							{{ $root.lang("addons.general.rules") }}
						</span>
						<v-icon small>mdi-open-in-new</v-icon>
					</v-alert>
				</a>

				<div class="row">
					<!-- LEFT PART : INPUT -->
					<div class="col pb-0">
						<div class="text-h5">{{ $root.lang().addons.general.title }}</div>
						<!-- Addon name -->
						<v-text-field
							required
							clearable
							v-model="submittedForm.name"
							:rules="form.name.rules"
							:counter="form.name.counter.max"
							:label="$root.lang().addons.general.name.label"
							:hint="$root.lang().addons.general.name.hint"
						/>

						<div class="text-h5 mb-3" v-if="!$vuetify.breakpoint.smAndDown">
							{{ $root.lang().addons.images.title }}
						</div>
					</div>
					<!-- RIGHT PART: HEADER IMAGE PREVIEW -->
					<div class="col-12 col-sm-3 d-flex px-0 pt-0 align-center">
						<div class="col">
							<div style="position: relative" v-if="hasHeader" class="mt-3">
								<v-img
									@click.stop="(e) => $refs.headerPreview.open()"
									style="border-radius: 10px"
									:aspect-ratio="16 / 9"
									:src="header"
								/>
								<v-card
									class="ma-2"
									rounded
									style="display: inline-block; position: absolute; right: 0; top: 0"
								>
									<v-icon small class="ma-1" @click.stop="(e) => $refs.headerPreview.open()">
										mdi-fullscreen </v-icon
									><v-icon
										small
										class="ma-1"
										@click="
											() => {
												$emit('header', undefined, true);
												submittedForm.headerFile = undefined;
											}
										"
									>
										mdi-delete
									</v-icon>
								</v-card>
							</div>
							<v-responsive
								:aspect-ratio="$vuetify.breakpoint.smAndDown ? undefined : 16 / 9"
								min-height="100px"
								class="mt-3"
								v-else
							>
								<drop-zone
									:disabled="disabledHeaderInput"
									v-model="submittedForm.headerFile"
									accept="image/jpg, image/jpeg, image/png, image/gif"
									@change="headerChange"
									style="height: 100%"
								>
									<template v-slot:label>
										<span
											><v-icon small>mdi-image</v-icon>
											{{ $root.lang().addons.images.header.labels.drop }}</span
										>
									</template>
								</drop-zone>
							</v-responsive>
						</div>
					</div>
				</div>

				<div class="text-h5 mb-3" v-if="$vuetify.breakpoint.smAndDown">
					{{ $root.lang().addons.images.title }}
				</div>

				<!-- upload field for images -->
				<div class="py-5">
					<drop-zone
						multiple
						v-model="submittedForm.carouselFiles"
						accept="image/jpg, image/jpeg, image/png, image/gif"
						@change="carouselChange"
						style="height: 70px"
					>
						<template v-slot:label>
							<span
								><v-icon small>mdi-image</v-icon>
								{{ $root.lang().addons.images.carousel.labels.drop }}</span
							>
						</template>
					</drop-zone>
				</div>
				<image-previewer
					:sources="carouselSources"
					:ids="screenIds"
					@item-delete="onDeleteCarousel"
				/>

				<div class="text-h5">{{ $root.lang().addons.titles.details }}</div>

				<!-- Addon description -->
				<v-textarea
					clearable
					v-model="submittedForm.description"
					:rules="form.description.rules"
					:counter="form.description.counter.max"
					:label="$root.lang().addons.general.description.label"
					:hint="$root.lang().addons.general.description.hint"
				/>

				<!-- Embed description -->
				<v-text-field
					clearable
					v-model="submittedForm.embed_description"
					:label="$root.lang().addons.general.embed_description.label"
					:hint="$root.lang().addons.general.embed_description.hint"
					:counter="form.embed_description.counter.max"
					persistent-hint
				/>

				<!-- Addon description preview (using marked and sanitized)-->
				<!-- eslint-disable vue/no-v-text-v-html-on-component -->
				<v-container
					id="addon-description-preview"
					v-if="submittedForm.description && submittedForm.description.length > 0"
					class="markdown"
					style="background-color: rgba(33, 33, 33, 1); border-radius: 5px"
					v-html="$root.compiledMarkdown(submittedForm.description)"
				/>
				<!-- eslint-enable vue/no-v-text-v-html-on-component -->

				<!-- Addon authors selection -->
				<user-select
					:users="users"
					v-model="submittedForm.authors"
					:label="$root.lang().addons.general.authors.label"
					:hint="$root.lang().addons.general.authors.hint"
				/>

				<div class="container" id="type-checkbox">
					<div class="row text-center">
						<div class="col-12 col-md-6">
							<v-row>
								<v-col cols="6" v-for="type in editions" :key="type">
									<v-checkbox
										v-model="submittedForm.selectedEditions"
										:label="type"
										:disabled="
											submittedForm.selectedEditions.length === 1 &&
											submittedForm.selectedEditions[0] === type
										"
										:value="type"
										:hide-details="$vuetify.breakpoint.smAndDown"
										color="primary"
									/>
								</v-col>
							</v-row>
						</div>
						<div class="col-12 col-md-6">
							<v-row>
								<v-col cols="6" v-for="type in res" :key="type">
									<v-checkbox
										v-model="submittedForm.selectedRes"
										:label="type"
										:disabled="
											submittedForm.selectedRes.length === 1 &&
											submittedForm.selectedRes[0] === type
										"
										:value="type"
										color="primary"
									/>
								</v-col>
							</v-row>
						</div>
					</div>
				</div>

				<div class="text-h5">{{ $root.lang().addons.options.title }}</div>

				<div class="container">
					<v-row>
						<v-checkbox
							class="col-6"
							v-model="submittedForm.options.optifine"
							:label="$root.lang().addons.options.optifine.label"
							color="primary"
						/>
					</v-row>
				</div>

				<div class="text-h5">{{ $root.lang().addons.downloads.title }}</div>

				<div>
					<v-row v-for="(obj, index) in submittedForm.downloads" :key="index" style="margin-top: 0">
						<v-col cols="3">
							<v-text-field
								clearable
								:placeholder="$root.lang().addons.downloads.name.placeholder"
								:label="$root.lang().addons.downloads.name.label"
								v-model="obj.key"
								:rules="downloadTitleRules"
							/>
						</v-col>
						<v-col cols="9">
							<v-row
								v-for="(link, indexLinks) in obj.links"
								:key="indexLinks"
								:style="{
									'align-items': 'baseline',
									'margin-top': indexLinks != 0 ? '-32px' : '-12px',
								}"
							>
								<v-col>
									<v-text-field
										clearable
										:placeholder="$root.lang().addons.downloads.link.placeholder"
										:label="$root.lang().addons.downloads.link.label"
										v-model="obj.links[indexLinks]"
										:rules="downloadLinkRules"
									/>
								</v-col>
								<v-col v-if="indexLinks == 0" class="flex-grow-0 flex-shrink-0">
									<v-btn icon @click="linkAdd(index)">
										<v-icon color="lighten-1">mdi-plus</v-icon>
									</v-btn>
								</v-col>
								<v-col v-else class="flex-grow-0 flex-shrink-0">
									<v-btn icon @click="linkRemove(index, indexLinks)">
										<v-icon color="red lighten-1">mdi-minus</v-icon>
									</v-btn>
								</v-col>
								<v-col v-if="index != 0 && indexLinks == 0" class="flex-grow-0 flex-shrink-0">
									<v-btn icon @click="downloadRemove(index)">
										<v-icon color="red lighten-1">mdi-delete</v-icon>
									</v-btn>
								</v-col>
							</v-row>
						</v-col>
					</v-row>
				</div>
				<div class="pb-3">
					<v-btn block @click="downloadAdd()">
						{{ $root.lang().global.btn.add_download }}
						<v-icon color="white lighten-1">mdi-plus</v-icon>
					</v-btn>
				</div>

				<div class="text-center">
					<v-btn
						v-if="$root.isAdmin"
						:disabled="!validForm"
						@click="() => onSubmit(true)"
						color="primary"
					>
						{{ $root.lang("global.btn.submit_and_approve") }}
					</v-btn>
					<v-btn :disabled="!validForm" @click="() => onSubmit(false)" color="primary">
						{{ $root.lang().global.btn.submit }}
					</v-btn>
				</div>
			</v-form>
		</v-list>
	</v-container>
</template>

<script>
import axios from "axios";

import UserSelect from "../components/user-select.vue";
import ImagePreviewer from "./image-previewer.vue";
import FullscreenPreview from "./fullscreen-preview.vue";
import DropZone from "../components/drop-zone.vue";

export default {
	name: "addon-form",
	components: {
		UserSelect,
		ImagePreviewer,
		FullscreenPreview,
		DropZone,
	},
	props: {
		addonNew: {
			type: Boolean,
			required: true,
		},
		addonData: {
			required: true,
		},
		loading: {
			type: Boolean,
			required: false,
			default: false,
		},
		headerSource: {
			required: false,
			default: undefined,
		},
		screenSources: {
			required: false,
		},
		screenIds: {
			required: false,
			type: Array,
			default: undefined,
		},
		disabledHeaderInput: {
			required: false,
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			form: {
				files: {
					header: {
						rules: [
							(header) => !!header || this.$root.lang().addons.images.header.rules.image_required,
							(header) =>
								(header && header.size < this.form.files.header.counter.max) ||
								this.$root
									.lang()
									.addons.images.header.rules.image_size.replace(
										"%s",
										this.form.files.header.counter.max / 1000,
									),
						],
						counter: {
							max: 3000000,
						},
					},
					carousel: {
						rules: [
							(files) => {
								return (
									files
										.map(
											(file) =>
												file.size < this.form.files.carousel.counter.max ||
												this.$root
													.lang()
													.addons.images.header.rules.image_size.replace(
														"%s",
														this.form.files.header.counter.max / 1000,
													),
										)
										.filter((r) => typeof r === "string")[0] || true
								);
							},
						],
						counter: {
							max: 3000000,
						},
					},
					value: "",
				},
				description: {
					rules: [
						(desc) =>
							!!desc || this.$root.lang().addons.general.description.rules.description_required,
						(desc) =>
							(desc && desc.length <= this.form.description.counter.max) ||
							this.$root
								.lang()
								.addons.general.description.rules.description_too_big.replace(
									"%s",
									this.form.description.counter.max,
								),
						(desc) =>
							(desc && desc.length >= this.form.description.counter.min) ||
							this.$root
								.lang()
								.addons.general.description.rules.description_too_small.replace(
									"%s",
									this.form.description.counter.min,
								),
					],
					counter: {
						min: 32,
						max: 4096,
					},
				},
				embed_description: {
					rules: [
						(desc) =>
							(desc && desc.length > this.form.embed_description.counter.max) ||
							this.$root
								.lang()
								.addons.general.embed_description.rules.too_big.replace(
									"%s",
									this.form.embed_description.counter.max,
								),
					],
					counter: {
						max: 160,
					},
				},
				name: {
					rules: [
						(name) => !!name || this.$root.lang().addons.general.name.rules.name_required,
						(name) =>
							(name && name.length <= this.form.name.counter.max) ||
							this.$root
								.lang()
								.addons.general.name.rules.name_too_big.replace("%s", this.form.name.counter.max),
						(name) =>
							(name && name.length >= this.form.name.counter.min) ||
							this.$root
								.lang()
								.addons.general.name.rules.name_too_small.replace("%s", this.form.name.counter.min),
					],
					counter: {
						min: 5,
						max: 30,
					},
				},
				slug: {
					rules: [
						(input) => !!input || this.$root.lang().addons.general.slug.rules.required,
						(input) =>
							(input && input.length <= this.form.slug.counter.max) ||
							this.$root
								.lang()
								.addons.general.slug.rules.too_big.replace("%s", this.form.slug.counter.max),
						(input) =>
							(input && input.length >= this.form.slug.counter.min) ||
							this.$root
								.lang()
								.addons.general.slug.rules.too_small.replace("%s", this.form.slug.counter.min),
						(input) =>
							/^[a-zA-Z0-9\-]+$/.test(input) ||
							this.$root.lang().addons.general.slug.rules.incorrect_format,
					],
					counter: {
						min: 5,
						max: 30,
					},
				},
			},
			submittedForm: {
				name: "",
				headerFile: undefined,
				carouselFiles: [],
				description: "",
				downloads: [
					{
						key: "",
						links: [""],
					},
				],
				authors: [],
				selectedEditions: ["Java"],
				selectedRes: ["32x"],
				options: {
					tags: [],
					comments: true,
					optifine: false,
				},
			},
			headerValid: false,
			headerValidating: false,
			headerError: "",
			carouselValid: true,
			carouselValidating: false,
			carouselError: "",
			carouselDoNotVerify: false,
			downloadTitleRules: [
				(u) => !!u || this.$root.lang().addons.downloads.name.rules.name_required,
				(u) => u !== " " || this.$root.lang().addons.downloads.name.rules.name_cannot_be_empty,
			],
			downloadLinkRules: [(u) => this.validURL(u) || this.$root.lang().addons.downloads.link.rule],
			validForm: false,
			editions: ["Java", "Bedrock"],
			res: ["32x", "64x"],
			users: [],
		};
	},
	computed: {
		hasHeader() {
			return !!(this.header || this.headerURL);
		},
		header() {
			return this.addonNew
				? this.headerValidating == false && this.headerValid && this.submittedForm.headerFile
					? URL.createObjectURL(this.submittedForm.headerFile)
					: undefined
				: this.headerSource
					? this.headerSource
					: undefined;
		},
		carouselSources() {
			return this.screenSources ? this.screenSources : [];
		},
		headerValidSentence() {
			if (this.headerValidating) return "Header being verified...";
			if (this.headerValid) return true;
			return this.headerError;
		},
		headerRules() {
			if (!this.addonNew) return [];
			return [...this.form.files.header.rules, this.headerValidSentence];
		},
		headerFile() {
			return this.submittedForm.headerFile;
		},
		carouselFiles() {
			return this.submittedForm.carouselFiles;
		},
		carouselRules() {
			return [...this.form.files.carousel.rules, this.carouselValidSentence];
		},
		carouselValidSentence() {
			if (this.carouselValidating) return "Carousel being verified...";
			if (this.carouselValid) return true;
			return this.carouselError;
		},
		submittedData() {
			const res = Object.merge({}, this.submittedForm);

			res.options.tags = [...res.selectedEditions, ...res.selectedRes];
			delete res.selectedEditions;
			delete res.selectedRes;

			// we treat files with different endpoint
			delete res.headerFile;
			delete res.carouselFiles;

			return res;
		},
	},
	methods: {
		carouselChange() {
			if (this.carouselDoNotVerify) return;

			const files = this.submittedForm.carouselFiles;
			if (!files || files.length == 0) return;

			this.carouselValidating = true;
			Promise.all(files.map((f) => this.verifyImage(f, this.validateRatio)))
				.then(() => {
					this.carouselValid = true;
					this.$emit("screenshot", files);
					this.submittedForm.carouselFiles = [];
				})
				.catch((error) => {
					console.error(error);
					this.carouselValid = false;
					this.carouselError = error.message;
					this.$root.showSnackBar(error, "error");
				})
				.finally(() => {
					this.carouselValidating = false;
				});
		},
		headerChange(file) {
			// delete not uploaded file
			if (!file) {
				if (this.addonNew) {
					this.$emit("header", undefined, true);
				}
				return;
			}

			// activate validation loading
			this.headerValidating = true;

			this.verifyImage(file, this.validateRatio)
				.then(() => {
					this.headerValid = true;
					this.$emit("header", file);
					if (!this.addonNew) {
						this.submittedForm.headerFile = undefined;
					}
				})
				.catch((error) => {
					this.headerValid = false;
					this.headerError = error.message;
					console.error(error);

					// input is changed so we delete parent component value
					if (this.addonNew) this.$emit("header", undefined, true);
					// if not addon new will delete file

					this.$root.showSnackBar(error.message, "error");
				})
				.finally(() => {
					this.headerValidating = false;
				});
		},
		downloadAdd() {
			this.submittedForm.downloads.push({ key: "", links: [""] });
		},
		downloadRemove(downloadIndex) {
			this.submittedForm.downloads.splice(downloadIndex, 1);
		},
		linkAdd(downloadIndex) {
			this.submittedForm.downloads[downloadIndex].links.push("");
		},
		linkRemove(downloadIndex, linkIndex) {
			this.submittedForm.downloads[downloadIndex].links.splice(linkIndex, 1);
		},
		onDeleteCarousel(_item, index, id) {
			this.carouselDoNotVerify = true;
			this.submittedForm.carouselFiles.splice(index, 1);
			this.$emit("screenshot", undefined, index, true, id);
			this.$nextTick(() => {
				this.carouselDoNotVerify = false;
			});
		},
		onSubmit(approve = false) {
			const valid = this.$refs.form.validate();
			if (!valid) return;

			this.$emit("submit", this.submittedData, approve);
		},
		validateRatio(ctx) {
			const ratio = (ctx.width / ctx.height).toFixed(2) == 1.78;
			if (!ratio) throw new Error(this.$root.lang().addons.images.header.rules.image_ratio);
		},
		validURL(str) {
			return String.urlRegex.test(str);
		},
		verifyImage(file, validateImage) {
			if (validateImage === undefined) validateImage = this.validateRatio;

			return new Promise((resolve, reject) => {
				// start reader
				const reader = new FileReader();

				reader.onload = (e) => {
					const image = new Image();
					image.src = e.target.result;
					image.onload = function () {
						// do not use anonymous fn
						try {
							validateImage(this); // this is image now
							resolve();
						} catch (error) {
							reject(error);
						}
					};
					image.onerror = () => reject(e);
				};
				reader.onerror = () => reject(e);

				// set file to be read
				reader.readAsDataURL(file);
			});
		},
		getUsers() {
			axios
				.get(`${this.$root.apiURL}/users/names`)
				.then((res) => {
					this.users = res.data.sort((a, b) => {
						if (!a.username && !b.username) return 0;
						if (!a.username && b.username) return 1;
						if (a.username && !b.username) return -1;

						return a.username > b.username ? 1 : b.username > a.username ? -1 : 0;
					});
				})
				.catch((err) => {
					console.trace(err);
				});
		},
	},
	watch: {
		addonData: {
			handler(data) {
				if (!this.addonNew && data) {
					data = JSON.parse(JSON.stringify(data));
					data.headerFile = undefined;
					data.carouselFiles = [];
					data.selectedRes = data.options.tags.filter((e) => this.res.includes(e));
					data.selectedEditions = data.options.tags.filter((e) => this.editions.includes(e));
					this.submittedForm = data;
				}
			},
			immediate: true,
			deep: true,
		},
	},
	beforeMount() {
		this.getUsers();
		this.submittedForm.authors = [this.$root.user.id];
	},
};
</script>
