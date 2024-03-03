<template>
	<div>
		<v-text-field v-model="newValue" type="number" dense hide-details placeholder="number..." />
	</div>
</template>

<script>
const JSONEditor = () => import("./jsonObjectEditor.vue");
const JSONAddEditor = () => import("./jsonAddEditor.vue");

function deepEqual(x, y) {
	if (x === y) return true;
	if (typeof x == "object" && x != null && typeof y == "object" && y != null) {
		if (Object.keys(x).length != Object.keys(y).length) return false;

		for (const prop in x) {
			if (y.hasOwnProperty(prop)) {
				if (!deepEqual(x[prop], y[prop])) return false;
			} else return false;
		}
		return true;
	}
	return false;
}

export default {
	name: "json-number-editor",
	components: {
		JSONEditor,
		JSONAddEditor,
	},
	props: {
		value: {
			required: true,
		},
		parent: {
			required: false,
			default: undefined,
		},
	},
	data() {
		return {
			newValue: "",
		};
	},
	watch: {
		newValue(n, o) {
			if (n === o) return;

			this.$emit("input", n);
		},
		value: {
			handler(n, o) {
				if (o === undefined) return;
				if (deepEqual(n, o)) return;
				if (this.keys.length !== this.values.length) return;
				// console.log('values', n, o, this.keys, this.values, this.value);

				this.$emit("input", this.construct());
			},
			deep: true,
		},
	},
	beforeMount() {
		this.newValue = this.value;
	},
};
</script>
