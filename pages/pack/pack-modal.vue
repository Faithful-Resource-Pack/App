<template>
	<modal-form v-model="modalOpened" :title="dialogTitle" @close="$emit('close')" @submit="send">
		<submission-modal
			:color="color"
			v-model="submissionOpen"
			@close="disableSubmission"
			:data="submissionData"
			:add="submissionAdd"
			:first="add"
			@submissionFinished="addSubmissionData"
		/>
		<pack-remove-confirm
			type="submissions"
			v-model="remove.confirm"
			@close="
				() => {
					remove.confirm = false;
					getSubmission(data.id);
				}
			"
			:id="remove.id"
			:label="remove.label"
		/>
		<v-form ref="form" lazy-validation>
			<v-text-field
				:color="color"
				:hint="
					add
						? $root.lang().database.hints.pack_id_creation
						: $root.lang().database.hints.pack_id_editing
				"
				v-model="formData.id"
				:label="$root.lang().database.labels.pack_id"
			/>
			<v-text-field
				:color="color"
				required
				clearable
				v-model="formData.name"
				:label="$root.lang().database.labels.pack_name"
			/>
			<v-combobox
				:color="color"
				:item-color="color"
				required
				multiple
				deletable-chips
				small-chips
				v-model="formData.tags"
				:items="tags"
				:label="$root.lang().database.labels.pack_tags"
			/>
			<v-text-field
				:color="color"
				required
				type="number"
				v-model="formData.resolution"
				:label="$root.lang().database.labels.pack_resolution"
			/>
			<v-text-field
				:color="color"
				:rules="downloadLinkRules"
				clearable
				v-model="formData.logo"
				:label="$root.lang().database.labels.pack_logo"
			/>
			<h2 class="title">{{ $root.lang().database.subtitles.github }}</h2>
			<p class="text-caption">{{ $root.lang().database.hints.github_required }}</p>
			<div v-for="edition in editions" :key="edition">
				<p class="text-body-1">{{ edition.toTitleCase() }}</p>
				<v-row>
					<v-col>
						<v-text-field
							:color="color"
							:label="$root.lang().database.labels.github_org"
							v-model="(formData.github[edition] || createNewGithub(edition)).org"
						/>
					</v-col>
					<v-col>
						<v-text-field
							:color="color"
							:label="$root.lang().database.labels.github_repo"
							v-model="(formData.github[edition] || createNewGithub(edition)).repo"
						/>
					</v-col>
				</v-row>
			</div>
			<h2 class="title">{{ $root.lang().database.subtitles.submissions }}</h2>
			<v-row v-if="Object.keys(formData.submission).length">
				<v-col>
					<v-btn
						block
						:style="{ 'margin-top': '10px' }"
						color="secondary"
						@click="submissionModal(formData, false)"
					>
						{{ $root.lang().database.labels.edit_submission }}<v-icon right>mdi-pencil</v-icon>
					</v-btn>
				</v-col>
				<v-col cols="2">
					<v-btn
						block
						:style="{ 'margin-top': '10px' }"
						color="error darken-1"
						@click="deleteSubmission(formData)"
					>
						<v-icon>mdi-delete</v-icon>
					</v-btn>
				</v-col>
			</v-row>
			<v-btn
				v-else
				block
				:style="{ 'margin-top': '10px' }"
				color="secondary"
				@click="submissionModal(formData, true)"
			>
				{{ $root.lang().database.labels.new_submission }}
				<v-icon right>mdi-plus</v-icon>
			</v-btn>
		</v-form>
	</modal-form>
</template>

<script>
import axios from "axios";

import ModalForm from "@components/modal-form.vue";
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
			required: false,
		},
		tags: {
			type: Array,
			required: true,
		},
	},
	data() {
		return {
			modalOpened: false,
			formData: {
				id: null,
				name: null,
				tags: [],
				logo: null,
				resolution: null,
				github: {},
				submission: {},
			},
			editions: [],
			downloadLinkRules: [(u) => this.validURL(u) || this.$root.lang().database.labels.invalid_url],
			submissionOpen: false,
			submissionData: {},
			submissionAdd: false,
			remove: {
				id: "",
				label: "",
				confirm: false,
			},
		};
	},
	methods: {
		submissionModal(data, add) {
			this.submissionOpen = true;
			this.submissionAdd = add;
			if (add)
				this.submissionData = {
					id: data.id,
				};
			else this.submissionData = data.submission;
		},
		disableSubmission() {
			this.submissionOpen = false;
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
		deleteSubmission() {
			if (this.add) {
				// reset directly, no need for confirmation modal
				this.formData.submission = {};
				return;
			}

			this.remove.id = this.data.id;
			this.remove.label = this.remove.name = this.$root
				.lang()
				.database.labels.ask_submission_deletion.replace("%s", this.data.name)
				.replace("%d", this.data.id);
			this.remove.confirm = true;
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

			// if user doesn't specify id on pack creation (falsy), the API will assume it
			if (this.add) {
				if (!data.submission.id) delete data.submission.id;
				if (!data.id) delete data.id;
			}

			// stop accidental casting
			if (!data.logo) data.logo = null;

			Object.entries(data.github).forEach(([k, v]) => {
				if (!v.repo || !v.org) delete data.github[k];
			});

			if (!Object.keys(data.github).length)
				return this.$root.showSnackBar(
					"At least one GitHub repository needs to be present.",
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
		createNewGithub(edition) {
			this.formData.github[edition] = {
				org: null,
				repo: null,
			};
			return this.formData.github[edition];
		},
	},
	created() {
		axios.get(`${this.$root.apiURL}/textures/editions`).then((res) => {
			this.editions = res.data;
		});
	},
	computed: {
		dialogTitle() {
			return this.add
				? this.$root.lang().database.titles.add_pack
				: this.$root.lang().database.titles.change_pack;
		},
	},
	watch: {
		value(newValue) {
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			this.$nextTick(() => {
				if (this.add) this.$refs.form.reset();
				else {
					for (const [k, v] of Object.entries(this.data)) {
						if (this.formData[k] === undefined) continue;
						this.formData[k] = v;
					}
					this.getSubmission(this.data.id);
				}
			});

			this.$emit("input", newValue);
		},
	},
};
</script>
