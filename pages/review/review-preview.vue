<template>
	<div id="review-preview" class="d-flex flex-column">
		<v-card flat style="height: 100%" class="rounded-lg pa-2 overflow-x-hidden">
			<fullscreen-preview v-model="previewOpen" :src="addonInPanelHeaderURL" />
			<template v-if="addonInPanelLoading === true">
				<p>{{ $root.lang().global.loading }}</p>
			</template>
			<template v-else>
				<div class="pb-2 d-flex align-center">
					<div>
						<h2 class="h6" style="line-height: 24px">
							{{ addonInPanel.name }}
							<span class="text--secondary font-weight-regular">{{ `#${addonInPanel.id}` }}</span>
						</h2>
						<div class="text--secondary subtitle-2 mt-1" style="line-height: 14px">
							{{
								Array.from(addonInPanel.options.tags || [])
									.sort()
									.join(" • ")
							}}
						</div>
					</div>
					<v-btn id="edit-btn" icon class="ml-auto" :href="`/addons/edit/${addonInPanel.id}`">
						<v-icon>mdi-pencil</v-icon>
					</v-btn>
				</div>
				<v-row id="review-general">
					<v-col cols="12" sm="7" style="position: relative">
						<v-img
							:src="addonInPanelHeaderURL"
							:aspect-ratio="16 / 9"
							style="border-radius: 5px"
							alt="Header not found!"
							class="cursor-pointer"
							@click.stop="openHeader"
						>
							<template #placeholder>
								<v-row
									class="fill-height ma-0"
									align="center"
									justify="center"
									style="background-color: rgba(255, 255, 255, 0.1)"
								>
									<v-progress-circular
										v-if="addonInPanelHeaderURL !== null"
										indeterminate
										color="grey lighten-5"
									/>
									<v-icon v-else x-large>mdi-image-off</v-icon>
								</v-row>
							</template>
						</v-img>

						<v-card
							class="ma-2"
							rounded
							style="display: inline-block; position: absolute; right: 10px; top: 10px"
						>
							<v-icon small class="ma-1" @click.stop="openHeader">mdi-fullscreen</v-icon>
						</v-card>
					</v-col>
					<v-col cols="12" sm="5">
						<addon-info :addonInPanel="addonInPanel" :getUsername="getUsername" />
					</v-col>
				</v-row>

				<template v-if="addonSources.length > 0">
					<v-list-item-title class="uppercase my-2">
						{{ $root.lang().addons.images.title }}
					</v-list-item-title>
					<image-previewer :sources="addonSources" :deletable="false" />
				</template>

				<v-list-item-title class="uppercase pb-2 py-4">
					{{ $root.lang().review.addon.titles.description }}
				</v-list-item-title>

				<!-- eslint-disable-next-line vue/no-v-html -->
				<div v-html="$root.compileMarkdown(addonInPanel.description)" />
			</template>
		</v-card>
		<div v-if="status === 'pending'" class="mt-2 rounded-lg pa-2">
			<v-list-item-title class="uppercase pb-1">
				{{ $root.lang().addons.general.reason.title }}
			</v-list-item-title>
			<div>{{ addonInPanel.approval.reason }}</div>
		</div>
		<div v-if="addonInPanelLoading === false" id="review-actions" class="mt-2 rounded-lg pa-2">
			<div class="d-flex align-center">
				<div class="mr-auto">
					<div v-if="status === 'approved'">
						{{ $root.lang().review.addon.labels.approved_by.replace("%s", approvalAuthor) }}
					</div>
					<div v-if="status === 'denied' || status === 'archived'">
						<v-list-item-title class="uppercase">
							{{ $root.lang().review.addon.labels.denied_by.replace("%s", approvalAuthor) }}:
						</v-list-item-title>
						<p class="text--secondary">{{ addonInPanel.approval.reason }}</p>
					</div>
				</div>
				<v-btn
					text
					color="green"
					:disabled="status === 'approved'"
					@click="reviewAddon(addonId, 'approved')"
				>
					{{ $root.lang().global.btn.approve }}
				</v-btn>
				<v-btn
					text
					color="red"
					:disabled="status === 'denied'"
					@click="openDenyPopup(addonInPanel)"
				>
					{{ $root.lang().global.btn.deny }}
				</v-btn>
				<v-btn
					text
					color="gray"
					:disabled="status === 'archived'"
					@click="openDenyPopup(addonInPanel, 'archive')"
				>
					{{ $root.lang().global.btn.archive }}
				</v-btn>
			</div>
		</div>
	</div>
</template>

<script>
import axios from "axios";

import FullscreenPreview from "@components/fullscreen-preview.vue";
import ImagePreviewer from "../addon/image-previewer.vue";
import AddonInfo from "./addon-info.vue";

export default {
	name: "review-preview",
	components: {
		FullscreenPreview,
		ImagePreviewer,
		AddonInfo,
	},
	props: {
		addonId: {
			type: String,
			required: false,
			default: undefined,
		},
	},
	data() {
		return {
			modalData: {},
			modalOpen: false,
			previewOpen: false,
			addonInPanelLoading: true,
			addonInPanel: {},
			addonInPanelHeaderURL: "",
			contributors: [],
		};
	},
	methods: {
		getAddon(id) {
			this.addonInPanelLoading = true;

			// allSettled if no header res
			Promise.allSettled([
				axios.get(`${this.$root.apiURL}/addons/${id}/all`, this.$root.apiOptions),
				axios.get(`${this.$root.apiURL}/addons/${id}/files/header`, this.$root.apiOptions),
			]).then(([res, headerRes]) => {
				// void value if already here (closing tab)
				if (this.addonInPanel.id === res.value.data.id) {
					this.addonInPanel = {};
					this.addonInPanelLoading = true;
					return;
				}

				this.addonInPanel = res.value.data;
				this.addonInPanelLoading = false;

				if (headerRes.value)
					this.addonInPanelHeaderURL = `${headerRes.value.data}?t=${new Date().getTime()}`;
				else this.addonInPanelHeaderURL = null;
			});
		},
		openModal() {
			this.modalData = this.addonInPanel;
			this.modalOpen = true;
		},
		closeModal() {
			this.modalOpen = false;
			this.modalData = {};
			this.update();
		},
		getUsername(id) {
			if (id === null || id === undefined) return "Herobrine";
			return this.contributors.find((c) => c.id === id)?.username || "Unknown User";
		},
		openHeader() {
			this.previewOpen = true;
		},
		openDenyPopup(...args) {
			this.$root.$emit("openDenyPopup", args);
		},
		reviewAddon(...args) {
			this.$root.$emit("reviewAddon", args);
		},
	},
	computed: {
		addonSources() {
			return (this.addonInPanel.files || [])
				.filter((f) => f.use === "carousel" || f.use === "screenshot")
				.map((f) => f.source);
		},
		status() {
			return this.addonInPanel && this.addonInPanel.approval
				? this.addonInPanel.approval.status
				: undefined;
		},
		approvalAuthor() {
			return this.getUsername(this.addonInPanel.approval.author);
		},
	},
	watch: {
		addonId: {
			handler(n) {
				if (n === undefined) return;
				this.getAddon(n);
			},
			immediate: true,
		},
	},
	created() {
		axios
			.get(`${this.$root.apiURL}/users/names`)
			.then((res) => {
				this.contributors = res.data;
			})
			.catch((err) => {
				console.error(err);
				this.$root.showSnackBar(err, "error");
			});
	},
};
</script>
