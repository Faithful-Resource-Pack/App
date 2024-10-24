<template>
	<v-container>
		<div class="text-h4 py-4">
			{{ $root.lang().addons.titles.submissions }}
			<v-progress-circular v-if="loading" indeterminate />
		</div>
		<div v-if="!loading && addons.length === 0">
			{{ error || $root.lang().global.no_results }}
		</div>
		<div v-else class="my-2 text-h5">
			<card-grid :items="addons" :getImage="(addon) => getHeaderImg(addon.id)">
				<template #title="{ name, options }">
					<v-card-title>{{ name }}</v-card-title>
					<v-card-subtitle>{{ options.tags.join(", ") }}</v-card-subtitle>
				</template>
				<template #text="{ approval, slug }">
					<v-badge dot inline :color="getStatusColor(approval.status)" />
					{{ $root.lang().addons.status[approval.status] }}
					<v-btn
						v-if="approval.status == 'approved'"
						color="blue"
						:href="`https://www.faithfulpack.net/addons/${slug}`"
						target="_blank"
						icon
						small
					>
						<v-icon small>mdi-open-in-new</v-icon>
					</v-btn>
					<div v-if="approval.status === 'denied'">
						{{ $root.lang().review.addon.labels.reason }}: {{ approval.reason }}
					</div>
				</template>
				<template #btns="addon">
					<v-btn text :href="`/addons/edit/${addon.id}`">
						{{ $root.lang().global.btn.edit }}
					</v-btn>
					<v-btn color="red" text @click="deleteAddon(addon)">
						{{ $root.lang().global.btn.delete }}
					</v-btn>
				</template>
			</card-grid>
		</div>

		<addon-remove-confirm
			v-model="remove.confirm"
			@close="
				() => {
					remove.confirm = false;
					update();
				}
			"
			:data="remove.data"
		/>
	</v-container>
</template>

<script>
import axios from "axios";

import AddonRemoveConfirm from "./addon-remove-confirm.vue";
import CardGrid from "@components/card-grid.vue";

export default {
	name: "addon-submissions",
	components: {
		AddonRemoveConfirm,
		CardGrid,
	},
	data() {
		return {
			addons: [],
			remove: {
				confirm: false,
				data: {},
			},
			error: undefined,
			loading: true,
			failed: {},
			timestamp: new Date().getTime(),
		};
	},
	methods: {
		getStatusColor(status) {
			switch (status) {
				case "approved":
					return "green";
				case "pending":
					return "yellow";
				default:
					return "red";
			}
		},
		deleteAddon(addon) {
			this.remove.data = addon;
			this.remove.confirm = true;
		},
		getAddons(authorID) {
			axios
				.get(`${this.$root.apiURL}/users/${authorID}/addons`, this.$root.apiOptions)
				.then((res) => {
					this.addons = res.data;
					this.$forceUpdate();
				})
				.catch((e) => {
					console.error(e);
					this.error = `${e.statusCode}: ${e.response.value}`;
				})
				.finally(() => {
					this.loading = false;
				});
		},
		getHeaderImg(id) {
			return `${this.$root.apiURL}/addons/${id}/header?discord=${this.$root.user.access_token}&t=${this.timestamp}`;
		},
		update() {
			this.getAddons(this.$root.user.id);
			this.$forceUpdate();
		},
	},
	mounted() {
		this.getAddons(this.$root.user.id);
	},
};
</script>
