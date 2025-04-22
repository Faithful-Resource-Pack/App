<template>
	<modal-form
		v-model="modalOpened"
		:title="$root.lang().database.contributions.title"
		max-width="800"
		@close="close"
		@submit="closeAndSubmit"
	>
		<v-row dense v-if="add">
			<v-col class="flex-grow-0 flex-shrink-1" :cols="$vuetify.breakpoint.mdAndUp ? false : 12">
				<contribution-form
					v-model="contribs[selectedContrib]"
					:contributors="contributors"
					add
					@newUser="
						(l) => {
							searchedContributors = l;
						}
					"
				/>
			</v-col>
			<v-col
				:class="[
					$vuetify.breakpoint.mdAndUp
						? 'flex-grow-0 flex-shrink-1 px-4'
						: 'flex-grow-1 flex-shrink-0 py-4',
				]"
			>
				<v-divider :vertical="$vuetify.breakpoint.mdAndUp" />
			</v-col>
			<v-col
				class="flex-grow-1 flex-shrink-0 d-flex flex-column"
				:cols="$vuetify.breakpoint.mdAndUp ? false : 12"
			>
				<div class="font-weight-medium text--secondary mb-2">
					{{ $root.lang().database.summary }}: [{{ contribs.length }}]
				</div>
				<v-list
					id="contribution-form-list"
					dense
					flat
					style="min-height: 200px"
					class="pt-0 mb-4 flex-grow-1 flex-shrink-0"
				>
					<div>
						<template v-for="(form, i) in Object.entries(contribs)">
							<v-list-item
								:key="form.formID"
								class="pl-0"
								@click.stop.prevent="() => changeOpenedForm(form.formID)"
							>
								<v-list-item-content :class="[i === selectedContrib ? 'primary--text' : '']">
									<v-list-item-title>{{ panelLabels[form.formID] }}</v-list-item-title>
									<v-list-item-subtitle class="text-truncate">
										<span v-if="form.authors.length">
											{{ formAuthorNames[form.formID] || "…" }}
										</span>
										<i v-else>{{ $root.lang().database.contributions.no_contributor_yet }}</i>
									</v-list-item-subtitle>
									<v-list-item-subtitle v-if="form.texture && form.texture.length">
										<v-chip
											class="mr-1 px-2"
											x-small
											v-for="range in form.texture"
											:key="Array.isArray(range) ? range.join() : String(range)"
										>
											{{ "#" + (Array.isArray(range) ? range.join(" — #") : String(range)) }}
										</v-chip>
									</v-list-item-subtitle>
								</v-list-item-content>

								<v-list-item-action v-if="i > 0">
									<v-icon
										@click.stop.prevent="() => deleteContrib(i)"
										:color="selectedContrib === form.formID ? 'primary' : ''"
									>
										mdi-delete
									</v-icon>
								</v-list-item-action>
							</v-list-item>

							<v-divider :key="`divider-${form.formID}`" v-if="i < contribs.length - 1" />
						</template>
					</div>
				</v-list>
				<v-btn
					class="flex-grow-0 flex-shrink-1"
					elevation="0"
					block
					@click.stop.prevent="cloneContribution"
				>
					{{ $root.lang().database.contributions.modal.clone_contribution }}
				</v-btn>
			</v-col>
		</v-row>
		<contribution-form
			v-else
			v-model="contribs[selectedContrib]"
			:contributors="contributors"
			@newUser="
				(l) => {
					searchedContributors = l;
				}
			"
		/>
	</modal-form>
</template>

<script>
import axios from "axios";
import moment from "moment";

import ModalForm from "@components/modal-form.vue";
import ContributionForm from "./contribution-form.vue";

const emptyContrib = () => ({
	formID: crypto.randomUUID(),
	date: new Date(new Date().setHours(0, 0, 0, 0)),
	texture: 0,
	pack: "",
	authors: [],
});

