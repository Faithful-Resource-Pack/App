<template>
	<v-form ref="form" lazy-validation>
		<v-combobox
			v-model="ranges"
			:items="undefined"
			:rules="getRules()"
			multiple
			clearable
			required
			:label="label"
			placeholder="5 20 15-32"
			append-icon=""
			small-chips
			deletable-chips
			v-bind="$attrs"
			@keydown="onInput"
		/>
	</v-form>
</template>

<script>
import generateRange from "@helpers/generateRange";

export default {
	name: "multi-range-input",
	props: {
		value: {
			type: Array,
			required: true,
		},
		label: {
			type: String,
			required: false,
			default: "",
		},
		errors: {
			required: false,
			default: () => ({
				one_required: "One value required",
				incorrect_value: "%value% value incorrect",
			}),
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
			return this.generateRange(this.styledRanges);
		},
	},
	methods: {
		generateRange,
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
				(list) => !!list.length || this.errors.one_required,
				(list) => {
					let incorrectValue;
					for (let i = 0; incorrectValue === undefined && i < list.length; ++i) {
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
					}
					return incorrectValue
						? this.errors.incorrect_value.replace("%value%", incorrectValue)
						: true;
				},
			];
		},
		isNavCombo(keyboardEvent) {
			const { key } = keyboardEvent;
			const isCopyPaste =
				(keyboardEvent.ctrlKey &&
					(key == "c" || key == "x" || key == "v" || key == "a" || key == "u")) ||
				keyboardEvent.keyCode == 123;
			if (isCopyPaste) return true;
			return key === "Backspace" || (key === "Delete" && key.includes("Arrow"));
		},
		onInput(keyboardEvent) {
			const { key } = keyboardEvent;
			const notNumKey = Number.isNaN(Number.parseInt(key, 10));
			if (key !== " " && key !== "-" && notNumKey && !this.isNavCombo(keyboardEvent)) {
				keyboardEvent.preventDefault();
			}
		},
		transformToRaw(ranges) {
			return ranges.map((r) => (Array.isArray(r) ? r.join(" - ") : String(r)));
		},
		transformToStyled(ranges) {
			return ranges.map((r) => r.split(/\s*-\s*/).map((v) => Number.parseInt(v)));
		},
	},
	watch: {
		value: {
			handler(n, o) {
				if (n === undefined || JSON.stringify(n) === JSON.stringify(o)) return;

				const transformedValue = this.transformToRaw(n);

				if (JSON.stringify(this.ranges) === JSON.stringify(transformedValue)) return;

				this.ranges = transformedValue;
			},
			immediate: true,
			deep: true,
		},
		styledRanges: {
			handler(n) {
				this.$emit("input", n);
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
