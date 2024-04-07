<template>
	<v-dialog v-model="modalOpened" content-class="colored" max-width="600">
		<v-card>
			<v-card-title class="headline">Confirm deletion</v-card-title>
			<v-card-text>
				<v-form lazy-validation>
					<p>Do you want to delete this {{ type }}?</p>
					<v-alert v-if="type == 'use'" type="warning" class="px-2" outlined dense>
						{{ $root.lang("database.messages.deleting_use_will_delete_paths") }}
					</v-alert>
					<blockquote v-if="type == 'use'">
						<v-btn text @click="getPaths(data.id)"> See affected paths </v-btn>

						<br />

						<v-list-item v-for="(path, index) in data.paths" :key="index">
							<v-list-item-title>
								{{ path.name }}
								<v-list-item-subtitle>{{
									`#${path.id} — ${path.versions.join(", ")}`
								}}</v-list-item-subtitle>
							</v-list-item-title>
						</v-list-item>
					</blockquote>
					<ul v-else>
						<template v-for="(key, index) in Object.keys(data).sort()">
							<li v-if="typeof data[key] === 'string' || Array.isArray(data[key])" :key="index">
								{{ key }}: {{ Array.isArray(data[key]) ? data[key].join(", ") : data[key] }}
							</li>
						</template>
					</ul>
				</v-form>
			</v-card-text>
			<v-card-actions>
				<v-spacer />
				<v-btn color="darken-1" text @click="disableDialog">
					{{ $root.lang().global.btn.cancel }}
				</v-btn>
				<v-btn color="error darken-1" @click="deleteData">
					{{ $root.lang().global.btn.yes }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
import axios from "axios";

export default {
	name: "texture-remove-confirm",
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		data: {
			type: Object,
			required: true,
		},
		disableDialog: {
			type: Function,
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
							this.disableDialog(true);
						})
						.catch((err) => {
							console.error(err);
							this.$root.showSnackBar(err, "error");
							this.disableDialog(true);
						});
				case "path":
					const pathId = this.data.id;
					return axios
						.delete(`${this.$root.apiURL}/paths/${pathId}`, this.$root.apiOptions)
						.then(() => {
							this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
							this.disableDialog(true);
						})
						.catch((err) => {
							console.error(err);
							this.$root.showSnackBar(err, "error");
							this.disableDialog(true);
						});
				case "texture":
					return this.onSubmit(this.data)
						.then(() => this.disableDialog(true))
						.catch((err) => {
							console.error(err);
							this.$root.showSnackBar(err, "error");
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
