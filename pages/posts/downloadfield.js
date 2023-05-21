export default {
	name: 'download-field',
	props: {
		value: {
			type: Object,
			required: true
		},
		rulesName: {
			type: Array,
			required: true
		},
		"rulesURL": {
			type: Array,
			required: true
		}
	},
	template: `
	<v-row dense v-bind="$attrs">
		<v-col cols="2"><v-text-field
			class="mb-0"
			v-model="name"
			:label="$root.lang('posts.form.downloads.name.label')"
			:placeholder="$root.lang('posts.form.downloads.name.placeholder')"
			:hint="$root.lang('posts.form.downloads.name.hint')"
			:rules="rulesName"
			@change="handleName"
		/></v-col>
		<v-col cols="10"><v-text-field
			class="mb-0"
			v-model="url"
			:label="$root.lang('posts.form.downloads.url.label')"
			:placeholder="$root.lang('posts.form.downloads.url.placeholder')"
			:hint="$root.lang('posts.form.downloads.url.hint')"
			:rules="rulesURL"
			@change="handleURL"
		/></v-col>
	</v-row>`,
	data() {
		return {
			name: this.value.name,
			url: this.value.url
		}
	},
	watch: {
		value: {
			handler: function (n, o) {
				if (JSON.stringify(n) === JSON.stringify(o)) return;
				this.name = this.value.name
				this.url = this.value.url
			},
			immediate: true
		}
	},
	methods: {
		handleName(v) {
			this.name = v
			this.sendData()
		},
		handleURL(v) {
			this.url = v
			this.sendData()
		},
		sendData() {
			this.$emit({
				name: String(this.name),
				url: String(this.url)
			})
		}
	}
}