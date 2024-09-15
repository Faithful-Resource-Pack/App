<template>
	<fullscreen-modal
		v-model="modalOpened"
		:title="$root.lang().database.labels.add_texture"
		:pageColor="color"
		@close="closeModal"
	>
		<template #toolbar>
			<v-btn icon @click="copyData"><v-icon>mdi-content-copy</v-icon></v-btn>
			<v-menu v-model="jsonModalOpened" :close-on-content-click="false">
				<template #activator="{ on, attrs }">
					<v-btn icon v-on="on" v-bind="attrs"><v-icon>mdi-content-paste</v-icon></v-btn>
				</template>
				<div class="texture-json-editor">
					<h2 class="title text--secondary ma-2">
						{{ $root.lang().database.subtitles.import_json_data }}
					</h2>
					<prism-editor
						class="my-editor"
						v-model="importJSON"
						:highlight="highlighter"
						line-numbers
					/>
					<v-btn block @click="parseJSON" :color="color" class="white--text">
						{{ $root.lang().database.labels.parse_json }}
					</v-btn>
				</div>
			</v-menu>
		</template>
		<div class="px-10 py-5">
			<v-row>
				<v-col cols="12" :md="$vuetify.breakpoint.lgAndUp ? 9 : 8">
					<v-tabs :color="color" v-model="selectedTab" :show-arrows="false">
						<v-tab
							v-for="(texture, ti) in textures"
							:key="texture.key"
							style="text-transform: uppercase"
							append
						>
							<span v-if="texture.name">{{ texture.name }}</span>
							<i v-else>{{ $root.lang().database.labels.nameless }}</i>
							<v-btn :color="color" icon @click="deleteTexture(ti)">
								<v-icon>mdi-minus</v-icon>
							</v-btn>
						</v-tab>
						<v-btn text large color="grey darken-1" @click="addTexture()">
							{{ $root.lang().global.btn.add }}<v-icon right>mdi-plus</v-icon>
						</v-btn>
					</v-tabs>
					<v-tabs-items v-model="selectedTab" fixed-tabs>
						<v-tab-item eager v-for="(texture, ti) in textures" :key="texture.key">
							<h2 class="pt-5 pb-3">{{ $root.lang().gallery.modal.info.texture }}</h2>
							<v-row>
								<v-col cols="12" sm="6">
									<v-text-field
										required
										clearable
										:color="color"
										v-model="texture.name"
										:label="$root.lang().database.labels.texture_name"
									/>
								</v-col>
								<v-col cols="12" sm="6">
									<v-combobox
										:color="color"
										:item-color="color"
										required
										multiple
										deletable-chips
										small-chips
										@change="
											() => {
												texture.tags = sortTags(texture.tags);
											}
										"
										v-model="texture.tags"
										:items="tags"
										:label="$root.lang().database.labels.texture_tags"
									/>
								</v-col>
							</v-row>
							<h2 class="py-3">
								{{ $root.lang().gallery.modal.info.uses }} /
								{{ $root.lang().gallery.modal.info.paths }}
							</h2>
							<v-timeline dense align-top class="pl-0">
								<v-timeline-item
									v-for="(use, ui) in texture.uses"
									:key="use.key"
									fill-dot
									:color="color"
								>
									<template #icon>
										<span class="white--text">{{ useIDFromIndex(ui) }}</span>
									</template>
									<v-row>
										<v-col cols="12" sm="5">
											<v-text-field
												:color="color"
												v-model="use.name"
												:label="$root.lang().database.labels.use_name"
											/>
										</v-col>
										<v-col cols="12" sm="6">
											<v-select
												:color="color"
												:item-color="color"
												:items="editions"
												v-model="use.edition"
												@change="(e) => onEditionChange(e, use, texture)"
												:label="$root.lang().database.labels.use_edition"
											/>
										</v-col>
										<v-col cols="12" sm="1">
											<v-btn color="red lighten-1" icon @click="deleteUse(ti, ui)">
												<v-icon>mdi-trash-can</v-icon>
											</v-btn>
										</v-col>
									</v-row>
									<div v-for="(path, pi) in use.paths" :key="path.key">
										<v-row>
											<v-col cols="12" sm="5">
												<v-text-field
													:color="color"
													v-model="path.name"
													:label="$root.lang().database.labels.path"
													clearable
													@change="(e) => pathAdded(e, path, use, texture)"
													persistent-hint
													:hint="$root.lang().database.hints.path_prefill"
												/>
											</v-col>
											<v-col cols="12" sm="4">
												<v-select
													:color="color"
													:item-color="color"
													:items="sortedVersions"
													v-model="path.versions"
													:label="$root.lang().database.labels.versions"
													multiple
													hide-details
													clearable
													small-chips
												/>
											</v-col>
											<v-col cols="12" sm="2">
												<v-checkbox
													:color="color"
													v-model="path.mcmeta"
													:label="$root.lang().database.labels.mcmeta"
												/>
											</v-col>
											<v-col cols="12" sm="1">
												<v-btn color="red lighten-1" icon @click="deletePath(ti, ui, pi)">
													<v-icon>mdi-minus</v-icon>
												</v-btn>
											</v-col>
										</v-row>
									</div>
									<v-btn block class="my-5" color="secondary" @click="addPath(ti, ui)">
										{{ $root.lang().database.labels.add_new_path }} <v-icon right>mdi-plus</v-icon>
									</v-btn>
								</v-timeline-item>
							</v-timeline>
							<v-btn block class="my-5 white--text" :color="color" @click="addUse(ti)">
								{{ $root.lang().database.labels.add_new_use }} <v-icon right>mdi-plus</v-icon>
							</v-btn>
						</v-tab-item>
					</v-tabs-items>
				</v-col>
				<v-divider vertical class="ma-5" />
				<v-col>
					<v-list>
						<div class="font-weight-medium text--secondary my-2">
							{{ $root.lang().database.titles.textures }}
						</div>
						<v-list-item class="pl-0" v-for="(tex, i) in textures" :key="tex.key">
							<v-list-item-content>
								<v-list-item-title :class="summaryStyles">
									<template v-if="tex.name">{{ tex.name }}</template>
									<i v-else>{{ $root.lang().database.labels.nameless }}</i>
									• {{ summaryString(tex) }}
								</v-list-item-title>
								<v-list-item-subtitle>
									<span v-if="tex.tags.length">{{ tex.tags.join(", ") }}</span>
									<i v-else>{{ $root.lang().database.labels.tagless }}</i>
								</v-list-item-subtitle>
							</v-list-item-content>
							<v-list-item-action>
								<v-icon color="red lighten-1" @click="deleteTexture(i)">mdi-trash-can</v-icon>
							</v-list-item-action>
						</v-list-item>
					</v-list>
					<v-divider class="ma-5" />
					<v-row no-gutters>
						<v-col cols="12" sm="6">
							<v-checkbox
								:color="color"
								v-model="clearOnSave"
								hide-details
								:label="$root.lang('database.labels.clear_on_save')"
							/>
						</v-col>
						<v-col cols="12" sm="3">
							<v-btn class="px-1" color="red darken-1" text @click="resetModal">
								{{ $root.lang().global.btn.discard }}
							</v-btn>
						</v-col>
						<v-col cols="12" sm="3">
							<v-btn class="px-1" color="darken-1" text @click="send">
								{{ $root.lang().global.btn.save }}
							</v-btn>
						</v-col>
					</v-row>
				</v-col>
			</v-row>
		</div>
	</fullscreen-modal>
