<template>
	<modal-form
		v-model="modalOpened"
		max-width="800"
		:disabled="!formValid"
		:title="dialogTitle"
		@close="$emit('close')"
		@submit="send"
	>
		<v-form ref="form" v-model="formValid" lazy-validation>
			<v-row>
				<v-col v-if="!first">
					<v-text-field
						:color="color"
						persistent-hint
						:hint="$root.lang().database.hints.pack_id_editing"
						v-model="formData.id"
						:label="$root.lang().database.labels.pack_id"
					/>
				</v-col>
				<v-col>
					<v-select
						:color="color"
						:item-color="color"
						required
						:hint="$root.lang().database.hints.pack_reference"
						v-model="formData.reference"
						:items="computePacks"
						item-text="label"
						item-value="value"
						:label="$root.lang().database.labels.submission_reference"
					/>
				</v-col>
			</v-row>
			<v-row>
				<v-col>
					<v-text-field
						:color="color"
						persistent-hint
						clearable
						required
						:hint="$root.lang().database.hints.submission_timings"
						v-model="formData.time_to_results"
						:label="$root.lang().database.labels.time_to_results"
					/>
				</v-col>
				<v-col v-if="formData.council_enabled">
					<v-text-field
						:color="color"
						persistent-hint
						clearable
						required
						:hint="$root.lang().database.hints.submission_timings"
						v-model="formData.time_to_council"
						:label="$root.lang().database.labels.time_to_council"
					/>
				</v-col>
			</v-row>
			<v-row>
				<v-col>
					<v-checkbox
						:color="color"
						v-model="formData.council_enabled"
						:label="$root.lang().database.labels.council_enabled"
					/>
				</v-col>
				<v-col>
					<v-text-field
						:color="color"
						clearable
						v-model="formData.contributor_role"
						:label="$root.lang().database.labels.contributor_role"
					/>
				</v-col>
			</v-row>
			<h2 class="title">{{ $root.lang().database.subtitles.channels }}</h2>
			<p class="text-caption">{{ $root.lang().database.hints.channel_ids }}</p>
			<v-row>
				<v-col>
					<v-text-field
						:color="color"
						required
						clearable
						v-model="formData.channels.submit"
						:label="$root.lang().database.labels.channels.submit"
					/>
				</v-col>
				<v-col v-if="formData.council_enabled">
					<v-text-field
						:color="color"
						required
						clearable
						v-model="formData.channels.council"
						:label="$root.lang().database.labels.channels.council"
					/>
				</v-col>
				<v-col>
					<v-text-field
						:color="color"
						required
						clearable
						v-model="formData.channels.results"
						:label="$root.lang().database.labels.channels.results"
					/>
				</v-col>
			</v-row>
		</v-form>
	</modal-form>
</template>

<script>
import axios from "axios";

import ModalForm from "@components/modal-form.vue";

export default {
	name: "submission-modal",
	components: {
		ModalForm,
	},
	props: {
		color: {
			type: String,
			required: false,
			default: "primary",
		},
		value: {
			type: Boolean,
			required: true,
		},
		data: {
			type: Object,
			required: false,
		},
		add: {
			type: Boolean,
			required: false,
			default: false,
		},
		first: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	data() {
		return {
			modalOpened: false,
			formValid: false,
			formData: {
				id: null,
				reference: null,
				council_enabled: null,
				channels: {
					submit: null,
					council: null,
					results: null,
				},
				time_to_council: null,
				time_to_results: null,
				contributor_role: null,
			},
			packs: [],
		};
	},
	methods: {
		send() {
			const data = { ...this.formData };

			if (!data.council_enabled) {
				// delete properties that may have been shown and hidden at some point
				delete data.channels.council;
				delete data.time_to_council;
			}

			// get rid of empty strings so api can validate properly
			if (!data.contributor_role) delete data.contributor_role;
			Object.entries(data.channels).forEach(([k, v]) => {
				if (!v) data.channels[k] = null;
			});

			// all pack info is added in one big request on creation so we "beam" it back
			if (this.first) {
				this.$emit("submissionFinished", data);
				return this.$emit("close");
			}

			const requestPromise = this.add
				? axios.post(`${this.$root.apiURL}/submissions`, data, this.$root.apiOptions)
				: axios.put(`${this.$root.apiURL}/submissions/${data.id}`, data, this.$root.apiOptions);

			requestPromise
				.then(() => {
					this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
					this.$emit("close", true);
				})
				.catch((err) => {
					console.error(err);
					this.$root.showSnackBar(err, "error");
				});
		},
	},
	computed: {
		dialogTitle() {
			return this.add
				? this.$root.lang().database.titles.add_submission
				: this.$root.lang().database.titles.edit_submission;
		},
		computePacks() {
			return this.packs.map((p) => ({ label: p.name, value: p.id }));
		},
	},
	created() {
		axios.get(`${this.$root.apiURL}/packs/raw`).then((res) => {
			this.packs = Object.values(res.data);
		});
	},
	watch: {
		value(newValue) {
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			if (this.first) {
				// reset form on init
				this.formData = {
					id: null,
					reference: null,
					council_enabled: null,
					channels: {
						submit: null,
						council: null,
						results: null,
					},
					time_to_council: null,
					time_to_results: null,
					contributor_role: null,
				};
				if (this.data.id) this.formData.id = this.data.id;
			} else this.formData = this.data;

			this.$emit("input", newValue);
		},
	},
};
</script>
