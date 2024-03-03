<template>
	<v-container>
		<div class="text-h4 py-4">
			{{ $root.lang().addons.titles.submissions }}
			<v-progress-circular v-if="loading" indeterminate />
		</div>

		<div v-if="loading == false && addons.length == 0">
			{{ $root.lang().global.no_results }}
		</div>
		<div v-else class="my-2 text-h5">
			<v-row>
				<v-col
					:cols="$vuetify.breakpoint.mdAndUp ? 4 : $vuetify.breakpoint.smAndUp ? 6 : 12"
					v-for="addon in addons"
					:key="addon.id"
				>
					<v-card style="background-color: rgba(255, 255, 255, 0.05)">
						<v-img
							style="border-radius: 5px"
							:src="
								$root.apiURL +
								'/addons/' +
								addon.id +
								'/header?discord=' +
								$root.user.access_token +
								'&t=' +
								timestamp
							"
							:aspect-ratio="16 / 9"
							@error="
								() => {
									failed[addon.id] = true;
									$forceUpdate();
									return false;
								}
							"
						>
							<template v-slot:placeholder>
								<v-row
									class="fill-height ma-0"
									align="center"
									justify="center"
									style="background-color: rgba(255, 255, 255, 0.1)"
								>
									<v-icon v-if="failed[addon.id]" x-large>mdi-image-off</v-icon>
									<v-progress-circular v-else indeterminate color="grey lighten-5" />
								</v-row>
							</template>
						</v-img>
						<v-card-title v-text="addon.name" />
						<v-card-subtitle v-text="addon.options.tags.join(', ')" />
						<v-card-text style="height: 60px">
							<v-badge
								dot
								inline
								:color="
									addon.approval.status == 'approved'
										? 'green'
										: addon.approval.status == 'pending'
											? 'yellow'
											: 'red'
								"
							/>
							{{ $root.lang().addons.status[addon.approval.status] }}
							<v-btn
								v-if="addon.approval.status == 'approved'"
								color="blue"
								:href="'https://www.faithfulpack.net/addons/' + addon.slug"
								target="_blank"
								icon
								small
							>
								<v-icon small>mdi-open-in-new</v-icon>
							</v-btn>
							<div v-if="addon.approval.status === 'denied'">
								{{ $root.lang().review.addon.labels.reason }}: {{ addon.approval.reason }}
							</div>
						</v-card-text>

						<v-card-actions style="justify-content: flex-end">
							<v-btn text :href="'/addons/edit/' + addon.id">
								{{ $root.lang().global.btn.edit }}
							</v-btn>
							<v-btn color="red" text @click="deleteAddon(addon)">
								{{ $root.lang().global.btn.delete }}
							</v-btn>
						</v-card-actions>
					</v-card>
				</v-col>
			</v-row>
		</div>

		<remove-confirm
			:confirm="remove.confirm"
			:disableDialog="
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

const RemoveConfirm = () => import("./remove-confirm.vue");

export default {
	name: "addon-submissions",
	components: {
		RemoveConfirm,
	},
	data() {
		return {
			addons: [],
			remove: {
				confirm: false,
				data: {},
			},
			dialogAddon: {},
			dialogOpen: false,
			loading: true,
			failed: {},
			timestamp: new Date().getTime(),
		};
	},
	methods: {
		closeDialog() {
			this.dialogOpen = false;
			this.dialogAddon = {};
			this.update();
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
					this.loading = false;
					this.$forceUpdate();
				})
				.catch((err) => {
					console.error(err);
				});
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