</template>

<script>
import axios from "axios";
import Prism from "prismjs";
import FullscreenModal from "@components/fullscreen-modal.vue";
import { formatTag, sortTags } from "@helpers/textures";
import { getNameFromPath, getEditionFromPath, getTagFromPath } from "@helpers/paths";
import MinecraftSorter from "@helpers/MinecraftSorter";

const emptyPath = () => ({
	// has problems with v-for otherwise
	key: crypto.randomUUID(),
	name: "",
	versions: [],
	mcmeta: false,
});

const emptyUse = () => ({
	key: crypto.randomUUID(),
	name: "",
	edition: "",
	paths: [emptyPath()],
});

const emptyTexture = () => ({
	key: crypto.randomUUID(),
	name: "",
	tags: [],
	uses: [emptyUse()],
});

const CLOSE_ON_SAVE_KEY = "new_textures_close";

export default {
	name: "new-texture-modal",
	components: {
		FullscreenModal,
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
		textColor: {
			type: String,
			required: false,
			default: "",
		},
		tags: {
			type: Array,
			required: false,
			default: () => [],
		},
		versions: {
			type: Array,
			required: false,
			default() {
				return [];
			},
		},
		editions: {
			type: Array,
			required: false,
			default() {
				return [];
			},
		},
	},
	data() {
		return {
			modalOpened: false,
			selectedTab: null,
			textures: [emptyTexture()],
			importJSON: "[]",
			jsonModalOpened: false,
			clearOnSave: localStorage.getItem(CLOSE_ON_SAVE_KEY) === "true",
		};
	},
	methods: {
		sortTags,
		highlighter(code) {
			// js highlight example
			return Prism.highlight(code, Prism.languages.js, "json");
		},
		summaryString(tex) {
			const labels = this.$root.lang().database.labels;
			// bit cleaner than using a ton of nested ternaries
			let strBuilder = `${tex.uses.length} `;
			strBuilder += tex.uses.length === 1 ? labels.use_singular : labels.use_plural;
			const pathCount = tex.uses.reduce((acc, cur) => acc + cur.paths.length, 0);
			strBuilder += `, ${pathCount} `;
			strBuilder += pathCount === 1 ? labels.path_singular : labels.path_plural;
			return strBuilder;
		},
		addTexture() {
			this.textures.push(emptyTexture());
			// change focused tab to new one
			this.$nextTick(() => {
				this.selectedTab = this.textures.length - 1;
			});
		},
		addUse(index) {
			this.textures[index].uses.push(emptyUse());
		},
		addPath(textureIndex, useIndex) {
			this.textures[textureIndex].uses[useIndex].paths.push(emptyPath());
		},
		deleteTexture(index) {
			this.textures.splice(index, 1);
			// make sure there's at least one texture
			if (!this.textures.length) this.addTexture();
		},
		deleteUse(textureIndex, useIndex) {
			this.textures[textureIndex].uses.splice(useIndex, 1);
			if (!this.textures[textureIndex].uses.length) this.addUse(textureIndex);
		},
		deletePath(textureIndex, useIndex, pathIndex) {
			this.textures[textureIndex].uses[useIndex].paths.splice(pathIndex, 1);
			if (!this.textures[textureIndex].uses[useIndex].paths.length)
				this.addPath(textureIndex, useIndex);
		},
		useIDFromIndex(i) {
			// 'a' == 97
			return String.fromCharCode(97 + i);
		},
		onEditionChange(edition, use, texture) {
			use.paths ||= [emptyPath()];
			use.paths.forEach((path) => {
				// add latest version if nothing added yet
				if (!path.versions.length) path.versions.push(settings.versions[edition][0]);
			});
			if (!texture.tags.includes(edition.toTitleCase()))
				texture.tags = sortTags([edition.toTitleCase(), ...texture.tags]);
		},
		pathAdded(el, path, use, texture) {
			// windows fix
			path.name = el.replace(/\\/g, "/").trim();
			// infer png extension if not present
			if (!path.name.includes(".")) path.name += ".png";

			// largely ripped from https://github.com/3vorp/faithful-utilities/blob/main/tools/createTextures.js
			if (!el || !path) return;

			const name = getNameFromPath(path.name);
			const edition = getEditionFromPath(path.name);
			if (!path.versions.length) path.versions.push(settings.versions[edition][0]);

			if (!use) return;
			if (!use.edition) {
				use.edition = edition;
				this.onEditionChange(edition, use, texture);
			}

			use.name ||= name;

			if (!texture) return;
			texture.name ||= name;

			texture.tags = sortTags([...texture.tags, getTagFromPath(path.name)].map(formatTag));
		},
		parseJSON() {
			try {
				let data = JSON.parse(this.importJSON);
				if (!data || !data.length) data = [emptyTexture()];
				// validate parsed data
				const cleaned = data.map((tex) => {
					tex.key = crypto.randomUUID();
					tex.name ||= "";
					tex.tags ||= [];
					if (!tex.uses || !tex.uses.length) tex.uses = [emptyUse()];
					tex.uses = tex.uses.map((use) => {
						use.key = crypto.randomUUID();
						use.edition ||= "";
						if (!use.paths || !use.paths.length) use.paths = [emptyPath()];
						use.paths = use.paths.map((path) => {
							path.name ||= "";
							path.versions ||= [];
							path.mcmeta ||= false;
							return path;
						});
						return use;
					});
					return tex;
				});
				this.textures = cleaned;
			} catch (err) {
				console.error(err);
				this.$root.showSnackBar(err, "error");
			}
		},
		copyData() {
			const data = JSON.stringify(this.cleanedData, null, 2);
			navigator.clipboard.writeText(data);
			this.$root.showSnackBar(this.$root.lang("database.labels.copy_json_data"), "success");
		},
		resetModal() {
			this.textures = [emptyTexture()];
		},
		closeModal() {
			this.$emit("close");
			this.modalOpened = false;
		},
		send() {
			axios
				.post(`${this.$root.apiURL}/textures/multiple`, this.cleanedData, this.$root.apiOptions)
				.then(() => {
					this.$root.showSnackBar(
						this.$root.lang().database.labels.add_textures_success,
						"success",
					);
					if (this.clearOnSave) this.resetModal();
				})
				.catch((err) => {
					console.error(err);
					this.$root.showSnackBar(err, "error");
				});
		},
	},
	computed: {
		sortedVersions() {
			return Array.from(this.versions).sort(MinecraftSorter).reverse();
		},
		summaryStyles() {
			return this.color.split(" ").map((c) => (c.includes("-") ? c : `${c}--text`));
		},
		cleanedData() {
			// used for both copying and sending
			return this.textures.map((tex) => ({
				name: tex.name,
				tags: sortTags(tex.tags),
				uses: tex.uses.map((use) => ({
					name: use.name,
					edition: use.edition,
					paths: use.paths.map((path) => ({
						name: path.name,
						versions: Array.from(path.versions).sort(MinecraftSorter),
						mcmeta: path.mcmeta || false,
					})),
				})),
			}));
		},
	},
	watch: {
		value(n) {
			this.modalOpened = n;
		},
		modalOpened(n) {
			this.$emit("input", n);
		},
		clearOnSave(n) {
			localStorage.setItem(CLOSE_ON_SAVE_KEY, n);
		},
	},
};
</script>
