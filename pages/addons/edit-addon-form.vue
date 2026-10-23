<template>
	<v-container class="form-container">
		<div class="d-flex align-center py-4">
			<v-btn
				large
				icon
				:title="$root.lang().addons.titles.submissions"
				class="mx-2"
				to="/addons/submissions"
			>
				<v-icon large>mdi-chevron-left</v-icon>
			</v-btn>
			<h1 class="text-h4">
				{{ $root.lang().addons.titles.edit }}
				<span class="font-weight-light text--secondary">#{{ id }}</span>
			</h1>
		</div>
		<addon-form
			:loading="loading"
			:submitting="submitting"
			:addon-data="addonData"
			:disabled-header-input="headerDisabled"
			:screen-sources="screenSources"
			:screen-ids="screenIds"
			:header-source="headerSource"
			@submit="handleSubmit"
			@header="handleHeader"
			@screenshots="handleScreenshot"
		/>
		<modal-form
			v-model="reasonModalOpen"
			button-type="submit"
			:title="$root.lang().addons.reason_modal.titles.pending"
			:disabled="!validForm"
			@close="handleReasonModal(false)"
			@submit="handleReasonModal(true)"
		>
			<v-form ref="reasonForm" v-model="validForm" lazy-validation>
				<p>{{ $root.lang().addons.reason_modal.description_author }}</p>
				<v-textarea
					v-model="reason"
					:autofocus="!$vuetify.breakpoint.mobile"
					:placeholder="$root.lang().addons.reason_modal.placeholder"
					required
					:rules="reasonRules"
					:counter="reasonCounter.max"
				/>
			</v-form>
		</modal-form>
	</v-container>
</template>

<script>
import axios from "axios";
import AddonForm from "./addon-form.vue";
import ModalForm from "@layouts/modal-form.vue";

export default {
	name: "edit-addon-form",
	components: {
		ModalForm,
		AddonForm,
	},
	data() {
		return {
			headerDisabled: false,
			reasonModalOpen: false,
			reasonData: undefined,
			reasonRules: [
				() =>
					!!(this.reason && this.reason.trim()) || this.$root.lang().addons.reason_modal.required,
				() =>
					this.reason.trim().length < this.reasonCounter.min ||
					this.reason.trim().length > this.reasonCounter.max
						? this.$root
								.lang()
								.addons.reason_modal.bounds.replace("%s", this.reasonCounter.min)
								.replace("%s", this.reasonCounter.max)
						: true,
			],
			reasonCounter: {
				min: 5,
				max: 300,
			},
			reason: "",
			validForm: false,
			addonData: undefined,
			headerSource: "",
			screenSources: [],
			screenIds: [],
			submitting: false,
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
		handleReasonModal(submitted) {
			const valid = this.$refs.reasonForm.validate();
			if (!valid) return;

			this.reasonModalOpen = false;
			if (submitted) this.confirmSubmit(this.reasonData, false);
			else this.reason = "";
		},
		handleSubmit(data, approve) {
			if (approve) return this.confirmSubmit(data, true);
			this.reasonData = data;
			this.reasonModalOpen = true;
		},
		async confirmSubmit(data, approve) {
			this.submitting = true;
			if (approve) data.reason = "Manager edit";
			else {
				data.reason = this.reason.trim();
				this.reason = "";
			}

			try {
				// update no matter what then approve if manager selected
				await this.$root.wrapSnackbar(
					axios.patch(`${this.$root.apiURL}/addons/${this.id}`, data, this.$root.apiOptions),
				);
				if (approve === true)
					await this.$root.wrapSnackbar(
						axios.put(
							`${this.$root.apiURL}/addons/${this.id}/review`,
							{ status: "approved", reason: "Manager edit" },
							this.$root.apiOptions,
						),
					);

				// send you back after everything goes well (staying on the form feels weird)
				this.$router.push("/addons/submissions");
			} finally {
				this.submitting = false;
			}
		},
		handleHeader(file, remove = false) {
			this.headerDisabled = true;

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

			const messages = this.$root.lang().addons.images.header.status;
			return this.$root
				.wrapSnackbar(promise, remove ? messages.remove : messages.upload)
				.then(() => this.getHeader())
				.finally(() => {
					this.headerDisabled = false;
				});
		},
		async handleScreenshot(screenshots, index, remove = false, id) {
			if (Array.isArray(screenshots) && screenshots.length === 0) return;

			let promise;
			if (remove) {
				promise = axios.delete(
					`${this.$root.apiURL}/addons/${this.id}/screenshots/${id ?? index}`,
					this.$root.apiOptions,
				);
			} else {
				// add all of them
				// fix to stabilize upload and make one request then another...
				let successful = true;
				let err;
				for (const screen of screenshots) {
					const form = new FormData();
					form.set("file", screen, screen.name);

					successful = await axios
						.post(`${this.$root.apiURL}/addons/${this.id}/screenshots`, form, this.$root.apiOptions)
						.then(() => true)
						.catch((error) => {
							err = error;
							return false;
						});
					if (!successful) break;
				}

				promise = successful ? Promise.resolve() : Promise.reject(err);
			}

			const messages = this.$root.lang().addons.images.screenshots.status;
			return this.$root
				.wrapSnackbar(promise, remove ? messages.remove : messages.upload)
				.then(() => this.getScreens());
		},
		getHeader() {
			axios
				.get(`${this.$root.apiURL}/addons/${this.id}/files/header`, this.$root.apiOptions)
				.then((res) => {
					this.headerSource = `${res.data}?t=${Date.now()}`;
				})
				.catch(() => {
					this.headerSource = "";
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
			.then((res) => res.map(({ data }) => data))
			.then(([addon, downloads]) => {
				const loadedAddon = {
					...addon,
					downloads,
				};
				delete loadedAddon.last_updated;
				delete loadedAddon.approval;
				delete loadedAddon.id;

				this.addonData = loadedAddon;
			})
			.catch((err) => {
				console.error(err);
				this.$root.showSnackbar(err, "error");
			});
	},
};
</script>
