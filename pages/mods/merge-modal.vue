<template>
	<modal-form
		v-model="modalOpen"
		:title="strings.title"
		:subtitle="subtitle"
		max-width="1000"
		persistent
		button-type="confirm"
		:disabled="!selectedCount || merging"
		@close="$emit('close')"
		@submit="send"
	>
		<v-progress-linear v-if="loading" indeterminate :color="color" />
		<p v-else-if="!candidates.length" class="text-center my-4">{{ strings.no_candidates }}</p>
		<template v-else>
			<p class="text-caption">{{ strings.hint }}</p>
			<div class="d-flex align-center flex-wrap mb-2" style="gap: 8px">
				<v-text-field
					v-model="search"
					:color="color"
					:label="strings.search"
					prepend-inner-icon="mdi-magnify"
					clearable
					dense
					hide-details
					single-line
					style="max-width: 320px"
				/>
				<v-spacer />
				<v-btn small outlined @click="selectAll(true)">{{ strings.select_all }}</v-btn>
				<v-btn small outlined @click="selectAll(false)">{{ strings.select_none }}</v-btn>
				<v-btn
					small
					outlined
					:disabled="saving"
					:title="strings.keep_separate_hint"
					@click="keepSeparate(filtered)"
				>
					{{ strings.keep_separate_all }}
				</v-btn>
			</div>

			<!-- only the comparison scrolls, the description, filters and buttons stay visible -->
			<div class="scroll-area">
				<v-card
					v-for="candidate in pageItems"
					:key="candidate.texture.texture.id"
					outlined
					class="mb-2"
				>
					<v-card-text>
						<div class="d-flex align-center mb-2" style="gap: 8px">
							<div class="text-caption text--secondary candidate-path flex-grow-1">
								{{ candidate.path }}
							</div>
							<v-btn
								x-small
								text
								:disabled="saving"
								:title="strings.keep_separate_hint"
								@click="keepSeparate([candidate])"
							>
								{{ strings.keep_separate }}
							</v-btn>
						</div>
						<!-- the new texture first, then the ones it can be merged into -->
						<div class="candidate-row">
							<figure class="candidate-texture">
								<img :src="candidate.texture.url" :alt="candidate.path" />
								<figcaption>
									<div class="text-caption font-weight-medium">
										{{ strings.new_texture }} #{{ candidate.texture.texture.id }}
									</div>
									<div class="text-caption text--secondary">
										{{ candidate.texture.versions.join(", ") }}
									</div>
								</figcaption>
							</figure>
							<figure
								v-for="match in candidate.matches"
								:key="match.texture.id"
								class="candidate-texture"
							>
								<img :src="match.url" :alt="candidate.path" />
								<figcaption>
									<div class="text-caption font-weight-medium">#{{ match.texture.id }}</div>
									<div class="text-caption text--secondary">
										{{ match.versions.join(", ") }}
									</div>
								</figcaption>
								<v-checkbox
									:input-value="isSelected(candidate, match)"
									:color="color"
									class="merge-checkbox mt-1 pt-0"
									dense
									hide-details
									@change="select(candidate, match, $event)"
								/>
							</figure>
						</div>
					</v-card-text>
				</v-card>
			</div>
			<v-pagination
				v-if="pageCount > 1"
				v-model="page"
				:length="pageCount"
				:total-visible="7"
				:color="color"
				class="mt-2"
			/>
		</template>
		<p v-if="selectedCount" class="text-caption mt-2 mb-0">
			{{ strings.selected.replace("%COUNT%", selectedCount) }}
		</p>
	</modal-form>
</template>

<script>
import axios from "axios";
import ModalForm from "@layouts/modal-form.vue";

const PAGE_SIZE = 12;

