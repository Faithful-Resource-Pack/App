const jsonObjectEditor = () => import("./jsonObjectEditor.js");
const jsonStringEditor = () => import("./jsonStringEditor.js");
const jsonNumberEditor = () => import("./jsonNumberEditor.js");
const jsonBooleanEditor = () => import("./jsonBooleanEditor.js");
const jsonNullEditor = () => import("./jsonNullEditor.js");
const jsonArrayEditor = () => import("./jsonArrayEditor.js");

var deepEqual = function (x, y) {
	if (x === y) {
		return true;
	} else if (typeof x == "object" && x != null && typeof y == "object" && y != null) {
		if (Object.keys(x).length != Object.keys(y).length) return false;

		for (var prop in x) {
			if (y.hasOwnProperty(prop)) {
				if (!deepEqual(x[prop], y[prop])) return false;
			} else return false;
		}

		return true;
	} else return false;
};

export default {
	name: "json-editor",
	components: {
		jsonObjectEditor,
		jsonStringEditor,
		jsonNumberEditor,
		jsonBooleanEditor,
		jsonNullEditor,
		jsonArrayEditor,
	},
	template: `
<div :class="['json-editor', { 'pl-2': !root }]">
  <json-string-editor v-if="type === 'string'" v-model="newValue" :parent="value" />
  <json-number-editor v-else-if="type === 'number'" v-model="newValue" :parent="value" />
  <json-boolean-editor v-else-if="type === 'boolean'" v-model="newValue" :parent="value" />
  <json-null-editor v-else-if="type === 'null'" v-model="newValue" :parent="value" />
  <json-object-editor v-else-if="type === 'object'" v-model="newValue" :parent="value" :root="root" />
  <json-array-editor v-else-if="type === 'array'" v-model="newValue" :parent="value" :root="root" />
</div>`,
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
	data: function () {
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
				if (deepEqual(n, o)) return;
				console.info(this.newValue);
				this.$forceUpdate();
				this.$emit("input", n);
			},
			deep: true,
		},
		value: {
			handler(n, o) {
				if (deepEqual(n, o)) return;
				this.newValue = n;
			},
			deep: true,
			immediate: true,
		},
	},
};
