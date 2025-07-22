<template>
	<v-container>
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div class="styles" v-html="pageStyles" />
		<fullscreen-preview v-model="previewOpen" :src="header" />

		<div v-if="loading" class="text-center">
			<h2 class="mb-5">{{ $root.lang().addons.general.loading_addon }}</h2>
			<v-progress-circular :size="70" :width="7" :color="pageColor" indeterminate />
		</div>
		<v-list
			v-else
			:class="['main-container', 'mb-2 pa-4', { 'mx-n3': !$vuetify.breakpoint.mdAndUp }]"
			:rounded="$vuetify.breakpoint.mdAndUp"
			two-line
		>
			<v-form ref="form" v-model="validForm" lazy-validation>
				<a href="https://docs.faithfulpack.net/pages/manuals/add-on-rules" target="_blank">
					<v-alert type="warning" class="pb-4" color="orange darken-3">
						<span style="color: inherit; text-decoration: underline">
							{{ $root.lang().addons.general.rules }}
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
							v-model="submittedForm.name"
							required
							clearable
							:rules="form.name.rules"
							:counter="form.name.counter.max"
							:label="$root.lang().addons.general.name.label"
							:hint="$root.lang().addons.general.name.hint"
						/>

						<!-- Addon authors selection -->
						<user-select
							v-model="submittedForm.authors"
							:users="users"
							:label="$root.lang().addons.general.authors.label"
							:hint="$root.lang().addons.general.authors.hint"
						/>

						<div v-if="!$vuetify.breakpoint.smAndDown" class="text-h5 mb-3">
							{{ $root.lang().addons.images.title }}
						</div>
					</div>
					<!-- RIGHT PART: HEADER IMAGE PREVIEW -->
					<div class="col-12 col-sm-3 d-flex px-0 pt-0 align-center">
						<div class="col">
							<div v-if="hasHeader" style="position: relative" class="mt-3">
								<v-img
									style="border-radius: 10px"
									:aspect-ratio="16 / 9"
									:src="header"
									@click.stop="() => (previewOpen = true)"
								/>
								<v-card
									class="ma-2"
									rounded
									style="display: inline-block; position: absolute; right: 0; top: 0"
								>
									<v-icon small class="ma-1" @click.stop="() => (previewOpen = true)">
										mdi-fullscreen
									</v-icon>
									<v-icon
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
								v-else
								:aspect-ratio="$vuetify.breakpoint.smAndDown ? undefined : 16 / 9"
								min-height="100px"
								class="mt-3"
							>
								<drop-zone
									v-model="submittedForm.headerFile"
									:disabled="disabledHeaderInput"
									accept="image/jpg, image/jpeg"
									style="height: 100%"
									@change="headerChange"
								>
									<span>
										<v-icon small>mdi-image</v-icon>
										{{ $root.lang().addons.images.header.labels.drop }}
									</span>
								</drop-zone>
							</v-responsive>
						</div>
					</div>
				</div>

				<div v-if="$vuetify.breakpoint.smAndDown" class="text-h5 mb-3">
					{{ $root.lang().addons.images.title }}
				</div>

				<!-- upload field for images -->
				<div class="py-5">
					<drop-zone
						v-model="submittedForm.carouselFiles"
						multiple
						accept="image/jpg, image/jpeg"
						style="height: 70px"
						@change="carouselChange"
					>
						<span>
							<v-icon small>mdi-image</v-icon>
							{{ $root.lang().addons.images.carousel.labels.drop }}
						</span>
					</drop-zone>
				</div>
				<image-previewer
					:sources="carouselSources"
					:ids="screenIds"
					@item-delete="onDeleteCarousel"
				/>

				<div class="text-h5 mb-3">{{ $root.lang().addons.titles.info }}</div>

				<!-- Addon description -->
				<tabbed-text-field
					v-model="submittedForm.description"
					:textareaProps="{
						clearable: true,
						rules: form.description.rules,
						counter: form.description.counter.max,
						hint: $root.lang().addons.info.description.hint,
						placeholder: $root.lang().addons.info.description.placeholder,
					}"
					:active-color="pageColor"
				/>

				<!-- Embed description -->
				<v-text-field
					v-model="submittedForm.embed_description"
					clearable
					:label="$root.lang().addons.info.embed_description.label"
					:hint="$root.lang().addons.info.embed_description.hint"
					:counter="form.embed_description.counter.max"
					persistent-hint
				/>

				<!-- only visible to admins on already-existing addons -->
				<v-text-field
					v-if="$root.isAdmin && !addonNew"
					v-model="submittedForm.slug"
					clearable
					:label="$root.lang().addons.general.slug.label"
					:hint="$root.lang().addons.general.slug.hint"
					:rules="form.slug.rules"
					:counter="form.slug.counter"
				/>

				<div class="text-h5 mb-3">{{ $root.lang().addons.compatibility.title }}</div>

				<v-chip-group
					v-model="submittedForm.selectedPacks"
					multiple
					mandatory
					class="d-flex flex-row align-center"
				>
					<span class="subtitle-1 text--secondary mt-1">
						{{ $root.lang().addons.compatibility.packs.label }}
					</span>
					<div class="px-2" />
					<v-chip
						v-for="pack in packs"
						:key="pack.value"
						filter
						:value="pack.value"
						:style="{ color: pack.color }"
					>
						{{ pack.label }}
					</v-chip>
				</v-chip-group>

				<v-chip-group
					v-model="submittedForm.selectedEditions"
					multiple
					mandatory
					class="d-flex flex-row align-center"
				>
					<span class="subtitle-1 text--secondary mt-1">
						{{ $root.lang().addons.compatibility.editions.label }}
					</span>
					<div class="px-2" />
					<v-chip
						v-for="edition in editions"
						:key="edition.value"
						filter
						:value="edition.value"
						:style="{ color: edition.color }"
					>
						{{ edition.value }}
					</v-chip>
				</v-chip-group>

				<v-checkbox
					v-model="submittedForm.options.optifine"
					class="pt-5"
					:label="$root.lang().addons.compatibility.optifine.label"
				/>

				<div class="text-h5">{{ $root.lang().addons.downloads.title }}</div>

				<v-row v-for="(obj, index) in submittedForm.downloads" :key="obj.key" class="mt-0">
					<v-col cols="12" sm="3">
						<v-text-field
							v-model="obj.key"
							clearable
							:placeholder="$root.lang().addons.downloads.name.placeholder"
							:label="$root.lang().addons.downloads.name.label"
							:rules="downloadTitleRules"
						/>
					</v-col>
					<v-col cols="12" sm="9">
						<v-row
							v-for="(link, indexLinks) in obj.links"
							:key="link"
							:style="{
								'align-items': 'baseline',
								'margin-top': indexLinks != 0 ? '-32px' : '-12px',
							}"
						>
							<v-col>
								<v-text-field
									v-model="obj.links[indexLinks]"
									clearable
									:placeholder="$root.lang().addons.downloads.link.placeholder"
									:label="$root.lang().addons.downloads.link.label"
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
				<div class="pb-3">
					<v-btn block color="secondary" @click="downloadAdd">
						{{ $root.lang().global.btn.add_download }}
						<v-icon right>mdi-plus</v-icon>
					</v-btn>
				</div>

				<div class="d-flex justify-end ma-2">
					<v-btn
						v-if="$root.isAdmin"
						:disabled="!validForm"
						color="primary"
						text
						@click="() => onSubmit(true)"
					>
						{{ $root.lang().global.btn.submit_and_approve }}
					</v-btn>
					<v-btn :disabled="!validForm" color="darken-1" text @click="() => onSubmit(false)">
						{{ $root.lang().global.btn.submit_for_review }}
					</v-btn>
				</div>
			</v-form>
		</v-list>
	</v-container>
