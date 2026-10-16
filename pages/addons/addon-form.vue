<template>
	<v-card class="main-container mb-2 pa-4">
		<loading-page v-if="loading" class="py-10">
			{{ $root.lang().addons.general.loading_addon }}
		</loading-page>
		<v-form v-else ref="form" v-model="validForm" lazy-validation>
			<a
				href="https://docs.faithfulpack.net/pages/manuals/add-on-rules"
				target="_blank"
				rel="noopener noreferrer"
			>
				<v-alert type="warning" class="pb-4" color="orange darken-3">
					<span style="color: inherit; text-decoration: underline">
						{{ $root.lang().addons.general.rules }}
					</span>
					<v-icon small>mdi-open-in-new</v-icon>
				</v-alert>
			</a>

			<h2 class="text-h5">{{ $root.lang().addons.general.title }}</h2>
			<v-row>
				<!-- LEFT PART : INPUT -->
				<v-col :class="{ 'pb-0': $vuetify.breakpoint.smAndDown }">
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
				</v-col>
				<!-- RIGHT PART: HEADER IMAGE PREVIEW -->
				<v-col
					cols="12"
					sm="3"
					class="d-flex align-center"
					:class="{ 'pt-0 pb-7': $vuetify.breakpoint.smAndDown }"
				>
					<v-responsive
						:aspect-ratio="$vuetify.breakpoint.smAndDown ? undefined : 16 / 9"
						min-height="100px"
					>
						<emitting-image
							v-if="header"
							deletable
							:src="header"
							@fullscreen="openPreview"
							@delete="removeHeader"
						/>
						<drop-zone
							v-else
							v-model="submittedForm.headerFile"
							:disabled="disabledHeaderInput"
							accept="image/jpg, image/jpeg"
							style="height: 100%"
							@change="updateHeader"
						>
							<v-icon small>mdi-image</v-icon>
							{{ $root.lang().addons.images.header.labels.drop }}
						</drop-zone>
					</v-responsive>
				</v-col>
			</v-row>

			<!-- only on already-existing addons -->
			<v-text-field
				v-if="!addonNew"
				v-model="submittedForm.slug"
				clearable
				disabled
				:label="$root.lang().addons.general.slug.label"
				:hint="$root.lang().addons.general.slug.hint"
				:rules="form.slug.rules"
				:counter="form.slug.counter.max"
			/>

			<h2 class="text-h5 my-3">
				{{ $root.lang().addons.images.title }}
			</h2>

			<!-- upload field for images -->
			<div class="my-5">
				<drop-zone
					v-model="submittedForm.screenshots"
					multiple
					accept="image/jpg, image/jpeg"
					style="height: 70px"
					@change="onScreenshotChange"
				>
					<v-icon small>mdi-image</v-icon>
					{{ $root.lang().addons.images.screenshots.labels.drop }}
				</drop-zone>
			</div>

			<image-previewer
				deletable
				:sources="screenSources"
				:ids="screenIds"
				@delete="removeScreenshot"
			/>

			<h2 class="text-h5 mb-3">{{ $root.lang().addons.titles.info }}</h2>

			<!-- Addon description -->
			<tabbed-text-field
				v-model="submittedForm.description"
				class="mb-3"
				:textareaProps="{
					clearable: true,
					rules: form.description.rules,
					counter: form.description.counter.max,
					hint: $root.lang().addons.info.description.hint,
					placeholder: $root.lang().addons.info.description.placeholder,
				}"
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

			<h2 class="text-h5 mb-3">{{ $root.lang().addons.compatibility.title }}</h2>
			<v-chip-group
				v-model="submittedForm.options.packs"
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
					:key="pack.id"
					filter
					:value="pack.id"
					:style="{ color: pack.color }"
				>
					{{ pack.name }}
				</v-chip>
			</v-chip-group>

			<v-chip-group
				v-model="submittedForm.options.tags"
				multiple
				mandatory
				class="d-flex flex-row align-center"
			>
				<span class="subtitle-1 text--secondary mt-1">
					{{ $root.lang().addons.compatibility.editions.label }}
				</span>
				<div class="px-2" />
				<v-chip
					v-for="edition in tags"
					:key="edition.name"
					filter
					:value="edition.name"
					:style="{ color: edition.color }"
				>
					{{ edition.name }}
				</v-chip>
			</v-chip-group>

			<v-checkbox
				v-model="submittedForm.options.optifine"
				class="pt-5"
				:label="$root.lang().addons.compatibility.optifine.label"
			/>

			<h2 class="text-h5">{{ $root.lang().addons.downloads.title }}</h2>

			<!-- cannot use obj.key as index since it rerenders the form on change otherwise -->
			<v-row v-for="(obj, index) in submittedForm.downloads" :key="index" class="mt-1">
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
						v-for="(_link, indexLinks) in obj.links"
						:key="indexLinks"
						class="align-baseline"
						dense
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
						<v-col class="flex-grow-0 flex-shrink-0">
							<v-btn
								v-if="indexLinks === 0"
								icon
								:title="$root.lang().addons.downloads.add_item"
								@click="addDownloadLink(index)"
							>
								<v-icon color="lighten-1">mdi-plus</v-icon>
							</v-btn>
							<v-btn
								v-else
								icon
								:title="$root.lang().addons.downloads.remove_item"
								@click="removeDownloadLink(index, indexLinks)"
							>
								<v-icon color="red lighten-1">mdi-minus</v-icon>
							</v-btn>
						</v-col>
						<v-col v-if="index !== 0 && indexLinks === 0" class="flex-grow-0 flex-shrink-0">
							<v-btn
								icon
								:title="$root.lang().addons.downloads.remove_group"
								@click="removeDownloadGroup(index)"
							>
								<v-icon color="red lighten-1">mdi-delete</v-icon>
							</v-btn>
						</v-col>
					</v-row>
				</v-col>
			</v-row>
			<v-btn block color="secondary" @click="addDownloadGroup">
				<v-icon left>mdi-playlist-plus</v-icon>
				{{ $root.lang().addons.downloads.add_group }}
			</v-btn>

			<v-card-actions class="form-actions mt-5">
				<v-btn
					:disabled="!validForm"
					:loading="submitting"
					color="darken-1"
					text
					@click="onSubmit(false)"
				>
					{{ $root.lang().global.btn.submit_for_review }}
				</v-btn>
				<v-btn
					v-if="$root.isAdmin"
					:disabled="!validForm"
					:loading="submitting"
					color="primary"
					text
					@click="onSubmit(true)"
				>
					{{ $root.lang().global.btn.submit_and_approve }}
				</v-btn>
			</v-card-actions>
		</v-form>

		<fullscreen-preview v-model="previewOpen" :src="header" />
	</v-card>
