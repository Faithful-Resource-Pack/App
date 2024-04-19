<template>
	<div class="container">
		<h4 class="text-h4 py-4">
			{{ $root.lang().addons.titles.edit }} <span id="addon-id">#{{ this.id }}</span>
		</h4>
		<addon-form
			class="pa-0"
			:addon-new="false"
			:loading="loading"
			:addon-data="addonData"
			:disabled-header-input="hidisabled"
			:screen-sources="screenSources"
			:screen-ids="screenIds"
			:header-source="headerSource"
			@submit="handleSubmit"
			@header="handleHeader"
			@screenshot="handleScreenshot"
		/>
		<v-dialog v-model="reasonDialog" max-width="600px">
			<v-card>
				<v-card-title class="headline">
					{{ this.$root.lang("addons.general.reason.title") }}
				</v-card-title>
				<v-card-text>
					<v-form lazy-validation v-model="validForm" ref="reasonForm">
						<p>{{ this.$root.lang("addons.general.reason.text") }}</p>
						<v-text-field
							:label="$root.lang('addons.general.reason.title')"
							required
							:rules="reasonRules"
							v-model="reason"
							:counter="reasonCounter.max"
						/>
						<v-card-actions>
							<v-spacer />
							<v-btn color="red darken-1" text @click="() => handleReasonDialog(false)">
								{{ $root.lang("global.btn.cancel") }}
							</v-btn>
							<v-btn color="darken-1" text @click="() => handleReasonDialog(true)">
								{{ $root.lang("global.btn.submit") }}
							</v-btn>
						</v-card-actions>
					</v-form>
				</v-card-text>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import axios from "axios";
import AddonForm from "./addon-form.vue";