</template>

<script>
import axios from "axios";

import UserSelect from "@components/user-select.vue";
import ImagePreviewer from "./image-previewer.vue";
import FullscreenPreview from "@components/fullscreen-preview.vue";
import DropZone from "@components/drop-zone.vue";
import TabbedTextField from "@components/tabbed-text-field.vue";

import { generatePageStyles } from "@helpers/colors.js";

export default {
	name: "addon-form",
	components: {
		UserSelect,
		ImagePreviewer,
		FullscreenPreview,
		DropZone,
		TabbedTextField,
	},
	props: {
		addonNew: {
			type: Boolean,
			required: false,
			default: false,
		},
		addonData: {
			type: Object,
			required: false,
			default: null,
		},
		loading: {
			type: Boolean,
			required: false,
			default: false,
		},
		headerSource: {
			type: String,
			required: false,
			default: "",
		},
		screenSources: {
			type: Array,
			required: false,
			default: () => [],
		},
		screenIds: {
			type: Array,
			required: false,
			default: undefined,
		},
		disabledHeaderInput: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	data() {
		return {
			pageColor: "yellow darken-3",
			pageStyles: "",
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
							(files) =>
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
									.filter((r) => typeof r === "string")[0] || true,
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
							!!desc || this.$root.lang().addons.info.description.rules.description_required,
						(desc) =>
							(desc && desc.length <= this.form.description.counter.max) ||
							this.$root
								.lang()
								.addons.info.description.rules.description_too_big.replace(
									"%s",
									this.form.description.counter.max,
								),
						(desc) =>
							(desc && desc.length >= this.form.description.counter.min) ||
							this.$root
								.lang()
								.addons.info.description.rules.description_too_small.replace(
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
								.addons.info.embed_description.rules.too_big.replace(
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
						min: 3,
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
				selectedPacks: [],
				options: {
					tags: [],
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
			// todo: move this to pack API when all packs are supported
			packs: [
				{ label: "Faithful 32x", value: "32x", color: "#00a2ff" },
				{ label: "Faithful 64x", value: "64x", color: "#ff0092" },
			],
			editions: [
				{ value: "Java", color: "#1dd96a" },
				{ value: "Bedrock", color: "#eee" },
			],
			users: [],
			previewOpen: false,
		};
	},
	computed: {
		hasHeader() {
			return this.header || this.headerURL;
		},
		header() {
			return this.addonNew
				? this.headerValidating == false && this.headerValid && this.submittedForm.headerFile
					? URL.createObjectURL(this.submittedForm.headerFile)
					: undefined
				: this.headerSource;
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
			const data = Object.merge({}, this.submittedForm);

			data.options.tags = [...data.selectedEditions, ...data.selectedPacks];
			delete data.selectedEditions;
			delete data.selectedPacks;

			// we treat files with different endpoint
			delete data.headerFile;
			delete data.carouselFiles;

			return data;
		},
		resolutions() {
			return this.packs.map((p) => p.value);
		},
	},
	methods: {
		carouselChange() {
			if (this.carouselDoNotVerify) return;

			const files = this.submittedForm.carouselFiles;
			if (!files || files.length == 0) return;

			this.carouselValidating = true;
			Promise.all(files.map((f) => this.verifyImage(f, this.is16x9)))
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
				if (this.addonNew) this.$emit("header", undefined, true);
				return;
			}

			// activate validation loading
			this.headerValidating = true;

			this.verifyImage(file, this.is16x9)
				.then(() => {
					this.headerValid = true;
					this.$emit("header", file);
					if (!this.addonNew) this.submittedForm.headerFile = undefined;
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
		is16x9(img) {
			return (img.width / img.height).toFixed(2) == 1.78;
		},
		validURL(str) {
			return String.urlRegex.test(str);
		},
		/** @param {(image: HTMLImageElement) => boolean} validateImage */
		verifyImage(file, validateImage) {
			if (validateImage === undefined) validateImage = this.is16x9;

			return new Promise((resolve, reject) => {
				// start reader
				const reader = new FileReader();

				const self = this;
				reader.onload = (e) => {
					const image = new Image();
					image.src = e.target.result;
					image.onload = function () {
						// do not use arrow fn
						const isValidImage = validateImage(this); // this is image now
						if (isValidImage) resolve();
						else reject(new Error(self.$root.lang().addons.images.header.rules.image_ratio));
					};
					image.onerror = () => reject(e);
				};
				reader.onerror = () => reject();

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
				.catch((err) => console.trace(err));
		},
	},
	watch: {
		addonData: {
			handler(data) {
				if (!this.addonNew && data) {
					data = JSON.parse(JSON.stringify(data));
					data.headerFile = undefined;
					data.carouselFiles = [];
					data.selectedPacks = data.options.tags.filter((e) => this.resolutions.includes(e));
					data.selectedEditions = data.options.tags.filter((e) =>
						this.editions.some((ed) => ed.value === e),
					);
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
	mount() {
		this.pageStyles = generatePageStyles(this, this.pageColor);
	}
};
</script>
