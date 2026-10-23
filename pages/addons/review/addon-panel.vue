<template>
	<article>
		<!-- image-previewer handles previews for screenshots -->
		<fullscreen-preview v-model="previewOpen" :src="header" />
		<v-card-title>
			<h1 class="text-h5">
				{{ addon.name }}
				<span class="text--secondary font-weight-light">{{ `#${addon.id}` }}</span>
			</h1>
			<v-spacer />
			<v-list-item-action class="my-0 merged-actions">
				<v-btn
					:href="`https://faithfulpack.net/addons/${addon.slug}`"
					target="_blank"
					rel="noopener noreferrer"
					:disabled="addon.approval.status !== 'approved'"
					:title="$root.lang().addons.general.go_to_addon"
					icon
				>
					<v-icon color="blue">mdi-open-in-new</v-icon>
				</v-btn>
				<v-btn :to="`/addons/edit/${addon.id}`" :title="$root.lang().global.btn.edit" icon>
					<v-icon>mdi-pencil</v-icon>
				</v-btn>
				<v-btn icon :title="$root.lang().global.btn.delete" @click="openRemoveModal">
					<v-icon color="red lighten-1">mdi-delete</v-icon>
				</v-btn>
			</v-list-item-action>
		</v-card-title>
		<v-card-subtitle class="text--secondary">{{ date }}</v-card-subtitle>
		<v-card-text>
			<v-row>
				<v-col cols="12" sm="8">
					<emitting-image
						v-if="header"
						:src="header"
						:aspect-ratio="16 / 9"
						@fullscreen="openHeader"
					/>
					<v-skeleton-loader v-else type="image" />
				</v-col>
				<v-col cols="12" sm="4">
					<h2 class="uppercase text--primary">
						{{ $root.lang().review.addon.titles.compatibility }}
					</h2>
					<div class="text--secondary mb-4">
						<div>
							<v-icon small>{{ checked(addon.options.tags.includes("Java")) }}</v-icon>
							Java Edition
						</div>
						<div>
							<v-icon small>{{ checked(addon.options.tags.includes("Bedrock")) }}</v-icon>
							Bedrock Edition
						</div>
						<div>
							<v-icon small>{{ checked(addon.options.optifine) }}</v-icon>
							{{ $root.lang().review.addon.labels.optifine }}
						</div>
					</div>

					<h2 class="uppercase text--primary mt-4">{{ authorTitle }}</h2>

					<!-- smaller than regular list so requires extra styling-->
					<v-list nav class="mx-n2 pa-0" style="background: transparent">
						<v-list-item
							v-for="author in addonAuthors"
							:key="author.id"
							:href="`https://faithfulpack.net/user/${author.id}`"
							target="_blank"
							rel="noopener noreferrer"
							class="pa-2 my-0"
							style="min-height: 0px"
						>
							<img
								:src="`https://vzge.me/face/64/${author.uuid || 'X-Steve'}`"
								:alt="
									$root.lang().global.account_manager.avatar_alt_text.replace('%s', author.username)
								"
								width="32"
								height="32"
							/>
							<v-list-item-content class="py-0 ps-2">
								<v-list-item-title>
									{{ author.username || $root.lang().database.anonymous }}
								</v-list-item-title>
								<v-list-item-subtitle>
									{{ author.id }}
								</v-list-item-subtitle>
							</v-list-item-content>
						</v-list-item>
					</v-list>
				</v-col>
			</v-row>

			<template v-if="screenshots.length > 0">
				<h2 class="uppercase text--primary mt-4">
					{{ $root.lang().addons.images.title }}
				</h2>
				<image-previewer :sources="screenshots" class="my-2" />
			</template>

			<h2 class="uppercase text--primary mt-4">
				{{ $root.lang().review.addon.titles.description }}
			</h2>

			<!-- eslint-disable vue/no-v-html -->
			<div
				class="mt-2 mb-4 text--primary overflow-x-hidden"
				v-html="$root.compileMarkdown(addon.description)"
			/>
			<!-- eslint-enable vue/no-v-html -->

			<h2 class="uppercase text--primary mt-4">
				{{ downloadTitle }}
			</h2>
			<v-btn
				v-for="{ name, source } in downloads"
				:key="source"
				:href="source"
				target="_blank"
				rel="noopener noreferrer"
				color="secondary"
				class="mt-2"
				block
			>
				<v-icon left>mdi-download</v-icon>
				{{ name }}
			</v-btn>
		</v-card-text>

		<!-- logic reused across mobile/desktop so we only need one modal if it's here -->
		<addon-remove-confirm
			v-model="removeModalOpen"
			:data="addon"
			review
			@close="(success) => success && $emit('delete')"
		/>
	</article>
</template>

<script>
import EmittingImage from "@components/emitting-image.vue";
import FullscreenPreview from "@components/fullscreen-preview.vue";
import ImagePreviewer from "../image-previewer.vue";
import AddonRemoveConfirm from "../addon-remove-confirm.vue";

export default {
	name: "addon-panel",
	components: {
		EmittingImage,
		FullscreenPreview,
		ImagePreviewer,
		AddonRemoveConfirm,
	},
	props: {
		addon: {
			type: Object,
			required: true,
		},
		files: {
			type: Array,
			required: false,
			default: () => [],
		},
		authors: {
			type: Array,
			required: false,
			default: () => [],
		},
	},
	data() {
		return {
			previewOpen: false,
			removeModalOpen: false,
		};
	},
	emits: ["delete"],
	methods: {
		openHeader() {
			this.previewOpen = true;
		},
		openRemoveModal() {
			this.removeModalOpen = true;
		},
		checked(option) {
			return option ? "mdi-checkbox-marked-outline" : "mdi-checkbox-blank-outline";
		},
	},
	computed: {
		header() {
			return this.files.find((f) => f.use === "header")?.source;
		},
		screenshots() {
			return this.files.filter((f) => f.use === "screenshot").map((f) => f.source);
		},
		downloads() {
			return this.files.filter((f) => f.use === "download");
		},
		date() {
			if (!this.addon.last_updated) return this.$root.lang().review.addon.titles.unknown_date;
			const formatted = this.$root.formatDate(this.addon.last_updated);
			return this.$root.lang().review.addon.titles.last_updated.replace("%s", formatted);
		},
		downloadTitle() {
			const key = this.downloads.length === 1 ? "download_singular" : "download_plural";
			return this.$root.lang().review.addon.titles[key];
		},
		authorTitle() {
			const key = this.addon.authors.length === 1 ? "author_singular" : "author_plural";
			return this.$root.lang().review.addon.titles[key];
		},
		addonAuthors() {
			return this.addon.authors.map((id) => this.authors.find((c) => c.id === id)) || [];
		},
	},
};
</script>
