<template>
	<dashboard-card
		id="addon-card"
		:title="$root.lang('dashboard.titles.addons')"
		go_to="/review/addons"
		:can_go_to="admin"
		class="d-flex flex-column justify-space-between"
	>
		<v-card-text class="pb-0 flex-grow-1 d-flex flex-column">
			<v-row v-if="!loading" dense class="d-flex align-stretch">
				<template v-for="status in statuses">
					<v-col
						v-if="data[status] !== undefined"
						:key="status"
						cols="12"
						:class="['d-flex align-stretch', adminResults ? 'col-sm-3' : '']"
					>
						<p class="mb-0 rounded-lg pa-2">
							<span :class="['v-card__title pa-0 d-inline', status_color[status]]">{{
								data[status] || 0
							}}</span>
							{{ $root.lang(`review.titles.${status}`) }}
						</p>
					</v-col>
				</template>
			</v-row>
			<v-row v-else dense id="status-loader" class="d-flex align-stretch">
				<v-col
					v-for="i in loading_for"
					:key="`skeleton-status-${i}`"
					cols="12"
					:class="['d-flex align-end', loading_for > 1 ? 'col-sm-3' : '']"
				>
					<div class="p mb-0 flex-grow-1 rounded-lg pa-2 d-flex align-center paragraph-loader">
						<div class="d-flex align-end">
							<v-skeleton-loader class="loader mr-1" width="30" height="24" type="heading" />
							<v-skeleton-loader class="loader" width="60" min-height="17" type="text" />
						</div>
					</div>
				</v-col>
			</v-row>

			<v-row class="mt-1 py-0 my-0 align-self-stretch" v-if="data" dense>
				<v-col
					v-for="(number, tag) in data.numbers"
					:key="tag"
					cols="12"
					sm="3"
					class="d-flex align-stretch"
				>
					<p class="mb-0 rounded-lg pa-2">
						<span class="v-card__title pa-0 d-inline text--primary">
							{{ number }}
						</span>
						{{ " " + tag }}
					</p>
				</v-col>
			</v-row>
			<v-row class="mt-1 py-0 my-0 align-self-stretch" v-else dense id="stats-loader">
				<v-col
					v-for="i in 4"
					:key="`skeleton-stats-${i}`"
					cols="12"
					sm="3"
					class="d-flex align-stretch"
				>
					<div class="p mb-0 flex-grow-1 rounded-lg pa-2 d-flex align-center paragraph-loader">
						<div class="d-flex align-end">
							<v-skeleton-loader class="loader mr-1" width="30" height="24" type="heading" />
							<v-skeleton-loader class="loader" width="60" min-height="17" type="text" />
						</div>
					</div>
				</v-col>
			</v-row>
		</v-card-text>

		<v-card-actions class="d-flex mt-0 px-4 pt-1">
			<v-row dense>
				<v-col>
					<v-btn block text color="primary" to="/addons/submissions">{{
						$root.lang().dashboard.addons.submissions
					}}</v-btn>
				</v-col>
				<v-col>
					<v-btn block text color="primary" to="/addons/new">{{
						$root.lang().dashboard.addons.upload
					}}</v-btn>
				</v-col>
			</v-row>
		</v-card-actions>
	</dashboard-card>
</template>

<script>
import axios from "axios";
import DashboardCard from "./dashboard-card.vue";

export default {
	name: "addon-card",
	components: {
		DashboardCard,
	},
	props: {
		admin: {
			required: true,
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			data: undefined,
			status_color: {
				approved: "success--text",
				pending: "warning--text",
				denied: "error--text",
				archived: "grey--text",
			},
			loading: true,
			loading_for: 1,
			request_admin: false,
		};
	},
	computed: {
		adminResults() {
			return this.data && Object.keys(this.data).length > 2;
		},
		statuses() {
			return Object.keys(this.status_color);
		},
		roles() {
			return this.$root.user.roles.length;
		},
		url() {
			if (this.admin) return "/addons/stats-admin";
			return "/addons/stats";
		},
	},
	methods: {
		get() {
			this.loading = true;
			axios
				.get(this.$root.apiURL + this.url, this.$root.apiOptions)
				.then((res) => {
					this.data = res.data;
				})
				.finally(() => {
					this.loading = false;
				});
		},
	},
	created() {
		this.get();
	},
	watch: {
		roles(n, o) {
			if (n != o && this.admin) {
				this.loading = true;
				this.loading_for = 4;
				this.get();
			}
		},
	},
};
</script>
