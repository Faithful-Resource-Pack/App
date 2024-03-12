<template>
	<v-container id="review-expanders">
		<fullscreen-preview ref="preview" :src="imagePreview" />

		<v-expansion-panel
			v-for="addon in addons"
			:key="addon.id"
			:ref="addon.id"
			rounded
			style="background-color: rgba(255, 255, 255, 0.05)"
			class="addon-expansion-panel"
			@click="getAddon(addon.id)"
		>
			<v-expansion-panel-header
				expand-icon="mdi-menu-down"
				:color="color"
				class="pa-4"
				style="height: auto !important"
			>
				<v-row no-gutters>
					<v-col cols="12" class="uppercase addon-name">
						{{ addon.name }}
					</v-col>
					<v-col cols="12" class="uppercase addon-tags" style="margin-top: 2.5px">
						{{ addon.options.tags.join(" | ") }}
					</v-col>
				</v-row>
			</v-expansion-panel-header>

			<v-expansion-panel-content>
				<template v-if="addonInPanelLoading === true">
					<p>{{ $root.lang().global.loading }}</p>
				</template>
				<template v-else>
					<div style="position: relative">
						<v-img
							@click.stop="
								(e) => {
									$refs.preview.open();
									imagePreview = addonInPanelHeaderURL;
								}
							"
							:src="addonInPanelHeaderURL"
							:aspect-ratio="16 / 9"
							style="border-radius: 5px"
							alt="Header not found!"
						>
							<template v-slot:placeholder>
								<v-row
									class="fill-height ma-0"
									align="center"
									justify="center"
									style="background-color: rgba(255, 255, 255, 0.1)"
								>
									<v-progress-circular
										v-if="addonInPanelHeaderURL != null"
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
							style="display: inline-block; position: absolute; right: 0; top: 0"
						>
							<v-icon
								small
								class="ma-1"
								@click.stop="
									(e) => {
										$refs.preview.open();
										imagePreview = addonInPanelHeaderURL;
									}
								"
							>
								mdi-fullscreen
							</v-icon>
						</v-card>
					</div>

					<v-list-item-title class="uppercase mt-2">{{
						$root.lang().review.addon.titles.authors
					}}</v-list-item-title>
					<div class="text--secondary mb-2">
						{{ addonInPanel.authors.map((id) => getUsername(id)).join(", ") }}
					</div>

					<v-list-item-title class="uppercase mt-2">{{
						$root.lang().review.addon.titles.links
					}}</v-list-item-title>
					<div class="text--secondary mb-2">
						<ul
							v-for="file in addonInPanel.files.filter((f) => f.use === 'download')"
							:key="file.id"
						>
							<li>
								{{ file.name }} -
								<a :href="file.source" class="text--secondary">
									{{ $root.lang().review.addon.labels.link }}
									<v-icon small color="light-blue">mdi-open-in-new</v-icon>
								</a>
							</li>
						</ul>
					</div>

					<v-list-item-title class="uppercase">{{
						$root.lang().review.addon.titles.options
					}}</v-list-item-title>
					<div>
						<v-icon small>{{
							addonInPanel.options.optifine
								? "mdi-checkbox-marked-outline"
								: "mdi-checkbox-blank-outline"
						}}</v-icon>
						{{ $root.lang().review.addon.labels.optifine }}
					</div>

					<template v-if="addonSources.length > 0">
						<v-list-item-title class="uppercase my-2">{{
							$root.lang().addons.images.title
						}}</v-list-item-title>
						<image-previewer :sources="addonSources" :deletable="false" />
					</template>

					<v-list-item-title class="uppercase my-2">{{
						$root.lang().review.addon.titles.description
					}}</v-list-item-title>
					<!-- eslint-disable vue/no-v-text-v-html-on-component -->
					<v-container
						class="markdown"
						:style="{
							'background-color': 'rgba(0,0,0, ' + String($root.isDark ? 0.2 : 0.05) + ')',
						}"
						v-html="$root.compiledMarkdown(addonInPanel.description)"
					/>

					<div v-if="addonInPanel.approval.status === 'approved'" class="my-2">
						<v-list-item-title class="uppercase">{{
							$root.lang().review.addon.labels.approved_by
						}}</v-list-item-title>
						<p class="text--secondary">{{ getUsername(addonInPanel.approval.author) }}</p>
					</div>

					<div
						v-if="
							addonInPanel.approval.status === 'denied' ||
							addonInPanel.approval.status === 'archived'
						"
						class="my-2"
					>
						<v-list-item-title class="uppercase">{{
							$root.lang().review.addon.labels.denied_by
						}}</v-list-item-title>
						<div class="text--secondary">{{ getUsername(addonInPanel.approval.author) }}</div>
						<v-list-item-title class="uppercase">{{
							$root.lang().review.addon.labels.reason
						}}</v-list-item-title>
						<div class="text--secondary">{{ addon.approval.reason }}</div>
					</div>

					<div class="text-right mt-4">
						<v-btn
							text
							color="teal"
							v-show="status != 'approved'"
							@click="reviewAddon(addon, 'approved')"
						>
							{{ $root.lang().global.btn.approve }} </v-btn
						><v-btn
							text
							color="red"
							v-show="status != 'denied'"
							@click="openDenyPopup(addonInPanel)"
						>
							{{ $root.lang().global.btn.deny }} </v-btn
						><v-btn
							text
							color="gray"
							v-show="status != 'archived'"
							@click="openDenyPopup(addonInPanel, 'archive')"
						>
							{{ $root.lang().global.btn.archive }} </v-btn
						><v-btn text color="yellow" :href="`/addons/edit/${addonInPanel.id}`">
							{{ $root.lang().global.btn.edit }}
						</v-btn>
					</div>
				</template>
			</v-expansion-panel-content>
		</v-expansion-panel>
	</v-container>
