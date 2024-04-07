<template>
	<div>
		<v-text-field v-model="newValue" dense hide-details placeholder="string..." />
	</div>
</template>

<script>
import JSONEditor from "./json-object-editor.vue";
import JSONAddEditor from "./json-add-editor.vue";

export default {
	name: "json-string-editor",
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
				if (Object.equals(n, o)) return;
				if (this.keys.length !== this.values.length) return;
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
