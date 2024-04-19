<template>
	<v-dialog v-model="modalOpened" width="800">
		<v-card>
			<v-card-title class="headline">{{ $root.lang().database.titles.contributions }}</v-card-title>
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
							><v-divider :vertical="$vuetify.breakpoint.mdAndUp" />
						</v-col>
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
							>
								<div>
									<template v-for="(form, formIndex) in formRecordsList">
										<v-list-item
											:key="`item-${form.formId}`"
											class="pl-0"
											@click.stop.prevent="() => changeOpenedForm(form.formId)"
										>
											<v-list-item-content
												:class="[openedFormId === form.formId ? 'primary--text' : '']"
											>
												<v-list-item-title>{{ panelLabels[form.formId] }}</v-list-item-title>
												<v-list-item-subtitle class="text-truncate">
													<span v-if="form.authors.length">
														{{ contributorsFromIds(form.authors) }}
													</span>
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
													>
														{{ "#" + (Array.isArray(range) ? range.join(" — #") : String(range)) }}
													</v-chip>
												</v-list-item-subtitle>
											</v-list-item-content>

											<v-list-item-action v-if="formIndex > 0">
												<v-icon
													@click.stop.prevent="() => removeForm(form.formId)"
													:color="openedFormId === form.formId ? 'primary' : ''"
												>
													mdi-delete
												</v-icon>
											</v-list-item-action>
										</v-list-item>

										<v-divider
											:key="`divider-${form.formId}`"
											v-if="formIndex < formRecordsLength - 1"
										/>
									</template>
								</div>
							</v-list>
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
				<v-spacer />
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
import moment from "moment";

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

			const formObj = this.formRecords[this.openedFormId];
			if (formObj === undefined) return undefined;

			const res = JSON.parse(JSON.stringify(formObj));
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
				.map(([formID, form]) => [
					formID,
					`${this.formatPack(form.pack)} • ${moment(new Date(form.date)).format("ll")}`,
				])
				.reduce((acc, [formID, formLabel]) => ({ ...acc, [formID]: formLabel }), {});
		},
	},
	methods: {
		addNewForm() {
			// create new form
			let form;

			// match last opened form
			if (this.openedFormId !== undefined) {
				// make a copy
				const newFormId = this.getNewFormId();
				form = JSON.parse(JSON.stringify(this.formRecords[this.openedFormId]));
				form.formId = newFormId;
			} else {
				form = this.defaultValue(this.packsList);
			}

			// add form
			let newFormId = form.formId;
			Vue.set(this.formRecords, newFormId, form);

			// make the opened form our created form
			this.openedFormId = newFormId;
		},
		formatPack(packId) {
			return this.packsList.find((v) => v.value === packId)?.label || packId;
		},
		open(inputDataObj, inputPacksList, closeOnSubmit = true) {
			this.packsList = inputPacksList;
			this.modalOpened = true;
			this.openedFormId = undefined;

			let createdFormObj;
			if (inputDataObj !== undefined) {
				createdFormObj = Object.assign({}, this.defaultValue(inputPacksList), inputDataObj);
			} else {
				// get one empty form
				createdFormObj = this.defaultValue(inputPacksList);
			}

			Vue.set(this, "formRecords", {
				[createdFormObj.formId]: createdFormObj,
			});
			this.openedFormId = createdFormObj.formId;
			this.closeOnSubmit = !!closeOnSubmit;
		},
		contributorsFromIds(authorIds) {
			if (!authorIds || authorIds.length === 0) return "";

			const contributorNames = this.contributors
				.filter((c) => authorIds.indexOf(c.id) !== -1)
				.map((c) => c.username);

			const total = contributorNames.length;
			const anonymousTotal = contributorNames.filter((username) => !username).length;
			const knownNames = contributorNames.filter((username) => username);

			if (anonymousTotal > 0) {
				const anonymousStr = `${anonymousTotal} ${this.$root.lang("database.labels.anonymous")}`;
				knownNames.splice(0, 0, anonymousStr);
			}

			return `[${total}]: ${knownNames.join(", ")}`;
		},
		changeOpenedForm(formId) {
			if (this.openedFormId === formId) this.openedFormId = undefined;
			else this.openedFormId = formId;
		},
		close() {
			this.modalOpened = false;
		},
		closeAndCancel() {
			this.close();
			this.onCancel();
		},
		async closeOrAndSubmit() {
			const resultDataList = Object.values(this.formRecords).map((f) => {
				delete f.formId;
				return f;
			});

			const dataPurified = JSON.parse(
				JSON.stringify(this.multiple ? resultDataList : resultDataList[0]),
			);

			const wentWell = await this.onSubmit(dataPurified);

			if (!wentWell) return; // do not close some data may be incorrect or one contribution failed to be sent

			if (this.closeOnSubmit) this.modalOpened = false;
		},
		defaultValue(packList) {
			return {
				date: new Date(new Date().setHours(0, 0, 0, 0)),
				packs: packList,
				pack: packList ? packList[0].value : null,
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
			const formId = form.formId;
			if (!this.formRecords[formId]) return;

			// now affect
			Vue.set(this.formRecords, formId, form);
		},
		removeForm(formId) {
			// do not continue if not found
			if (!this.formRecords[formId]) return;

			const formIdList = Object.keys(this.formRecords);

			// do not delete if only one
			if (formIdList.length === 1) return;

			// decide who will be the next form
			const formIndex = formIdList.indexOf(formId);
			const nextFormIndex = (formIndex + 1) % formIdList.length;
			const nextFormId = formIdList[nextFormIndex];
			this.openedFormId = nextFormId;

			const newFormRecords = Object.assign({}, this.formRecords); // clean
			delete newFormRecords[formId]; // delete
			Vue.set(this, "formRecords", newFormRecords); // affect
		},
	},
};
</script>
