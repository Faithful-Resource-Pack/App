<template>
	<!-- wrapped by contribution-modal -->
	<v-form lazy-validation>
		<v-row :no-gutters="add">
			<v-col cols="12" :sm="add ? false : 6">
				<quick-date-picker
					:block="!add"
					flat
					v-model="contrib.date"
					:months="months"
					:labels="$root.lang().datepicker"
					style="margin-left: auto; margin-right: auto"
				/>
			</v-col>
			<v-col cols="12" :sm="add ? false : 6">
				<div class="font-weight-medium text--secondary my-2">
					{{ $root.lang().database.contributions.modal.pack }}
				</div>
				<v-select
					:items="packList"
					item-text="label"
					item-value="value"
					class="mt-0 pt-0 mb-2"
					hide-details
					required
					v-model="contrib.pack"
				/>
				<div class="font-weight-medium text--secondary my-2">
					{{ $root.lang().database.textures.modal.id }}
				</div>
				<multi-range-input
					v-if="add && Array.isArray(contrib.texture)"
					v-model="contrib.texture"
					:multiple="add"
					:labels="$root.lang().database.contributions.modal.id_field_errors"
				/>
				<div class="d-flex align-center mb-2" v-else>
					<v-text-field
						required
						dense
						type="number"
						hide-details
						class="mr-2 my-0 pt-0"
						min="0"
						v-model="contrib.texture"
					/>
					<v-btn icon @click="incrementTextureID">
						<v-icon>mdi-chevron-up</v-icon>
					</v-btn>
					<v-btn icon @click="decrementTextureID">
						<v-icon>mdi-chevron-down</v-icon>
					</v-btn>
				</div>
				<div class="font-weight-medium text--secondary mb-2">
					{{ $root.lang().database.contributions.contributors }}
				</div>
				<user-select
					dense
					:users="contributors"
					v-model="contrib.authors"
					class="my-0"
					:limit="3"
					:placeholder="$root.lang().database.contributions.modal.one_contributor"
					:error-messages="
						contrib.length === 0 ? [$root.lang().database.contributions.no_contributor_yet] : []
					"
					@newUser="(l) => this.$emit('newUser', l)"
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
