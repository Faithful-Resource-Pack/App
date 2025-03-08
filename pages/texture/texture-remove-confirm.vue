<template>
	<modal-form
		v-model="modalOpened"
		danger
		:title="$root.lang().database.confirm_deletion"
		@close="$emit('close')"
		@submit="deleteData"
	>
		<p>Do you want to delete this {{ type }}?</p>
		<v-alert v-if="type == 'use'" type="warning" class="px-2" outlined dense>
			{{ $root.lang().database.textures.deleting_use_will_delete_paths }}
		</v-alert>
		<blockquote v-if="type == 'use'">
			<v-btn text @click="getPaths(data.id)"> See affected paths </v-btn>
			<br />
			<v-list-item v-for="path in data.paths" :key="path.id">
				<v-list-item-title>
					{{ path.name }}
					<v-list-item-subtitle>
						{{ `#${path.id} — ${path.versions.join(", ")}` }}
					</v-list-item-subtitle>
				</v-list-item-title>
			</v-list-item>
		</blockquote>
		<ul v-else>
			<template v-for="key in Object.keys(data).sort()">
				<li v-if="typeof data[key] === 'string' || Array.isArray(data[key])" :key="key">
					{{ key.toTitleCase() }}: {{ Array.isArray(data[key]) ? data[key].join(", ") : data[key] }}
				</li>
			</template>
		</ul>
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
			default: () => Promise.resolve(),
		},
	},
	data() {
		return {
			modalOpened: false,
			formData: {},
			deletePaths: true,
			paths: {},
		};
	},
	methods: {
		getPaths(useID) {
			axios
				.get(`${this.$root.apiURL}/uses/${useID}/paths`, this.$root.apiOptions)
				.then((res) => {
					const temp = res.data;
					this.data.paths = {};

					for (let i = 0; i < temp.length; i++) this.data.paths[temp[i].id] = temp[i];

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
