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
					:packs="packs"
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
			@newUser="
				(l) => {
					searchedContributors = l;
				}
			"
		/>
	</modal-form>
</template>

<script>
import ModalForm from "@components/modal-form.vue";
import ContributionForm from "./contribution-form.vue";
import SummaryItem from "./summary-item.vue";

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
		close() {
			this.modalOpened = false;
		},
		async closeAndSubmit() {
			const resultDataList = Object.values(this.contribs).map((f) => {
				delete f.key;
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
