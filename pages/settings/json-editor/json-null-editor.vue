<template>
	<div>
		<i>null</i>
	</div>
</template>

<script>
import JSONEditor from "./json-object-editor.vue";
import JSONAddEditor from "./json-add-editor.vue";

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
	name: "json-null-editor",
	props: {
		value: {
			required: true,
		},
		parent: {
			required: false,
			default: undefined,
		},
	},
};
</script>
