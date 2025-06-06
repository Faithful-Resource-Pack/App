<template>
	<v-dialog v-model="modalOpened" content-class="colored" max-width="800">
		<v-card>
			<h2 class="title text--secondary ma-2">
				{{ $root.lang().global.json_editor.import_data }}
			</h2>
			<prism-editor
				v-model="jsonData"
				class="json-editor json-modal-editor"
				:highlight="highlighter"
				line-numbers
			/>
			<v-btn block :color="color" class="white--text" @click="parseJSON">
				{{ $root.lang().global.json_editor.parse_json }}
			</v-btn>
		</v-card>
	</v-dialog>
</template>

<script>
import Prism from "prismjs";
import { PrismEditor } from "vue-prism-editor";

export default {
	name: "json-modal",
	components: {
		PrismEditor,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		color: {
			type: String,
			required: false,
			default: "primary",
		},
		// sometimes useful to set an array or object by default
		initialValue: {
			type: String,
			required: false,
			default: "",
		},
	},
	data() {
		return {
			modalOpened: false,
			// you can access props from data
			jsonData: this.initialValue,
		};
	},
	methods: {
		highlighter(code) {
			return Prism.highlight(code, Prism.languages.js, "json");
		},
		parseJSON() {
			try {
				this.$emit("data", JSON.parse(this.jsonData));
				// reset modal only if emitted correctly (user can fix typos without form clearing randomly)
				this.modalOpened = false;
				this.jsonData = this.initialValue;
			} catch (err) {
				console.error(err);
				this.$root.showSnackBar(err, "error");
			}
		},
	},
	watch: {
		value(newValue) {
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			this.$emit("input", newValue);
		},
	},
};
</script>
