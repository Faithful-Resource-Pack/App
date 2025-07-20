<template>
	<v-container>
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div class="styles" v-html="pageStyles" />
		<div class="text-h4 py-4">
			{{ $root.lang().settings.title }}
		</div>
		<v-btn :color="pageColor" :disabled="jsonIsNotValid" block append-icon @click="save">
			{{ $root.lang().global.btn.save }} <v-icon right>mdi-content-save</v-icon>
		</v-btn>
		<div class="my-5 text-h5">{{ $root.lang().settings.label.edit_raw }}</div>
		<prism-editor
			v-model="jsonText"
			style="max-height: 600px"
			class="ma-0 json-editor mb-2"
			:highlight="highlighter"
			line-numbers
		/>
	</v-container>
</template>

<script>
import axios from "axios";
import Prism from "prismjs";

import { PrismEditor } from "vue-prism-editor";
import { generatePageStyles } from "@helpers/colors";

export default {
	name: "settings-page",
	components: {
		PrismEditor,
	},
	data() {
		return {
			pageColor: "blue-grey lighten-1",
			pageStyles: "",
			jsonText: "{}",
			json: {},
		};
	},
	computed: {
		jsonIsNotValid() {
			try {
				JSON.parse(this.jsonText);
				return false;
			} catch (_ignored) {
				console.error(_ignored);
			}
			return true;
		},
	},
	methods: {
		highlighter(code) {
			return Prism.highlight(code, Prism.languages.js, "json");
		},
		save() {
			axios
				.post(`${this.$root.apiURL}/settings/raw`, this.json, this.$root.apiOptions)
				.then(() => this.$root.showSnackBar(this.$root.lang().global.ends_success, "success"))
				.catch((err) => {
					console.error(err);
					this.$root.showSnackBar(err, "error");
				});
		},
	},
	watch: {
		json(n, o) {
			//* update if content different
			const newStringified = JSON.stringify(n, null, 2);
			if (newStringified !== JSON.stringify(o, null, 2)) {
				//* update if text content is updated : new line, new space, the text must not be adapted if same content
				if (newStringified !== JSON.stringify(JSON.parse(this.jsonText), null, 2)) {
					this.jsonText = newStringified;
				}
			}
		},
		jsonText(n, o) {
			try {
				const parsed = JSON.parse(n);
				this.json = parsed;
			} catch (_ignore) {}
		},
	},
	created() {
		axios
			.get(`${this.$root.apiURL}/settings/raw`)
			.then((res) => {
				this.json = res.data;
			})
			.catch((err) => {
				console.error(err);
				this.$root.showSnackBar(err, "error");
			});
	},
	mounted() {
		this.pageStyles = generatePageStyles(this, this.pageColor);
	},
};
</script>
