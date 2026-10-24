<template>
	<v-row class="mt-0 mb-1 align-baseline">
		<v-col cols="12" sm="9">
			<p class="text--secondary mb-0">
				<template v-if="requestTime > 0 && length > 0">{{ resultMessage }}</template>
				<template v-else-if="loading">{{ $root.lang().global.loading }}</template>
				<template v-else>{{ $root.lang().global.no_results }}</template>
			</p>
		</v-col>
		<v-col cols="12" sm="3">
			<v-select
				v-model="sort"
				color="text--secondary"
				dense
				hide-details
				:items="shownSortMethods"
				item-text="label"
				item-value="value"
			/>
		</v-col>
	</v-row>
</template>

<script>
export default {
	name: "gallery-status-bar",
	props: {
		value: {
			type: String,
			required: true,
		},
		timer: {
			type: Object,
			required: true,
		},
		length: {
			type: Number,
			required: true,
		},
		// restrict the sort methods shown (all by default)
		methods: {
			type: Array,
			required: false,
			default: () => [],
		},
		loading: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	emits: ["input"],
	data() {
		const sortStrings = this.$root.lang().gallery.sort;
		return {
			sortMethods: [
				{ label: sortStrings.name_asc, value: "nameAsc" },
				{ label: sortStrings.name_desc, value: "nameDesc" },
				{ label: sortStrings.id_asc, value: "idAsc" },
				{ label: sortStrings.id_desc, value: "idDesc" },
				{ label: sortStrings.contrib_desc, value: "contribDesc" },
			],
			sort: undefined,
		};
	},
	computed: {
		shownSortMethods() {
			if (!this.methods.length) return this.sortMethods;
			return this.sortMethods.filter((m) => this.methods.includes(m.value));
		},
		requestTime() {
			if (!this.timer.end || !this.timer.start) return;
			const seconds = (this.timer.end - this.timer.start) / 1000;
			// cast to number again to remove unnecessary zeros
			return Number(seconds.toFixed(2));
		},
		resultMessage() {
			const str =
				this.length === 1
					? this.$root.lang().gallery.result_stats_singular
					: this.$root.lang().gallery.result_stats_plural;

			return str.replace("%COUNT%", this.length).replace("%SECONDS%", this.requestTime);
		},
	},
	watch: {
		value: {
			handler(newValue) {
				this.sort = newValue;
			},
			immediate: true,
		},
		sort(newValue) {
			this.$emit("input", newValue);
		},
	},
};
</script>
