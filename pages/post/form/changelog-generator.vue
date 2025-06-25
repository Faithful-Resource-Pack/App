<template>
	<!-- not extending modal-form since this has no action buttons -->
	<v-dialog v-model="modalOpened" content-class="colored" max-width="800">
		<v-card>
			<v-card-title class="headline">
				{{ $root.lang().posts.changelog_generator.heading }}
			</v-card-title>
			<v-card-text>
				<v-alert type="warning" outlined dense>
					{{ $root.lang().posts.changelog_generator.warning }}
				</v-alert>
				<v-row>
					<v-col>
						<v-text-field
							v-model="date"
							:label="$root.lang().posts.changelog_generator.date"
							:placeholder="$root.lang().posts.general.date.placeholder"
							persistent-placeholder
							hide-details
						/>
					</v-col>
					<v-col>
						<v-select
							v-model="selectedPack"
							:label="$root.lang().posts.changelog_generator.pack"
							:items="packs"
							hide-details
							item-text="name"
							item-value="id"
						/>
					</v-col>
				</v-row>
				<v-row>
					<v-col>
						<v-btn
							block
							color="secondary"
							:disabled="formInvalid"
							:loading="loading"
							@click="generate"
						>
							{{ $root.lang().posts.changelog_generator.heading }}<v-icon right>mdi-pencil</v-icon>
						</v-btn>
					</v-col>
				</v-row>
				<template v-if="outputData">
					<v-divider class="my-5" />
					<v-row>
						<v-col>
							<v-btn block color="secondary" @click="copyData">
								{{ $root.lang().posts.changelog_generator.copy }}
								<v-icon right>mdi-content-copy</v-icon>
							</v-btn>
						</v-col>
						<v-col>
							<v-btn block color="secondary" :href="fileURL" :download="fileName">
								{{ $root.lang().posts.changelog_generator.download }}
								<v-icon right>mdi-download</v-icon>
							</v-btn>
						</v-col>
					</v-row>
					<prism-editor
						v-model="outputData"
						class="json-editor json-modal-editor mt-5"
						readonly
						:highlight="highlighter"
					/>
				</template>
			</v-card-text>
		</v-card>
	</v-dialog>
</template>

<script>
import axios from "axios";

import Prism from "prismjs";
import { PrismEditor } from "vue-prism-editor";

export default {
	name: "changelog-generator",
	components: {
		PrismEditor,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
	},
	data() {
		return {
			date: "",
			selectedPack: "",
			modalOpened: false,
			packs: [],
			loading: false,
			outputData: "",
			fileURL: "",
			idToUsername: {},
		};
	},
	methods: {
		highlighter(code) {
			return Prism.highlight(code, Prism.languages.js, "json");
		},
		copyData() {
			navigator.clipboard.writeText(this.outputData);
			this.$root.showSnackBar(this.$root.lang().database.textures.modal.copy_json_data, "success");
		},
		async generate() {
			this.loading = true;
			const [allContributions, textures] = await Promise.all([
				axios
					.get(
						`${this.$root.apiURL}/contributions/between/${new Date(this.date).getTime()}/${Date.now()}`,
					)
					.then((res) => res.data),
				axios.get(`${this.$root.apiURL}/textures/raw`).then((res) => res.data),
			]).catch((err) => {
				this.loading = false;
				this.$root.showSnackBar(err, "error");
				return [null, null];
			});

			if (allContributions === null) return;

			const finalData = allContributions
				// get correct pack (there's no endpoint for both date and pack)
				.filter((contribution) => contribution.pack === this.selectedPack)
				// merge the two objects by id
				.map(({ texture, date, authors, id }) => {
					const tex = textures[texture];
					if (!tex) {
						this.$root.showSnackBar(
							`Texture [#${texture}] doesn't exist anymore! (${id})`,
							"error",
						);
						return null;
					}
					const tags = tex.tags
						.filter((tag) => !["java", "bedrock"].includes(tag.toLowerCase()))
						.sort();

					return {
						id: texture,
						name: tex.name,
						tags,
						date,
						authors: authors.map((author) => this.idToUsername[author] || "Anonymous"),
					};
				})
				// remove duplicates
				.reduce((acc, cur) => {
					if (cur === null) return acc;
					// newer date wins
					if (acc[cur.id] === undefined || acc[cur.id]?.date < cur.date) acc[cur.id] = cur;
					return acc;
				}, {});

			// group by texture tag (easier than going off paths)
			const formatted = Object.values(finalData).reduce((acc, { tags, name, authors }) => {
				acc[tags[0]] ||= [];
				acc[tags[0]].push(`${name.toTitleCase()} (${(authors || []).listify()})`);
				return acc;
			}, {});

			this.outputData = JSON.stringify(formatted, null, 2);
			this.loading = false;
			this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
		},
	},
	computed: {
		formInvalid() {
			return !this.date || !this.selectedPack;
		},
		fileBlob() {
			return new Blob([this.outputData], { type: "text/json" });
		},
		fileName() {
			return `changelog-${this.selectedPack}.json`;
		},
	},
	watch: {
		value(newValue) {
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			this.$emit("input", newValue);
		},
		// done in a watcher since you have to revoke the old url before creating a new one
		fileBlob: {
			handler(newValue) {
				if (this.fileURL) URL.revokeObjectURL(this.fileURL);
				this.$nextTick(() => {
					this.fileURL = URL.createObjectURL(newValue);
				});
			},
			deep: true,
		},
	},
	created() {
		axios.get(`${this.$root.apiURL}/packs/search?type=submission`).then((res) => {
			this.packs = res.data;
		});

		// only need contributors since only contributors can appear in changelogs
		axios.get(`${this.$root.apiURL}/contributions/authors`).then((res) => {
			this.idToUsername = res.data.reduce((acc, cur) => {
				acc[cur.id] = cur.username;
				return acc;
			}, {});
		});
	},
	beforeUnmount() {
		// clean up download button
		if (this.fileURL) URL.revokeObjectURL(this.fileURL);
	},
};
</script>
