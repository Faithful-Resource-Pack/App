export default {
	name: "json-add-editor",
	template: `
<table class="json-add-editor"><tr>
    <td>Add: </td>
    <td v-for="type in Object.keys(types)" :key="type" @click="send(types[type])" v-text="type"></td>
</tr></table>`,
	data() {
		return {
			types: {
				string: "",
				number: 0,
				boolean: true,
				array: [],
				object: {},
				null: null,
			},
		};
	},
	methods: {
		send(obj) {
			this.$emit("clicked", obj);
		},
	},
};
