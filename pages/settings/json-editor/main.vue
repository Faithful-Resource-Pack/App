<template>
	<div :class="['json-editor', { 'pl-2': !root }]">
		<json-string-editor v-if="type === 'string'" v-model="newValue" :parent="value" />
		<json-number-editor v-else-if="type === 'number'" v-model="newValue" :parent="value" />
		<json-boolean-editor v-else-if="type === 'boolean'" v-model="newValue" :parent="value" />
		<json-null-editor v-else-if="type === 'null'" v-model="newValue" :parent="value" />
		<json-object-editor
			v-else-if="type === 'object'"
			v-model="newValue"
			:parent="value"
			:root="root"
		/>
		<json-array-editor
			v-else-if="type === 'array'"
			v-model="newValue"
			:parent="value"
			:root="root"
		/>
	</div>
</template>

<script>
import JSONObjectEditor from "./json-object-editor.vue";
import JSONStringEditor from "./json-string-editor.vue";
import JSONNumberEditor from "./json-number-editor.vue";
import JSONBooleanEditor from "./json-boolean-editor.vue";
import JSONNullEditor from "./json-null-editor.vue";
import JSONArrayEditor from "./json-array-editor.vue";

export default {
	name: "json-editor",
	components: {
		JSONObjectEditor,
		JSONStringEditor,
		JSONNumberEditor,
		JSONBooleanEditor,
		JSONNullEditor,
		JSONArrayEditor,
	},
	props: {
		value: {
			required: true,
		},
		root: {
			required: false,
			type: Boolean,
			default: false,
		},
		parent: {
			required: false,
			default: undefined,
		},
	},
	data() {
		return {
			newValue: {},
		};
	},
	computed: {
		type() {
			const obj = this.newValue;
			return obj === null ? "null" : Array.isArray(obj) ? "array" : typeof obj;
		},
	},
	watch: {
		newValue: {
			handler(n, o) {
				if (Object.equals(n, o)) return;
				this.$forceUpdate();
				this.$emit("input", n);
			},
			deep: true,
		},
		value: {
			handler(n, o) {
				if (Object.equals(n, o)) return;
				this.newValue = n;
			},
			deep: true,
			immediate: true,
		},
	},
};
</script>
