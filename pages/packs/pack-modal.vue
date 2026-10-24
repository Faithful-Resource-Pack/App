<template>
	<modal-form v-model="modalOpen" :title="modalTitle" @close="$emit('close')" @submit="send">
		<submission-modal
			v-model="submissionOpen"
			:color="color"
			:data="submissionData"
			:add="submissionAdd"
			:first="add"
			@close="closeSubmissionModal"
			@submissionFinished="addSubmissionData"
		/>
		<pack-remove-confirm
			v-model="remove.open"
			:data="remove.data"
			type="submissions"
			@close="getSubmission(data.id)"
		/>
		<v-form ref="form" lazy-validation>
			<v-text-field
				v-model="formData.id"
				:color="color"
				:hint="
					add
						? $root.lang().database.packs.modal.id_creation_hint
						: $root.lang().database.packs.modal.id_editing_hint
				"
				:label="$root.lang().database.packs.modal.id"
			/>
			<v-text-field
				v-model="formData.name"
				:color="color"
				required
				clearable
				:label="$root.lang().database.packs.modal.name"
			/>
			<v-combobox
				v-model="formData.tags"
				:color="color"
				:item-color="color"
				required
				multiple
				small-chips
				deletable-chips
				:items="tags"
				:label="$root.lang().database.packs.modal.tags"
			/>
			<v-text-field
				v-model="formData.resolution"
				:color="color"
				required
				type="number"
				:label="$root.lang().database.packs.modal.resolution"
			/>
			<v-text-field
				v-model="formData.logo"
				:color="color"
				:rules="downloadLinkRules"
				clearable
				:label="$root.lang().database.packs.modal.logo"
			/>
			<span class="subtitle-1 text--secondary">
				{{ $root.lang().database.packs.modal.color }}
			</span>
			<v-color-picker
				v-model="colorPicker"
				mode="hexa"
				class="d-flex flex-row-reverse justify-center my-3"
				style="max-width: 100%"
			/>
			<h2 class="text-h6">{{ $root.lang().database.packs.modal.github.title }}</h2>
			<p class="text-caption">{{ $root.lang().database.packs.modal.github.title_hint }}</p>
			<div v-for="edition in githubEditions" :key="edition">
				<p class="text-body-1">{{ edition.toTitleCase() }}</p>
				<v-row>
					<v-col>
						<v-text-field
							v-model="(formData.github[edition] || createNewGithub(edition)).org"
							:color="color"
							:label="$root.lang().database.packs.modal.github.organization"
						/>
					</v-col>
					<v-col>
						<v-text-field
							v-model="(formData.github[edition] || createNewGithub(edition)).repo"
							:color="color"
							:label="$root.lang().database.packs.modal.github.repository"
						/>
					</v-col>
				</v-row>
			</div>
			<h2 class="text-h6 mb-2">{{ $root.lang().database.packs.submissions.title }}</h2>
			<v-row v-if="Object.keys(formData.submission).length" dense>
				<v-col>
					<v-btn block color="secondary" @click="openSubmissionModal(formData, false)">
						<v-icon left>mdi-pencil</v-icon>
						{{ $root.lang().database.packs.submissions.edit_submission }}
					</v-btn>
				</v-col>
				<v-col class="flex-grow-0 flex-shrink-0">
					<v-btn
						block
						color="error darken-1"
						:title="$root.lang().database.packs.submissions.delete_submission"
						@click="deleteSubmission(formData)"
					>
						<v-icon>mdi-delete</v-icon>
					</v-btn>
				</v-col>
			</v-row>
			<v-btn v-else block color="secondary" @click="openSubmissionModal(formData, true)">
				<v-icon left>mdi-plus</v-icon>
				{{ $root.lang().database.packs.submissions.add_submission }}
			</v-btn>
		</v-form>
	</modal-form>
</template>

<script>
import axios from "axios";

import ModalForm from "@layouts/modal-form.vue";
import SubmissionModal from "./submission-modal.vue";
import PackRemoveConfirm from "./pack-remove-confirm.vue";