export default {
	name: "merge-textures-modal",
	components: {
		ModalForm,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		// mod version to review the textures of
		version: {
			type: Object,
			required: false,
			default: null,
		},
		modName: {
			type: String,
			required: false,
			default: "",
		},
		color: {
			type: String,
			required: false,
			default: "primary",
		},
	},
	emits: ["input", "close"],
	data() {
		return {
			modalOpen: false,
			loading: false,
			merging: false,
			saving: false,
			page: 1,
			candidates: [],
			search: "",
			// "<new texture id>:<matching texture id>" of the matches to merge
			selected: {},
		};
	},
	computed: {
		strings() {
			return this.$root.lang().mods.merge;
		},
		subtitle() {
			return this.version ? `${this.modName} ${this.version.version}`.trim() : "";
		},
		// the candidates the search shows
		filtered() {
			const query = (this.search || "").trim().toLowerCase().replace(/ /g, "_").replace("#", "");
			if (!query) return this.candidates;
			return this.candidates.filter(
				(c) =>
					c.path.toLowerCase().includes(query) ||
					[c.texture, ...c.matches].some((t) => t.texture.id === query),
			);
		},
		pageCount() {
			return Math.ceil(this.filtered.length / PAGE_SIZE);
		},
		pageItems() {
			return this.filtered.slice((this.page - 1) * PAGE_SIZE, this.page * PAGE_SIZE);
		},
		selectedCount() {
			return Object.values(this.selected).filter(Boolean).length;
		},
	},
	methods: {
		key: (candidate, match) => `${candidate.texture.texture.id}:${match.texture.id}`,
		isSelected(candidate, match) {
			return !!this.selected[this.key(candidate, match)];
		},
		select(candidate, match, value) {
			this.$set(this.selected, this.key(candidate, match), !!value);
		},
		selectAll(value) {
			const selected = {};
			if (value)
				for (const candidate of this.filtered)
					for (const match of candidate.matches) selected[this.key(candidate, match)] = true;
			this.selected = selected;
		},
		async load(keepState = false) {
			this.candidates = [];
			if (!keepState) {
				this.selected = {};
				this.search = "";
				this.page = 1;
			}
			if (!this.version) return;

			this.loading = true;
			try {
				const res = await axios.get(
					`${this.$root.apiURL}/mod-versions/${this.version.id}/merge-candidates`,
					this.$root.apiOptions,
				);
				this.candidates = res.data;
			} catch (err) {
				console.error(err);
				this.$root.showSnackbar(err, "error");
			} finally {
				this.loading = false;
			}
		},
		// the matches that aren't selected are remembered as different textures
		async keepSeparate(candidates) {
			const pairs = candidates.flatMap((candidate) =>
				candidate.matches
					.filter((match) => !this.isSelected(candidate, match))
					.map((match) => ({ id: candidate.texture.texture.id, other: match.texture.id })),
			);
			if (!pairs.length) return;

			this.saving = true;
			try {
				await axios.post(
					`${this.$root.apiURL}/mod-textures/distinct`,
					{ pairs },
					this.$root.apiOptions,
				);
				this.$root.showSnackbar(this.strings.separate_success, "success");
				await this.load(true);
			} catch (err) {
				console.error(err);
				this.$root.showSnackbar(err, "error");
			} finally {
				this.saving = false;
			}
		},
		async send() {
			// the matches are older textures: they are kept, the new texture is merged into them
			const merges = this.candidates
				.map((candidate) => ({
					candidate,
					ids: candidate.matches
						.filter((match) => this.isSelected(candidate, match))
						.map((match) => match.texture.id),
				}))
				.filter(({ ids }) => ids.length);

			this.merging = true;
			let failed = 0;
			// one by one, they all write to the same repositories
			for (const { candidate, ids } of merges) {
				try {
					await axios.post(
						`${this.$root.apiURL}/mod-textures/merge`,
						{ ids: [...ids, candidate.texture.texture.id] },
						this.$root.apiOptions,
					);
				} catch (err) {
					failed++;
					console.error(err);
					this.$root.showSnackbar(err, "error");
				}
			}
			this.merging = false;

			if (failed < merges.length)
				this.$root.showSnackbar(
					this.strings.success.replace("%COUNT%", merges.length - failed),
					"success",
				);
			await this.load();
			this.$emit("changed");
		},
	},
	watch: {
		value: {
			handler(newValue) {
				this.modalOpen = newValue;
				if (newValue) this.load();
			},
			immediate: true,
		},
		modalOpen(newValue) {
			this.$emit("input", newValue);
		},
		// back to the first page when the search changes, and when pages disappear
		search() {
			this.page = 1;
		},
		pageCount(count) {
			if (this.page > count) this.page = Math.max(count, 1);
		},
	},
};
</script>

<style scoped>
.scroll-area {
	max-height: 45vh;
	overflow-y: auto;
}

.candidate-row {
	display: flex;
	flex-flow: row wrap;
	align-items: flex-start;
	gap: 16px;
}

.candidate-texture {
	flex: 0 0 auto;
	width: 128px;
	margin: 0;
	text-align: center;
}

.candidate-texture img {
	display: block;
	width: 128px;
	height: 128px;
	margin-bottom: 4px;
	object-fit: contain;
	image-rendering: pixelated;
	background: rgba(128, 128, 128, 0.2);
}

.candidate-path {
	word-break: break-all;
}
</style>

<style>
/* no label: the checkbox is centered under its image */
.merge-checkbox .v-input__slot {
	justify-content: center;
}

.merge-checkbox .v-input--selection-controls__input {
	margin-right: 0;
}
</style>
