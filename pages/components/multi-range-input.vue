<template>
	<v-form lazy-validation ref="form">
		<v-combobox
			v-model="ranges"
			:items="undefined"
			:rules="getRules()"
			:multiple="multiple"
			:clearable="multiple"
			required
			:label="multiple ? '5 20 15-32' : '30'"
			single-line
			append-icon=""
			small-chips
			:deletable-chips="multiple"
			v-bind="$attrs"
			@keydown="onInput"
			class="my-0 pt-0"
		/>
	</v-form>
</template>

<script>
export default {
	name: "multi-range-input",
	props: {
		value: {
			required: true,
		},
		labels: {
			required: false,
			default: () => ({
				one_required: "One value required",
				incorrect_value: "%value% value incorrect",
			}),
		},
		multiple: {
			type: Boolean,
			required: true,
		},
	},
	data() {
		return {
			ranges: [],
		};
	},
	computed: {
		validRanges() {
			return this.ranges.filter((r) => this.checkRules([r]) === true);
		},
		styledRanges() {
			return this.transformToStyled(this.validRanges);
		},
		generatedValues() {
			return this.transformToGeneratedRange(this.styledRanges);
		},
	},
	methods: {
		checkRules(ranges) {
			let result = true;

			const rules = this.getRules();

			let i = 0;
			while (result === true && i < rules.length) {
				const ok = rules[i](ranges);
				if (ok === false || typeof ok === "string") result = ok;
				i += 1;
			}

			return result;
		},
		getRules() {
			return [
				(list) => !!list.length || this.labels.one_required,
				(list) => {
					let incorrectValue;
					let i = 0;
					while (incorrectValue === undefined && i < list.length) {
						const s = list[i];
						const correct = (() => {
							if (String(Number.parseInt(s, 10)) === s) return true;
							const numbers = s.split(/\s*-\s*/);
							if (numbers.length !== 2) return false;
							return (
								String(Number.parseInt(numbers[0], 10)) === numbers[0] &&
								String(Number.parseInt(numbers[1], 10)) === numbers[1]
							);
						})();
						if (!correct) incorrectValue = s;
						i += 1;
					}
					return incorrectValue
						? this.labels.incorrect_value.replace("%value%", incorrectValue)
						: true;
				},
			];
		},
		isNavCombo(keyboard_event) {
			const { key } = keyboard_event;
			const is_copy_paste =
				(keyboard_event.ctrlKey &&
					(key == "c" || key == "x" || key == "v" || key == "a" || key == "u")) ||
				keyboard_event.keyCode == 123;
			if (is_copy_paste) return true;
			return key === "Backspace" || (key === "Delete" && key.includes("Arrow"));
		},
		onInput(keyboard_event) {
			const { key } = keyboard_event;
			const not_a_num_key = Number.isNaN(Number.parseInt(key, 10));
			if (key !== " " && key !== "-" && not_a_num_key && !this.isNavCombo(keyboard_event)) {
				keyboard_event.preventDefault();
			}
		},
		transformToRaw(ranges) {
			return ranges.map((r) => (Array.isArray(r) ? r.join(" - ") : String(r)));
		},
		transformToStyled(ranges) {
			return ranges.map((r) => r.split(/\s*-\s*/).map((v) => Number.parseInt(v)));
		},
		transformToGeneratedRange(ranges) {
			const res = [];
			ranges.forEach((range) => {
				if (range.length === 1) res.push(range[0]);
				else {
					const min = Math.min(range[1], range[0]);
					res.push(
						...Array.from(new Array(Math.abs(range[1] - range[0]) + 1).keys()).map((n) => n + min),
					);
				}
			});

			const no_duplicates = res.filter((e, i, a) => a.indexOf(e) === i);
			no_duplicates.sort((a, b) => (a === b ? 0 : a < b ? -1 : 1));
			return no_duplicates;
		},
	},
	mounted() {
		this.$refs.form.validate();
	},
	created() {
		window.generateRange = this.transformToGeneratedRange;
	},
	watch: {
		value: {
			handler(n, o) {
				if (n === undefined || JSON.stringify(n) === JSON.stringify(o)) return;

				const transformed_value = this.multiple ? this.transformToRaw(n) : [String(n)];

				if (JSON.stringify(this.ranges) === JSON.stringify(transformed_value)) return;

				this.ranges = transformed_value;
			},
			immediate: true,
			deep: true,
		},
		styledRanges: {
			handler(n, o) {
				const sent = this.multiple ? n : n.flat()[0];
				this.$emit("input", sent);
			},
			immediate: true,
			deep: true,
		},
		validRanges: {
			handler(n) {
				this.$emit("valid-ranges", n);
			},
			immediate: true,
			deep: true,
		},
		generatedValues: {
			handler(n) {
				this.$emit("generated-values", n);
			},
			immediate: true,
			deep: true,
		},
	},
};
</script>