</template>

<script>
import axios from "axios";

import ImagePreviewer from "./image-previewer.vue";
import EmittingImage from "@components/emitting-image.vue";
import FullscreenPreview from "@components/fullscreen-preview.vue";
import DropZone from "@components/drop-zone.vue";
import TabbedTextField from "@components/tabbed-text-field.vue";
import UserSelect from "@components/user-select.vue";
import LoadingPage from "@layouts/loading-page.vue";
import { is16x9, verifyImage } from "@helpers/images";

export default {
	name: "addon-form",
	components: {
		EmittingImage,
		ImagePreviewer,
		FullscreenPreview,
		DropZone,
		TabbedTextField,
		UserSelect,
		LoadingPage,
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
		submitting: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	emits: ["header", "screenshot", "submit"],
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
					screenshots: {
						rules: [
							(files) =>
								files.every((file) => file.size < this.form.files.screenshots.counter.max) ||
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
				screenshots: [],
				description: "",
				downloads: [
					{
						key: "",
						links: [""],
					},
				],
				authors: [],
				options: {
					tags: [],
					packs: [],
					optifine: false,
				},
			},
			headerValid: false,
			headerValidating: false,
			headerError: "",
			screenshotDoNotVerify: false,
			downloadTitleRules: [
				(u) => !!u || this.$root.lang().addons.downloads.name.rules.name_required,
				(u) => u !== " " || this.$root.lang().addons.downloads.name.rules.name_cannot_be_empty,
			],
			downloadLinkRules: [
				(u) => String.urlRegex.test(u) || this.$root.lang().addons.downloads.link.rule,
			],
			validForm: false,
			packs: {},
			// todo: make this a real tag list
			tags: [
				{ name: "Java", color: "#1dd96a" },
				{ name: "Bedrock", color: "#eee" },
			],
			users: [],
			previewOpen: false,
		};
	},
	methods: {
		updateHeader(file) {
			// delete not uploaded file
			if (!file) {
				if (this.addonNew) this.$emit("header", undefined, true);
				return;
			}

			// activate validation loading
			this.headerValidating = true;

			verifyImage(file, is16x9, this.$root.lang().addons.images.header.rules.image_ratio)
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

					this.$root.showSnackbar(error.message, "error");
				})
				.finally(() => {
					this.headerValidating = false;
				});
		},
		removeHeader() {
			this.$emit("header", undefined, true);
			this.submittedForm.headerFile = undefined;
		},
		// submittedForm.screenshots has already been updated, not param
		onScreenshotChange() {
			if (this.screenshotDoNotVerify) return;

			const files = this.submittedForm.screenshots;
			if (!files || !files.length) return;

			Promise.all(
				files.map((f) =>
					verifyImage(f, is16x9, this.$root.lang().addons.images.header.rules.image_ratio),
				),
			)
				.then(() => {
					this.$emit("screenshots", files);
					this.submittedForm.screenshots = [];
				})
				.catch((error) => {
					console.error(error);
					this.$root.showSnackbar(error, "error");
				});
		},
		removeScreenshot(_item, index, id) {
			this.screenshotDoNotVerify = true;
			this.submittedForm.screenshots.splice(index, 1);
			this.$emit("screenshots", undefined, index, true, id);
			this.$nextTick(() => {
				this.screenshotDoNotVerify = false;
			});
		},
		addDownloadGroup() {
			this.submittedForm.downloads.push({ key: "", links: [""] });
		},
		removeDownloadGroup(downloadIndex) {
			this.submittedForm.downloads.splice(downloadIndex, 1);
		},
		addDownloadLink(downloadIndex) {
			this.submittedForm.downloads[downloadIndex].links.push("");
		},
		removeDownloadLink(downloadIndex, linkIndex) {
			this.submittedForm.downloads[downloadIndex].links.splice(linkIndex, 1);
		},
		openPreview() {
			this.previewOpen = true;
		},
		onSubmit(approve = false) {
			const valid = this.$refs.form.validate();
			if (!valid) return;

			this.$emit("submit", this.submittedData, approve);
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
		getPacks() {
			axios.get(`${this.$root.apiURL}/packs/search?tag=addons`).then((res) => {
				this.packs = res.data;
			});
		},
	},
	computed: {
		header() {
			if (!this.addonNew) return this.headerSource;
			if (this.headerValidating || !this.headerValid || !this.submittedForm.headerFile) return;
			return URL.createObjectURL(this.submittedForm.headerFile);
		},
		submittedData() {
			const data = structuredClone(this.submittedForm);

			// we treat files with different endpoint
			delete data.headerFile;
			delete data.screenshots;

			return data;
		},
	},
	watch: {
		addonData: {
			handler(data) {
				if (this.addonNew || !data) return;

				// deep copy
				data = structuredClone(data);
				data.headerFile = undefined;
				data.screenshots = [];
				this.submittedForm = data;
			},
			immediate: true,
			deep: true,
		},
	},
	beforeMount() {
		this.getUsers();
		this.getPacks();
		this.submittedForm.authors = [this.$root.user.id];
	},
};
</script>
