<template>
	<modal-form
		v-model="modalOpen"
		max-width="800"
		:title="$root.lang().posts.changelog_generator.heading"
		hide-actions
	>
		<v-alert type="warning" outlined dense>
			<h3 v-if="categorize">{{ $root.lang().posts.changelog_generator.categorize_warning }}</h3>
			{{ $root.lang().posts.changelog_generator.warning }}
		</v-alert>
		<v-form>
			<v-row>
				<v-col cols="12" sm="6">
					<v-text-field
						v-model="date"
						type="date"
						:label="$root.lang().posts.changelog_generator.date"
						:autofocus="!$vuetify.breakpoint.mobile"
						persistent-placeholder
					/>
				</v-col>
				<v-col cols="12" sm="6">
					<v-select
						v-model="selectedPack"
						:label="$root.lang().posts.changelog_generator.pack"
						:items="packs"
						item-text="name"
						item-value="id"
					/>
				</v-col>
			</v-row>
			<v-switch v-model="categorize" :label="$root.lang().posts.changelog_generator.categorize" />
		</v-form>
		<v-btn block color="secondary" :disabled="formInvalid" :loading="loading" @click="generate">
			<v-icon left>mdi-pencil</v-icon>
			{{ $root.lang().posts.changelog_generator.heading }}
		</v-btn>
		<template v-if="outputData">
			<v-divider class="my-5" />
			<v-row>
				<v-col>
					<v-btn block color="secondary" @click="copyData">
						<v-icon left>mdi-content-copy</v-icon>
						{{ $root.lang().posts.changelog_generator.copy }}
					</v-btn>
				</v-col>
				<v-col>
					<v-btn block color="secondary" :href="fileURL" :download="fileName">
						<v-icon left>mdi-download</v-icon>
						{{ $root.lang().posts.changelog_generator.download }}
					</v-btn>
				</v-col>
			</v-row>
			<v-card class="main-container mt-5 pa-1">
				<prism-editor
					v-model="outputData"
					class="json-editor json-modal-editor"
					readonly
					:highlight="highlighter"
				/>
			</v-card>
		</template>
	</modal-form>
</template>

<script>
import axios from "axios";
import Prism from "prismjs";

import { PrismEditor } from "vue-prism-editor";
import ModalForm from "@layouts/modal-form.vue";

export default {
	name: "changelog-generator",
	components: {
		PrismEditor,
		ModalForm,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
	},
	emits: ["input"],
	data() {
		return {
			modalOpen: false,
			date: "",
			selectedPack: "",
			packs: [],
			loading: false,
			categorize: false,
			outputData: "",
			fileURL: "",
			idToUsername: {},
		};
	},
	methods: {
		highlighter(code) {
			return Prism.highlight(code, Prism.languages.js, "json");
		},
		closeModal() {
			this.modalOpen = false;
		},
		copyData() {
			navigator.clipboard.writeText(this.outputData);
			this.$root.showSnackbar(this.$root.lang().database.textures.modal.copy_json_data, "success");
		},
		getData() {
			return Promise.all([
				axios
					.get(`${this.$root.apiURL}/contributions/search?packs=${this.selectedPack}`)
					.then((res) => Object.values(res.data)),
				// keep keys for fast retrieval (optimization)
				axios.get(`${this.$root.apiURL}/textures/raw`).then((res) => res.data),
			]).catch((err) => {
				this.loading = false;
				this.$root.showSnackbar(err, "error");
				return [null, null];
			});
		},
		mergeContribution(texture, contribution) {
			if (!texture) {
				this.$root.showSnackbar(
					`Texture [#${texture.id}] doesn't exist anymore! (${contribution.id})`,
					"error",
				);
				return null;
			}
			return {
				id: texture.id,
				name: texture.name,
				tags: texture.tags.filter((tag) => !["java", "bedrock"].includes(tag.toLowerCase())).sort(),
				date: contribution.date,
				authors: contribution.authors.map((author) => this.idToUsername[author] || "Anonymous"),
			};
		},
		formatContributions(contributions) {
			// group by texture tag (easier than going off paths)
			return contributions.reduce((acc, { tags, name, authors }) => {
				acc[tags[0]] ||= [];
				acc[tags[0]].push(`${name.toTitleCase()} (${(authors || []).listify()})`);
				return acc;
			}, {});
		},
		categorizeAndFormat(allContributions, changelogContributions) {
			if (this.categorize) {
				const categorized = changelogContributions.reduce(
					(acc, cur) => {
						const hasExisting =
							allContributions.filter((c) => String(c.texture) === cur.id).length > 1;
						acc[hasExisting ? "Changed" : "Added"].push(cur);
						return acc;
					},
					{ Added: [], Changed: [] },
				);
				// this should probably be done programmatically but whatever
				return {
					Added: this.formatContributions(categorized.Added),
					Changed: this.formatContributions(categorized.Changed),
				};
			}

			return this.formatContributions(changelogContributions);
		},
		async generate() {
			this.loading = true;
			const [allContributions, textures] = await this.getData();

			if (allContributions === null) return;

			const finalData = allContributions
				// get correct date
				.filter((contribution) => contribution.date > this.numericDate)
				// merge the two objects by id
				.map((contribution) => this.mergeContribution(textures[contribution.texture], contribution))
				// remove duplicates
				.reduce((acc, cur) => {
					if (cur === null) return acc;
					// newer date wins
					if (acc[cur.id] === undefined || acc[cur.id]?.date < cur.date) acc[cur.id] = cur;
					return acc;
				}, {});

			const formatted = this.categorizeAndFormat(allContributions, Object.values(finalData));
			this.outputData = JSON.stringify(formatted, null, 2);
			this.loading = false;
			this.$root.showSnackbar(this.$root.lang().global.success_message, "success");
		},
	},
	computed: {
		formInvalid() {
			return !this.date || !this.selectedPack;
		},
		numericDate() {
			return new Date(this.date).getTime();
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
			this.modalOpen = newValue;
		},
		modalOpen(newValue) {
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
	destroyed() {
		// clean up download button
		if (this.fileURL) URL.revokeObjectURL(this.fileURL);
	},
};
</script>