export default {
	name: "edit-addon-form",
	components: {
		AddonForm,
	},
	data() {
		return {
			hidisabled: false,
			reasonDialog: false,
			reasonData: undefined,
			reasonRules: [
				() =>
					!!(this.reason && this.reason.trim()) ||
					this.$root.lang("addons.general.reason.required"),
				() =>
					this.reason.trim().length < this.reasonCounter.min ||
					this.reason.trim().length > this.reasonCounter.max
						? this.$root
								.lang("addons.general.reason.bounds")
								.replace("%s", this.reasonCounter.min)
								.replace("%s", this.reasonCounter.max)
						: true,
			],
			reasonCounter: {
				min: 5,
				max: 150,
			},
			reason: "",
			validForm: false,
			addonData: undefined,
			headerSource: undefined,
			screenSources: [],
			screenIds: [],
		};
	},
	computed: {
		loading() {
			return this.addonData === undefined;
		},
		id() {
			return this.$route.params.id;
		},
	},
	methods: {
		handleReasonDialog(submitted) {
			const valid = this.$refs.reasonForm.validate();
			if (!valid) return;

			this.reasonDialog = false;
			if (submitted) this.confirmSubmit(this.reasonData, false);
			else this.reason = "";
		},
		handleSubmit(data, approve) {
			if (!approve) {
				this.reasonData = data;
				this.reasonDialog = true;
			} else {
				this.confirmSubmit(data, approve);
			}
		},
		confirmSubmit(data, approve) {
			if (approve) data.reason = "Manager edit";
			else {
				data.reason = this.reason.trim();
				this.reason = "";
			}
			let prom = axios
				.patch(`${this.$root.apiURL}/addons/${this.id}`, data, this.$root.apiOptions)
				.then(() => {
					this.$root.showSnackBar("Saved", "success");
				});

			if (approve === true) {
				prom = prom
					.then(() =>
						axios.put(
							`${this.$root.apiURL}/addons/${this.id}/review`,
							{
								status: "approved",
								reason: "Manager edit",
							},
							this.$root.apiOptions,
						),
					)
					.then(() => this.$root.showSnackBar("Approved", "success"));
			}

			prom.catch((err) => this.$root.showSnackBar(err, "error"));
		},
		handleHeader(file, remove = false) {
			this.hidisabled = true;

			let promise;
			if (remove) {
				promise = axios.delete(
					`${this.$root.apiURL}/addons/${this.id}/header`,
					this.$root.apiOptions,
				);
			} else {
				const form = new FormData();
				form.set("file", file, file.name);
				promise = axios.post(
					`${this.$root.apiURL}/addons/${this.id}/header`,
					form,
					this.$root.apiOptions,
				);
			}

			promise
				.then(() => {
					this.getHeader();
					this.$root.showSnackBar(
						"Successfully " + (remove ? "removed" : "uploaded") + " header image",
						"success",
					);
				})
				.catch((err) => {
					console.error(err);
					this.$root.showSnackBar(err, "error");
				})
				.finally(() => {
					this.hidisabled = false;
				});
		},
		getHeader() {
			axios
				.get(`${this.$root.apiURL}/addons/${this.id}/files/header`, this.$root.apiOptions)
				.then((res) => {
					this.headerSource = `${res.data}?t=${new Date().getTime()}`;
				})
				.catch(() => {
					this.headerSource = undefined;
				});
		},
		async handleScreenshot(screenshots, index, remove = false, id) {
			if (Array.isArray(screenshots) && screenshots.length === 0) return;

			let promise;
			if (remove) {
				if (id !== undefined) {
					promise = axios.delete(
						`${this.$root.apiURL}/addons/${this.id}/screenshots/${id}`,
						this.$root.apiOptions,
					);
				} else {
					promise = axios.delete(
						`${this.$root.apiURL}/addons/${this.id}/screenshots/${index}`,
						this.$root.apiOptions,
					);
				}
			} else {
				// add all of them
				// fix to stabilize upload and make one request then another...
				let i = 0;
				let successful = true;
				let err;
				while (i < screenshots.length && successful) {
					const screen = screenshots[i];
					const form = new FormData();
					form.set("file", screen, screen.name);

					successful = await axios
						.post(`${this.$root.apiURL}/addons/${this.id}/screenshots`, form, this.$root.apiOptions)
						.then(() => true)
						.catch((error) => {
							err = error;
							return false;
						});

					i++;
				}

				promise = successful ? Promise.resolve() : Promise.reject(err);
			}

			promise
				.then(() => {
					this.getScreens();
					this.$root.showSnackBar(
						"Successfully " + (remove ? "removed" : "uploaded") + " screenshots",
						"success",
					);
				})
				.catch((err) => {
					console.error(err);
					this.$root.showSnackBar(err, "error");
				});
		},
		getScreens() {
			axios
				.get(
					`${this.$root.apiURL}/addons/${this.id || this.$route.params.id}/files/screenshots`,
					this.$root.apiOptions,
				)
				.then((res) => {
					this.screenSources = res.data;
				});
			axios
				.get(
					`${this.$root.apiURL}/addons/${this.id || this.$route.params.id}/files/screenshots-ids`,
					this.$root.apiOptions,
				)
				.then((res) => {
					this.screenIds = res.data;
				});
		},
	},
	created() {
		this.getHeader();
		this.getScreens();
		Promise.all([
			axios.get(`${this.$root.apiURL}/addons/${this.$route.params.id}`, this.$root.apiOptions),
			axios.get(
				`${this.$root.apiURL}/addons/${this.$route.params.id}/files/downloads`,
				this.$root.apiOptions,
			),
		])
			.then((res) => res.map((v) => v.data))
			.then(([addon, downloads]) => {
				const loadedAddon = {
					...addon,
					downloads,
				};
				delete loadedAddon.last_updated;
				delete loadedAddon.slug;
				delete loadedAddon.approval;
				delete loadedAddon.id;

				this.addonData = loadedAddon;
			})
			.catch((err) => {
				console.error(err);
				this.$root.showSnackBar(err, "error");
			});
	},
};
</script>
