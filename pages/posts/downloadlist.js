const DownloadField = () => import("./downloadfield.js")

export default {
	name: 'download-list',
	props: {
		value: {
			type: Object,
			required: true
		},
		rulesName: {
			type: Array,
			required: true
		},
		rulesURL: {
			type: Array,
			required: true
		}
	},
	components: {
		DownloadField
	},
	template: `
	<div v-bind="$attrs">
		<div v-for="(_, g_i) in content" :key="'download-group-' + g_i">
			<v-row dense class="align-center">
				<v-col><v-text-field class="mb-0"
					v-model="content[g_i].name"
					:label="$root.lang('posts.form.downloads.group.label')"
					:placeholder="$root.lang('posts.form.downloads.group.placeholder')"
					:hint="$root.lang('posts.form.downloads.group.hint')"
					:rules="rulesName"
				/></v-col>
				<v-col class="flex-grow-0 flex-shrink-0">
					<v-icon color="error" @click="() => removeGroup(g_i)">mdi-close</v-icon>
				</v-col>
			</v-row>
			<v-row dense class="align-top">
				<v-col class="flex-grow-0 flex-shrink-0">
					<v-btn small @click="() => addDownload(g_i)">
						{{ $root.lang('global.btn.add_download') }}
						<v-icon color="white lighten-1">mdi-plus</v-icon>
					</v-btn>
				</v-col>
				<v-col>
					<v-row dense class="align-center" 
						v-for="(_,l_i) in content[g_i].list"
						:key="'download-list-' + g_i + '-' + l_i">
						<v-col><DownloadField
							v-model="content[g_i].list[l_i]"
							:rulesName="rulesName"
							:rulesURL="rulesURL"
						/></v-col>
						<v-col class="flex-grow-0 flex-shrink-0">
							<v-icon class="mb-4" color="error" @click="() => removeDownload(g_i, l_i)">mdi-close</v-icon>
						</v-col>
					</v-row>
				</v-col>
			</v-row>
		</div>
		<div>
			<v-btn block @click="addGroup">
				{{ $root.lang('global.btn.add_group') }}
				<v-icon color="white lighten-1">mdi-plus</v-icon>
			</v-btn>
		</div>
	</div>`,
	data() {
		return {
			content: this.mapValue(this.value)
		}
	},
	watch: {
		value: {
			handler: function (n, o) {
				if (JSON.stringify(n) === JSON.stringify(o)) return;
				this.content = this.mapValue(this.value)
			},
			deep: true,
			immediate: true
		},
		content: {
			handler: function () {
				this.$emit("input", this.unMapValue(this.content))
			},
			deep: true
		}
	},
	methods: {
		mapValue(v) {
			if (!v) return []
			return Object.entries(JSON.parse(JSON.stringify(v)))
				.map(([key, value]) => ({
					name: key,
					list: value
				}))
		},
		unMapValue(v) {
			if (!v) return {}
			const res = v.reduce((acc, cur) => ({
				...acc,
				[cur.name]: cur.list
			}), {})
			console.log(res)
			return res
		},
		addGroup() {
			let copy = JSON.parse(JSON.stringify(this.content))
			copy.push({
				name: "",
				list: []
			})
			Vue.set(this, "content", copy)
		},
		removeGroup(groupIndex) {
			let copy = JSON.parse(JSON.stringify(this.content))
			copy.splice(groupIndex, 1)
			Vue.set(this, "content", copy)
		},
		addDownload(groupIndex) {
			let copy = JSON.parse(JSON.stringify(
				this.content[groupIndex].list
			))
			copy.push({
				name: "",
				url: ""
			})
			Vue.set(this.content[groupIndex], "list", copy)
		},
		removeDownload(groupIndex, listIndex) {
			let copy = JSON.parse(JSON.stringify(this.content[groupIndex].list))
			copy.splice(listIndex, 1)
			Vue.set(this.content[groupIndex], "list", copy)
		},
	}
}