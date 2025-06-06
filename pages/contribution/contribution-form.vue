<template>
	<!-- wrapped by contribution-modal -->
	<v-form lazy-validation>
		<v-row>
			<v-col cols="12" :sm="add ? false : 6">
				<quick-date-picker
					v-model="contrib.date"
					:block="!add"
					flat
					:months="months"
					:labels="$root.lang().datepicker"
					style="margin-left: auto; margin-right: auto"
				/>
			</v-col>
			<v-col cols="12" :sm="add ? false : 6">
				<v-select
					v-model="contrib.pack"
					:label="$root.lang().database.contributions.modal.pack"
					:items="packList"
					item-text="label"
					item-value="value"
					hide-details
					required
				/>
				<!-- must manually handle v-model to prevent type errors -->
				<multi-range-input
					v-if="add"
					:value="Array.isArray(contrib.texture) ? contrib.texture : []"
					:label="$root.lang().database.contributions.modal.texture_ids"
					hide-details
					:errors="$root.lang().database.contributions.modal.id_field_errors"
					@input="
						(value) => {
							contrib.texture = value;
						}
					"
				/>
				<div v-else class="d-flex align-center">
					<v-text-field
						v-model="contrib.texture"
						:label="$root.lang().database.contributions.modal.texture_id"
						required
						type="number"
						hide-details
						class="mr-2"
						min="0"
					/>
					<v-btn icon @click="incrementTextureID">
						<v-icon>mdi-chevron-up</v-icon>
					</v-btn>
					<v-btn icon @click="decrementTextureID">
						<v-icon>mdi-chevron-down</v-icon>
					</v-btn>
				</div>
				<user-select
					v-model="contrib.authors"
					:users="contributors"
					:label="$root.lang().database.contributions.contributors"
					:limit="3"
					small-chips
					:placeholder="$root.lang().database.contributions.modal.one_contributor"
					:error-messages="
						contrib.length === 0 ? [$root.lang().database.contributions.no_contributor_yet] : []
					"
					@newUser="(users) => this.$emit('newUser', users)"
				/>
			</v-col>
		</v-row>
	</v-form>
</template>

<script>
import moment from "moment";

import UserSelect from "@components/user-select.vue";
import QuickDatePicker from "@components/quick-date-picker.vue";
import MultiRangeInput from "@components/multi-range-input.vue";

export default {
	name: "contribution-form",
	components: {
		UserSelect,
		QuickDatePicker,
		MultiRangeInput,
	},
	props: {
		value: {
			type: Object,
			required: true,
		},
		add: {
			type: Boolean,
			required: false,
			default: false,
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
			contrib: this.value,
			months: moment.monthsShort(),
		};
	},
	methods: {
		incrementTextureID() {
			const incremented = Number(this.contrib.texture) + 1;
			this.contrib.texture = String(incremented);
		},
		decrementTextureID() {
			const decremented = Number(this.contrib.texture) - 1;
			// min zero
			this.contrib.texture = String(Math.max(decremented, 0));
		},
	},
	computed: {
		packList() {
			return this.packs.map((p) => ({
				label: p.name,
				value: p.id,
			}));
		},
	},
	watch: {
		value: {
			handler(n, o) {
				if (n !== undefined && JSON.stringify(n) !== JSON.stringify(o)) this.contrib = n;
			},
			immediate: true,
			deep: true,
		},
		contrib: {
			handler(n) {
				this.$emit("input", n);
			},
			deep: true,
		},
	},
};
</script>