export default {
	name: "contribution-modal",
	components: {
		ModalForm,
		ContributionForm,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		// only used for editing
		data: {
			type: Object,
			required: false,
		},
		// whether it's a new contribution or editing existing one
		add: {
			type: Boolean,
			required: true,
		},
		packs: {
			type: Array,
			required: true,
		},
		contributors: {
			type: Array,
			required: true,
		},
	},
	data() {
		return {
			modalOpened: false,
			contribs: [],
			searchedContributors: [],
			formAuthorNames: {},
			selectedContrib: null,
			closeOnSubmit: true,
		};
	},
	methods: {
		cloneContribution() {
			const form = structuredClone(this.contribs[this.selectedContrib]);
			form.formID = crypto.randomUUID();
			const newLen = this.contribs.push(form);

			// make the opened form our created form
			this.$nextTick(() => {
				this.selectedContrib = newLen - 1;
			});
		},
		deleteContrib(index) {
			// do not continue if not found
			if (!this.contribs[index]) return;

			// do not delete if only one
			if (this.contribs.length <= 1) return;

			this.contribs.splice(index, 1);
			if (this.contribs.length >= this.selectedContrib) --this.selectedContrib;
		},
		async contributorsFromIds(authorIds) {
			if (!authorIds || authorIds.length === 0) return "";

			const total = authorIds.length;

			const alreadyAuthors = this.contributors.filter((c) => authorIds.includes(c.id));
			const alreadyAuthorsIds = alreadyAuthors.map((c) => c.id);
			const notAlreadyAuthorsIds = authorIds.filter((id) => !alreadyAuthorsIds.includes(id));
			const searchIDsparam = notAlreadyAuthorsIds.join(",");
			const notAlreadyAuthorsFound = !searchIDsparam
				? []
				: await axios
						.get(`${this.$root.apiURL}/users/${searchIDsparam}`)
						.then((res) => res.data)
						.then((data) => (Array.isArray(data) ? data : [data]));

			const allAuthorsFound = Array.from(new Set([...alreadyAuthors, ...notAlreadyAuthorsFound]));
			const anonymousTotal = allAuthorsFound.filter((a) => !a.username).length;
			const notAnonymous = allAuthorsFound.filter((a) => !!a.username);
			const notAnonymousNames = notAnonymous.map((user) => user.username);
			let allNames = notAnonymousNames;

			if (anonymousTotal > 0) {
				const anonymousStr = `${anonymousTotal} ${this.$root.lang().database.labels.anonymous}`;
				allNames.splice(0, 0, anonymousStr); // insert first anonymous
			}

			allNames = Array.from(new Set(allNames));
			return `[${total}]: ${allNames.join(", ")}`;
		},
		changeOpenedForm(formID) {
			this.selectedContrib = formID;
		},
		close() {
			this.modalOpened = false;
		},
		async closeAndSubmit() {
			const resultDataList = Object.values(this.contribs).map((f) => {
				delete f.formID;
				return f;
			});

			const dataPurified = JSON.parse(
				JSON.stringify(this.multiple ? resultDataList : resultDataList[0]),
			);

			const wentWell = await this.onSubmit(dataPurified);

			if (!wentWell) return; // do not close some data may be incorrect or one contribution failed to be sent

			if (this.closeOnSubmit) this.modalOpened = false;
		},
	},
	computed: {
		allContributors() {
			return [...this.contributors, ...this.searchedContributors];
		},
		packToName() {
			return this.packs.reduce((acc, cur) => {
				acc[cur.id] = cur.name;
				return acc;
			}, {});
		},
		panelLabels() {
			// faster than using Object.entries + reduce
			const acc = {};
			for (const formID of Object.keys(this.contribs)) {
				const form = this.contribs[formID];
				acc[formID] = `${this.packToName[form.pack]} • ${moment(new Date(form.date)).format("ll")}`;
			}
			return acc;
		},
	},
	watch: {
		value(newValue) {
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			this.contribs = [this.add ? emptyContrib() : { ...this.data, formID: crypto.randomUUID() }];
			this.selectedContrib = 0;
			this.$emit("input", newValue);
		},
	},
};
</script>
