<template>
	<div :class="['json-object-editor', { 'json-editor-bordered': !root }]">
		<div class="json-editor-header" @click="toggled = !toggled">
			<span v-if="!root" class="json-editor-toggle">{{ toggled ? "-" : "+" }}</span>
			<span v-if="!root" class="json-editor-title">array</span>
		</div>
		<div v-show="toggled" class="json-editor-content">
			<div v-for="(val, index) in values" :key="val + index" class="d-flex">
				<div class="json-object-key">
					<span class="json-editor-delete" @click="() => deleteItem(index)"> delete </span>
				</div>
				<json-editor class="flex-grow-1" v-model="values[index]" :parent="value" />
			</div>
			<json-add-editor @clicked="onClickChild" />
		</div>
	</div>
</template>

<script>
// fixes circular dependency error
const JSONEditor = () => import("./main.vue");
import JSONAddEditor from "./json-add-editor.vue";

export default {
	name: "json-array-editor",
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
		root: {
			required: false,
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			values: [],
			toggled: true,
		};
	},
	methods: {
		deleteItem(index) {
			this.values.splice(index, 1);
		},
		extractKeysAndValues() {
			this.values = this.value;
		},
		onClickChild(obj) {
			this.values.push(obj);
		},
		/**
		 * Constructs object with key and values
		 * @returns {Object} final object constructed
		 */
		construct() {
			if (!this.values.length) throw new Error("Not an array");

			return this.values;
		},
	},
	watch: {
		value: {
			handler(n, o) {
				if (o === undefined) return;
				if (Object.equals(n, o)) return;

				if (Array.isArray(n)) this.extractKeysAndValues();
			},
			immediate: true,
			deep: true,
		},
		values: {
			handler(n, o) {
				if (o === undefined) return;
				if (Object.equals(n, o)) return;
				this.$emit("input", this.construct());
			},
			deep: true,
		},
	},
	created() {},
	beforeMount() {
		if (!Array.isArray(this.value)) throw new Error("Value not an object");
		this.extractKeysAndValues();
	},
};
</script>
