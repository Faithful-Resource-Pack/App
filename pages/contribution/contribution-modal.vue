<template>
	<v-dialog v-model="modalOpened" width="800">
		<v-card>
			<v-card-title
				class="headline"
				v-text="$root.lang().database.titles.contributions"
			></v-card-title>
			<v-card-text class="pb-0">
				<template v-if="multiple">
					<v-row dense>
						<v-col
							class="flex-grow-0 flex-shrink-1"
							:cols="$vuetify.breakpoint.mdAndUp ? false : 12"
						>
							<contribution-form
								:value="activeForm"
								@input="onFormInput"
								:disabled="activeForm === undefined"
								:contributors="contributors"
								:multiple="multiple"
							/>
						</v-col>
						<v-col
							:class="[
								$vuetify.breakpoint.mdAndUp
									? 'flex-grow-0 flex-shrink-1 px-4'
									: 'flex-grow-1 flex-shrink-0 py-4',
							]"
							><v-divider :vertical="$vuetify.breakpoint.mdAndUp"
						/></v-col>
						<v-col
							class="flex-grow-1 flex-shrink-0 d-flex flex-column"
							:cols="$vuetify.breakpoint.mdAndUp ? false : 12"
						>
							<div class="font-weight-medium text--secondary mb-2">
								{{ $root.lang("database.titles.contributions") }}
							</div>
							<v-list
								id="contribution-form-list"
								dense
								flat
								style="min-height: 300px"
								class="pt-0 mb-4 flex-grow-1 flex-shrink-0"
								><div>
									<template v-for="(form, form_index) in formRecordsList">
										<v-list-item
											:key="'item-' + form.formId"
											class="pl-0"
											@click.stop.prevent="() => changeOpenedForm(form.formId)"
										>
											<v-list-item-content
												:class="[openedFormId === form.formId ? 'primary--text' : '']"
											>
												<v-list-item-title v-text="panelLabels[form.formId]"></v-list-item-title>
												<v-list-item-subtitle class="text-truncate">
													<span
														v-if="form.authors.length"
														v-text="contributorsFromIds(form.authors)"
													/>
													<i v-else>{{ $root.lang("database.subtitles.no_contributor_yet") }}</i>
												</v-list-item-subtitle>
												<v-list-item-subtitle v-if="form.texture && form.texture.length">
													<v-chip
														class="mr-1 px-2"
														x-small
														v-for="(range, range_i) in form.texture"
														:key="
															'item-' +
															form.formId +
															'-chip-' +
															String(range).replace(',', '-') +
															'+' +
															range_i
														"
														v-text="
															'#' + (Array.isArray(range) ? range.join(' → #') : String(range))
														"
													/>
												</v-list-item-subtitle>
											</v-list-item-content>

											<v-list-item-action v-if="form_index > 0">
												<v-icon
													@click.stop.prevent="() => removeForm(form.formId)"
													:color="openedFormId === form.formId ? 'primary' : ''"
												>
													mdi-delete
												</v-icon>
											</v-list-item-action>
										</v-list-item>

										<v-divider
											:key="'divider-' + form.formId"
											v-if="form_index < formRecordsLength - 1"
										></v-divider>
									</template></div
							></v-list>
							<v-btn
								class="flex-grow-0 flex-shrink-1"
								elevation="0"
								block
								@click.stop.prevent="addNewForm"
							>
								{{
									$root.lang(
										`database.subtitles.${openedFormId ? "clone_contribution" : "add_new_contribution"}`,
									)
								}}
							</v-btn>
						</v-col>
					</v-row>
				</template>
				<template v-else>
					<contribution-form
						:value="activeForm"
						@input="onFormInput"
						:disabled="activeForm === undefined"
						:contributors="contributors"
						:multiple="multiple"
					/>
				</template>
			</v-card-text>
			<v-card-actions class="pt-4">
				<v-spacer></v-spacer>
				<v-btn color="red darken-1" text @click="closeAndCancel">
					{{ $root.lang().global.btn.cancel }}
				</v-btn>
				<v-btn color="darken-1" text @click="closeOrAndSubmit">
					{{ $root.lang().global.btn.save }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
import Vue from "vue";
import ContributionForm from "./contribution-form.vue";

export default {
	name: "contribution-modal",
	components: {
		ContributionForm,
	},
	props: {
		contributors: {
			required: true,
			type: Array,
		},
		onCancel: {
			required: false,
			type: Function,
			default() {},
		},
		onSubmit: {
			required: false,
			type: Function,
			default() {},
		},
		multiple: {
			required: false,
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			modalOpened: false,
			closeOnSubmit: true,
			formRecords: {},
			packsList: [],
			lastFormId: 0,
			openedFormId: undefined,
		};
	},
	computed: {
		activeForm() {
			if (this.openedFormId === undefined) return undefined;

			const form_obj = this.formRecords[this.openedFormId];
			if (form_obj === undefined) return undefined;

			const res = JSON.parse(JSON.stringify(form_obj));
			return res;
		},
		formRecordsList() {
			return Object.values(this.formRecords);
		},
		formRecordsLength() {
			return this.formRecordsList.length;
		},
		panelLabels() {
			return Object.entries(this.formRecords)
				.map(([form_id, form]) => [
					form_id,
					`${form.pack} | ${moment(new Date(form.date)).format("ll")}`,
				])
				.reduce((acc, [form_id, form_label]) => ({ ...acc, [form_id]: form_label }), {});
		},
	},
	methods: {
		addNewForm() {
			// create new form
			let form;

			// match last opened form
			if (this.openedFormId !== undefined) {
				// make a copy
				const new_form_id = this.getNewFormId();
				form = JSON.parse(JSON.stringify(this.formRecords[this.openedFormId]));
				form.formId = new_form_id;
			} else {
				form = this.defaultValue(this.packsList);
			}

			// add form
			let new_form_id = form.formId;
			Vue.set(this.formRecords, new_form_id, form);

			// make the opened form our created form
			this.openedFormId = new_form_id;
		},
		open(input_data_obj = undefined, input_packs_list, close_on_submit = true) {
			this.packsList = input_packs_list;
			this.modalOpened = true;
			this.openedFormId = undefined;

			let created_form_obj;
			if (input_data_obj !== undefined) {
				created_form_obj = Object.assign({}, this.defaultValue(input_packs_list), input_data_obj);
			} else {
				// get one empty form
				created_form_obj = this.defaultValue(input_packs_list);
			}

			Vue.set(this, "formRecords", {
				[created_form_obj.formId]: created_form_obj,
			});
			this.openedFormId = created_form_obj.formId;
			this.closeOnSubmit = !!close_on_submit;
		},
		contributorsFromIds(author_ids) {
			if (!author_ids || author_ids.length === 0) {
				return "";
			}

			const contributor_names = this.contributors
				.filter((c) => author_ids.indexOf(c.id) !== -1)
				.map((c) => c.username);

			const total = contributor_names.length;
			const anonymous_total = contributor_names.filter((username) => !username).length;
			const known_names = contributor_names.filter((username) => username);

			if (anonymous_total > 0) {
				const anonymous_str = `${anonymous_total} ${this.$root.lang("database.labels.anonymous")}`;
				known_names.splice(0, 0, anonymous_str);
			}

			const known_str = known_names.join(" | ");
			const total_str = `[${total}]: `;
			return total_str + known_str;
		},
		changeOpenedForm(form_id) {
			if (this.openedFormId === form_id) this.openedFormId = undefined;
			else this.openedFormId = form_id;
		},
		close() {
			this.modalOpened = false;
		},
		closeAndCancel() {
			this.close();
			this.onCancel();
		},
		async closeOrAndSubmit() {
			const result_data_list = Object.values(this.formRecords).map((f) => {
				delete f.formId;
				return f;
			});

			const data_purified = JSON.parse(
				JSON.stringify(this.multiple ? result_data_list : result_data_list[0]),
			);

			const went_well = await this.onSubmit(data_purified);

			if (!went_well) return; // do not close some data may be incorrect or one contribution failed to be sent

			if (this.closeOnSubmit) this.modalOpened = false;
		},
		defaultValue(packs_list) {
			return {
				date: new Date(new Date().setHours(0, 0, 0, 0)),
				packs: packs_list,
				pack: packs_list ? packs_list[0] : null,
				texture: this.multiple ? [] : 0,
				authors: [],
				formId: this.getNewFormId(),
			};
		},
		getNewFormId() {
			this.lastFormId++;
			return String(this.lastFormId);
		},
		onFormInput(form) {
			// stop undefined object
			if (typeof form !== "object") return;
			// stop non-form objects
			if (!("formId" in form)) return;

			form = JSON.parse(JSON.stringify(form));

			// stop fake forms
			const form_id = form.formId;
			if (!this.formRecords[form_id]) return;

			// now affect
			Vue.set(this.formRecords, form_id, form);
		},
		removeForm(form_id) {
			// do not continue if not found
			if (!this.formRecords[form_id]) return;

			const form_ids_list = Object.keys(this.formRecords);

			// do not delete if only one
			if (form_ids_list.length === 1) return;

			// decide who will be the next form
			const form_index = form_ids_list.indexOf(form_id);
			const next_form_index = (form_index + 1) % form_ids_list.length;
			const next_form_id = form_ids_list[next_form_index];
			this.openedFormId = next_form_id;

			const new_form_records = Object.assign({}, this.formRecords); // clean
			delete new_form_records[form_id]; // delete
			Vue.set(this, "formRecords", new_form_records); // affect
		},
	},
};
</script>
