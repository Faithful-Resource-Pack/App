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
import generateRange from "@helpers/generateRange";

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

				const transformedValue = this.multiple ? this.transformToRaw(n) : [String(n)];

				if (JSON.stringify(this.ranges) === JSON.stringify(transformedValue)) return;

				this.ranges = transformedValue;
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
