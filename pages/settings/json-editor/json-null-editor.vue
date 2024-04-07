<template>
	<div>
		<i>null</i>
	</div>
</template>

<script>
import JSONEditor from "./json-object-editor.vue";
import JSONAddEditor from "./json-add-editor.vue";

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