</template>

<script>
import axios from "axios";

import FullscreenPreview from "../addon/fullscreen-preview.vue";
import ImagePreviewer from "../addon/image-previewer.vue";

export default {
	name: "expansion-panel",
	components: {
		ImagePreviewer,
		FullscreenPreview,
	},
	props: {
		addons: {
			type: Array,
			required: true,
		},
		reviewAddon: {
			type: Function,
			required: true,
		},
		openDenyPopup: {
			type: Function,
			required: true,
		},
		contributors: {
			type: Array,
			required: true,
		},
		update: {
			type: Function,
			required: true,
		},
		status: {
			type: String,
			required: true,
		},
		color: {
			type: String,
			required: false,
			default: "primary",
		},
		value: {
			type: String,
			required: true,
		},
	},
	data() {
		return {
			imagePreview: "",
			dialogAddon: {},
			dialogOpen: false,

			addonInPanelLoading: true,
			addonInPanel: {},
			addonURL: undefined,
			addonInPanelHeaderURL: undefined,
		};
	},
	computed: {
		addonSources() {
			return (this.addonInPanel.files || [])
				.filter((f) => f.use === "carousel" || f.use === "screenshot")
				.map((f) => f.source);
		},
	},
	methods: {
		getAddon(id) {
			this.addonInPanelLoading = true;

			this.$emit("input", id);

			// allSettled if no header res
			Promise.allSettled([
				axios.get(`${this.$root.apiURL}/addons/${id}/all`, this.$root.apiOptions),
				axios.get(`${this.$root.apiURL}/addons/${id}/files/header`, this.$root.apiOptions),
			]).then(([res, header_res]) => {
				// void value if already here (closing tab)
				if (this.addonInPanel.id === res.value.data.id) {
					this.addonInPanel = {};
					this.addonInPanelLoading = true;
					return;
				}

				this.addonInPanel = res.value.data;
				this.addonInPanelLoading = false;

				if (header_res.value)
					this.addonInPanelHeaderURL = `${header_res.value.data}?t=${new Date().getTime()}`;
				else this.addonInPanelHeaderURL = null;
			});
		},
		openDialog() {
			this.dialogAddon = this.addonInPanel;
			this.dialogOpen = true;
		},
		closeDialog() {
			this.dialogOpen = false;
			this.dialogAddon = {};
			this.update();
		},
		getUsername(id) {
			if (id === null || id === undefined) return "Herobrine";
			return this.contributors.find((c) => c.id === id)?.username || "Unknown User";
		},
	},
	mounted() {
		const foundAddon = this.addons.find((a) => a.id === this.value);

		if (foundAddon) {
			const refs = this.$refs[this.value];
			if (refs === undefined) return;

			const ref = refs[0];
			ref.$children[0].$el.click();
		}
	},
};
</script>
