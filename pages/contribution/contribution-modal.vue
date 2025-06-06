<template>
	<modal-form
		v-model="modalOpened"
		:title="$root.lang().database.contributions.title"
		max-width="800"
		@close="close"
		@submit="handleSubmit"
	>
		<v-row v-if="add" dense>
			<v-col class="flex-grow-0 flex-shrink-1" :cols="$vuetify.breakpoint.mdAndUp ? false : 12">
				<contribution-form
					v-model="contribs[selectedContrib]"
					:packs="packs"
					:contributors="contributors"
					add
					@newUser="addNewUsers"
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
						<summary-item
							v-for="(contrib, i) in contribs"
							:key="contrib.key"
							:contrib="contrib"
							:selected="selectedContrib === i"
							:packToName="packToName"
							:contributors="allContributors"
							@select="changeOpenedForm(i)"
							@delete="deleteContrib(i)"
						/>
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
			:packs="packs"
			:contributors="contributors"
			@newUser="addNewUsers"
		/>
	</modal-form>
</template>

<script>
import axios from "axios";

import ModalForm from "@components/modal-form.vue";
import ContributionForm from "./contribution-form.vue";
import SummaryItem from "./summary-item.vue";
import generateRange from "@helpers/generateRange";

const emptyContrib = () => ({
	key: crypto.randomUUID(),
	date: new Date(new Date().setHours(0, 0, 0, 0)),
	texture: [],
	pack: "faithful_32x",
	authors: [],
});

export default {
	name: "contribution-modal",
	components: {
		ModalForm,
		ContributionForm,
		SummaryItem,
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
			// need to initialize to prevent contribution-form reading empty array
			contribs: [emptyContrib()],
			selectedContrib: 0,
			searchedContributors: [],
			formAuthorNames: {},
			closeOnSubmit: true,
		};
	},
	methods: {
		cloneContribution() {
			const form = structuredClone(this.contribs[this.selectedContrib]);
			form.key = crypto.randomUUID();
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

			// if we deleted the opened form, change it to the previous one
			if (this.contribs.length === this.selectedContrib) --this.selectedContrib;
		},
		changeOpenedForm(index) {
			this.selectedContrib = index;
		},
		addNewUsers(users) {
			this.searchedContributors = users;
		},
		close() {
			this.$emit("close", false);
		},
		handleSubmit() {
			// the code is different enough for adding/creating it's worth having two functions
			return this.add ? this.addContributions() : this.editContribution();
		},
		async addContributions() {
			let success = true;
			const finalContributions = [];
			// can't use map since errors can be thrown
			for (const contrib of this.contribs) {
				const snackBar = this.$root.jsonSnackBar(contrib);

				// convert ranges into actual texture IDs
				const generatedRange = generateRange(contrib.texture);

				if (!generatedRange.length) {
					snackBar.showSnackBar(
						this.$root.lang().database.contributions.modal.id_field_errors.one_required,
						"error",
					);
					console.error(contrib);
					success = false;
				}

				if (contrib.authors.length === 0) {
					snackBar.showSnackBar(
						this.$root.lang().database.contributions.no_contributor_yet,
						"error",
					);
					console.error(contrib);
					success = false;
				}

				finalContributions.push(
					// sanitizes + removes key
					...generatedRange.map((textureID) => ({
						date: new Date(contrib.date).getTime(),
						pack: contrib.pack,
						authors: contrib.authors,
						texture: String(textureID),
					})),
				);
			}

			// all contributions must be valid
			if (!success) return;

			axios
				.post(`${this.$root.apiURL}/contributions`, finalContributions, this.$root.apiOptions)
				.then(() => {
					this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
					if (this.closeOnSubmit) this.$emit("close", true);
				})
				.catch((err) => {
					this.$root.showSnackBar(err, "error");
					console.error(err);
					return false;
				});
		},
		async editContribution() {
			const contrib = this.contribs[0];
			axios
				.put(
					`${this.$root.apiURL}/contributions/${contrib.id}`,
					{
						date: new Date(contrib.date).getTime(),
						pack: contrib.pack,
						authors: contrib.authors,
						texture: String(contrib.texture),
					},
					this.$root.apiOptions,
				)
				.then(() => {
					this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
					if (this.closeOnSubmit) this.$emit("close", true);
				})
				.catch((err) => {
					this.$root.showSnackBar(err, "error");
				});
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
	},
	watch: {
		value(newValue) {
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			this.$nextTick(() => {
				this.selectedContrib = 0;
				this.contribs = [this.add ? emptyContrib() : { ...this.data, key: crypto.randomUUID() }];
			});
			this.$emit("input", newValue);
		},
	},
};
</script>