export default {
	name: "pack-modal",
	components: {
		ModalForm,
		SubmissionModal,
		PackRemoveConfirm,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		color: {
			type: String,
			required: false,
			default: "primary",
		},
		add: {
			type: Boolean,
			required: false,
			default: false,
		},
		data: {
			type: Object,
			required: true,
		},
		tags: {
			type: Array,
			required: true,
		},
	},
	emits: ["input", "close"],
	data() {
		return {
			modalOpen: false,
			formData: {
				id: null,
				name: null,
				tags: [],
				logo: null,
				resolution: null,
				github: {},
				submission: {},
			},
			// store outside of formData so it doesn't reset
			colorPicker: "#000000",
			editions: settings.editions,
			downloadLinkRules: [(u) => this.validURL(u) || this.$root.lang().global.invalid_url],
			submissionOpen: false,
			submissionData: {},
			submissionAdd: false,
			remove: {
				data: {},
				open: false,
			},
		};
	},
	methods: {
		openSubmissionModal(data, add) {
			this.submissionOpen = true;
			this.submissionAdd = add;
			this.submissionData = add ? { id: data.id } : data.submission;
		},
		closeSubmissionModal() {
			// clear form
			this.submissionData = {};
			if (!this.add) this.getSubmission(this.formData.id);
			this.$forceUpdate();
		},
		getSubmission(packID) {
			axios
				.get(`${this.$root.apiURL}/submissions/${packID}`)
				// set to empty object if no submission exists
				.catch(() => ({ data: {} }))
				.then((res) => {
					this.formData.submission = res.data;
				});
		},
		deleteSubmission(data) {
			if (this.add) {
				// reset directly, no need for confirmation modal
				this.formData.submission = {};
				return;
			}

			this.remove.data = data;
			this.remove.open = true;
		},
		validURL(str) {
			return String.urlRegex.test(str);
		},
		addSubmissionData(data) {
			if (!this.submissionAdd) return;
			this.formData.submission = data || {};
		},
		send() {
			const data = { ...this.formData };

			// if user doesn't specify id on pack creation (falsy) the API will assume it
			if (this.add) {
				if (!data.submission.id) delete data.submission.id;
				if (!data.id) delete data.id;
			}

			// stop accidental casting
			if (!data.logo) data.logo = null;
			data.color = this.colorPicker;

			Object.entries(data.github).forEach(([k, v]) => {
				if (!v.repo || !v.org) delete data.github[k];
			});

			if (!Object.keys(data.github).length)
				return this.$root.showSnackbar(
					this.$root.lang().database.packs.modal.github.length_notice,
					"error",
				);

			// only add submission property if filled out
			if (
				!this.submissionAdd || // if changing submission, already done separately
				!data.submission ||
				!Object.keys(data.submission ?? {}).length
			)
				delete data.submission;

			const requestPromise =
				this.submissionAdd || this.add
					? axios.post(`${this.$root.apiURL}/packs`, data, this.$root.apiOptions)
					: axios.put(`${this.$root.apiURL}/packs/${data.id}`, data, this.$root.apiOptions);

			this.$root.wrapSnackbar(requestPromise).then(() => this.$emit("close", true));
		},
		createNewGithub(edition) {
			this.formData.github[edition] = {
				org: null,
				repo: null,
			};
			return this.formData.github[edition];
		},
	},
	computed: {
		githubEditions() {
			// the modded repository is only managed by admins
			return this.$root.isAdmin ? [...this.editions, "modded"] : this.editions;
		},
		modalTitle() {
			return this.add
				? this.$root.lang().database.packs.modal.add_pack
				: this.$root.lang().database.packs.modal.edit_pack;
		},
	},
	watch: {
		value(newValue) {
			this.modalOpen = newValue;
		},
		modalOpen(newValue) {
			this.$nextTick(() => {
				if (this.add) this.$refs.form.reset();
				else {
					for (const [k, v] of Object.entries(this.data)) {
						if (this.formData[k] === undefined) continue;
						this.formData[k] = v;
					}
					this.getSubmission(this.data.id);
				}

				this.colorPicker = this.data.color || "#000000";
			});

			this.$emit("input", newValue);
		},
	},
};
</script>
