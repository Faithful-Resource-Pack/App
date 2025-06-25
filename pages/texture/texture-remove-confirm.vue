<template>
	<modal-form
		v-model="modalOpened"
		danger
		:title="$root.lang().database.confirm_deletion"
		@close="$emit('close')"
		@submit="deleteData"
	>
		<v-alert v-if="type == 'use'" type="warning" outlined dense>
			{{ $root.lang().database.textures.delete_modal.deleting_use_will_delete_paths }}
		</v-alert>
		<ul>
			<li v-for="key in cleanedData" :key="key">
				{{ key.toTitleCase() }}: {{ Array.isArray(data[key]) ? data[key].join(", ") : data[key] }}
			</li>
		</ul>
		<template v-if="type == 'use'">
			<v-divider class="ma-3" />
			<v-btn block color="secondary" @click="getPaths(data.id)">
				{{ $root.lang().database.textures.delete_modal.load_paths }}
			</v-btn>
			<v-list>
				<v-list-item v-for="path in paths" :key="path.id">
					<v-list-item-title>
						{{ path.name }}
						<v-list-item-subtitle>
							{{ `${path.id} — ${path.versions.join(", ")}` }}
						</v-list-item-subtitle>
					</v-list-item-title>
				</v-list-item>
			</v-list>
		</template>
	</modal-form>
</template>

<script>
import axios from "axios";
import ModalForm from "@components/modal-form.vue";

export default {
	name: "texture-remove-confirm",
	components: {
		ModalForm,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		data: {
			type: Object,
			required: true,
		},
		type: {
			type: String,
			required: true,
		},
		onSubmit: {
			type: Function,
			required: false,
			default: () => Promise.resolve(),
		},
	},
	data() {
		return {
			modalOpened: false,
			deletePaths: true,
			paths: {},
		};
	},
	methods: {
		getPaths(useID) {
			axios
				.get(`${this.$root.apiURL}/uses/${useID}/paths`, this.$root.apiOptions)
				.then((res) => {
					this.paths = res.data.reduce((acc, path) => {
						acc[path.id] = path;
						return acc;
					}, {});

					this.$forceUpdate();
				})
				.catch((err) => {
					console.error(err);
				});
		},
		deleteData() {
			switch (this.type) {
				case "use":
					const useId = this.data.id;
					return axios
						.delete(`${this.$root.apiURL}/uses/${useId}`, this.$root.apiOptions)
						.then(() => {
							this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
							this.$emit("close", true);
						})
						.catch((err) => {
							console.error(err);
							this.$root.showSnackBar(err, "error");
							this.$emit("close", true);
						});
				case "path":
					const pathId = this.data.id;
					return axios
						.delete(`${this.$root.apiURL}/paths/${pathId}`, this.$root.apiOptions)
						.then(() => {
							this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
							this.$emit("close", true);
						})
						.catch((err) => {
							console.error(err);
							this.$root.showSnackBar(err, "error");
							this.$emit("close", true);
						});
				case "texture":
					return this.onSubmit(this.data)
						.then(() => this.$emit("close", true))
						.catch((err) => {
							console.error(err);
							this.$root.showSnackBar(err, "error");
							this.$emit("close", true);
						});
			}
		},
	},
	computed: {
		cleanedData() {
			return Object.keys(this.data)
				.filter((k) => typeof this.data[k] === "string" || Array.isArray(this.data[k]))
				.sort();
		},
	},
	watch: {
		value(newValue) {
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			this.paths = {};
			this.$emit("input", newValue);
		},
	},
};
</script>
