<template>
	<v-dialog v-model="modalOpened" content-class="colored" max-width="860">
		<v-card>
			<v-card-title class="headline">{{ $root.lang().database.titles.add_textures }}</v-card-title>
			<v-card-text class="pb-0">
				<v-row>
					<v-col class="col-12" sm="12">
						<v-form ref="form">
							<v-expansion-panels flat v-model="panel">
								<v-expansion-panel>
									<v-expansion-panel-header class="px-0 py-0">
										<h2 class="title text--secondary">
											{{ $root.lang().database.subtitles.import_json_data }}
										</h2>
									</v-expansion-panel-header>
									<v-expansion-panel-content class="mx-n6">
										<prism-editor
											class="ma-0 my-editor fixed-height mb-2"
											v-model="formData.importJSON"
											:highlight="highlighter"
											line-numbers
										/>
										<v-btn block @click="parseJSON" :color="color" :class="[textColor]">
											{{ $root.lang().database.labels.parse_json }}
										</v-btn>
									</v-expansion-panel-content>
								</v-expansion-panel>
							</v-expansion-panels>
							<h2 class="title my-2">{{ $root.lang().database.subtitles.add_manually }}</h2>
							<v-container
								fluid
								class="pa-0"
								v-for="(texture, t_i) in textures"
								:key="`tex-${t_i}`"
							>
								<v-row dense>
									<v-col>
										<v-text-field
											:color="color"
											class="mb-1"
											v-model="texture.name"
											:placeholder="$root.lang().database.labels.texture_name"
											hide-details
											dense
											clearable
										/>
									</v-col>
									<v-col>
										<v-combobox
											:color="color"
											:item-color="color"
											class="mb-1"
											v-model="texture.tags"
											:items="tags"
											:placeholder="$root.lang().database.labels.texture_tags"
											@change="
												() => {
													texture.tags = sortTags(texture.tags);
												}
											"
											multiple
											hide-details
											dense
											clearable
											small-chips
										/>
									</v-col>
									<v-col class="flex-grow-0 flex-shrink-0">
										<v-icon color="error" @click="() => deleteTexture(t_i)">mdi-close</v-icon>
									</v-col>
								</v-row>
								<v-row dense class="mb-2">
									<v-col class="flex-grow-0 flex-shrink-0">
										<h3 class="ma-0 mt-1">{{ $root.lang().database.subtitles.uses }}</h3>
										<v-btn x-small @click="() => addNewUse(t_i)">
											{{ $root.lang().global.btn.add }}
										</v-btn>
									</v-col>
									<v-col>
										<v-container
											fluid
											class="pa-0"
											v-for="(use, u_i) in texture.uses"
											:key="`tex-${t_i}-use-${u_i}`"
										>
											<v-row dense>
												<v-col>
													<v-text-field
														:color="color"
														class="mb-1"
														v-model="use.name"
														:placeholder="$root.lang().database.labels.use_name"
														hide-details
														dense
														clearable
													/>
												</v-col>
												<v-col>
													<v-select
														:color="color"
														:item-color="color"
														class="mb-1"
														:items="editions"
														@change="(e) => onEditionChange(e, use, texture)"
														v-model="use.edition"
														:placeholder="$root.lang().database.labels.use_edition"
														hide-details
														dense
														clearable
													/>
												</v-col>
												<v-col class="flex-grow-0 flex-shrink-0">
													<v-icon color="error" @click="() => deleteUse(t_i, u_i)">
														mdi-close
													</v-icon>
												</v-col>
											</v-row>
											<v-row dense class="mb-2">
												<v-col class="flex-grow-0 flex-shrink-0">
													<h3 class="ma-0">{{ $root.lang().database.subtitles.paths }}</h3>
													<v-btn x-small class="mt-2" @click="() => addNewPath(t_i, u_i)">
														{{ $root.lang().global.btn.add }}
													</v-btn>
												</v-col>
												<v-col>
													<v-container
														class="pa-0"
														fluid
														v-for="(path, p_i) in use.paths"
														:key="`tex-${t_i}-use-${u_i}-p_i-${p_i}`"
													>
														<v-row dense>
															<v-col>
																<v-text-field
																	:color="color"
																	class="mb-0"
																	v-model="path.name"
																	:placeholder="$root.lang().database.labels.path"
																	dense
																	clearable
																	@change="(e) => pathAdded(e, path, use, texture)"
																	persistent-hint
																	:hint="$root.lang().database.hints.path_prefill"
																/>
															</v-col>
															<v-col>
																<v-select
																	:color="color"
																	:item-color="color"
																	class="mb-0"
																	:items="sortedVersions"
																	v-model="path.versions"
																	:placeholder="$root.lang().database.labels.versions"
																	multiple
																	hide-details
																	dense
																	clearable
																	small-chips
																/>
															</v-col>
															<v-col class="flex-grow-0 flex-shrink-0">
																<v-checkbox
																	:color="color"
																	v-model="path.mcmeta"
																	hide-details
																	:label="$root.lang().database.labels.mcmeta"
																/>
															</v-col>
															<v-col class="flex-grow-0 flex-shrink-0">
																<v-icon color="error" @click="() => deletePath(t_i, u_i, p_i)">
																	mdi-close
																</v-icon>
															</v-col>
														</v-row>
													</v-container>
												</v-col>
											</v-row>
										</v-container>
									</v-col>
								</v-row>
							</v-container>
							<v-btn x-small @click="addNewTexture">
								{{ $root.lang().database.labels.add_new_texture }}
							</v-btn>
						</v-form>
					</v-col>
				</v-row>
			</v-card-text>
			<v-card-actions>
				<v-spacer />
				<div class="pb-1 pr-4">
					<v-checkbox
						:color="color"
						v-model="closeOnSubmit"
						hide-details
						:label="$root.lang('database.labels.close_on_submit')"
					/>
				</div>
				<v-btn color="red darken-1" text @click="onCancel">
					{{ $root.lang().global.btn.cancel }}
				</v-btn>
				<v-btn color="darken-1" text @click="send">
					{{ $root.lang().global.btn.save }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
import axios from "axios";
import Prism from "prismjs";
import { formatTag, sortTags } from "@helpers/textures";
import { getNameFromPath, getEditionFromPath, getTagFromPath } from "@helpers/paths";
import MinecraftSorter from "@helpers/MinecraftSorter";

const emptyPath = () => ({
	name: "",
	versions: [],
	mcmeta: false,
});

const emptyUse = () => ({
	name: "",
	edition: "",
	paths: [emptyPath()],
});

const emptyTexture = () => ({
	name: "",
	tags: [],
	uses: [emptyUse()],
});

export default {
	name: "new-texture-modal",
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		tags: {
			type: Array,
			required: false,
			default() {
				return [];
			},
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
	},
	data() {
		return {
			modalOpened: false,
			panel: undefined,
			closeOnSubmit: false,
			formData: {
				importJSON: "[]",
			},
			textures: [emptyTexture()],
		};
	},
	computed: {
		sortedVersions() {
			return this.versions.sort((a, b) => -1 * MinecraftSorter(a, b));
		},
	},
	methods: {
		highlighter(code) {
			// js highlight example
			return Prism.highlight(code, Prism.languages.js, "json");
		},
		addNewTexture() {
			this.textures.push(emptyTexture());
		},
		addNewUse(textureIndex) {
			this.textures[textureIndex].uses.push(emptyUse());
		},
		addNewPath(textureIndex, useIndex) {
			this.textures[textureIndex].uses[useIndex].paths.push(emptyPath());
		},
		deleteTexture(textureIndex) {
			this.textures.splice(textureIndex, 1);
		},
		deleteUse(textureIndex, useIndex) {
			this.textures[textureIndex].uses.splice(useIndex, 1);
		},
		deletePath(textureIndex, useIndex, pathIndex) {
			this.textures[textureIndex].uses[useIndex].paths.splice(pathIndex, 1);
		},
		onCancel() {
			this.modalOpened = false;
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
				const data = JSON.parse(this.formData.importJSON);
				this.textures = data;
			} catch (err) {
				console.error(err);
				this.$root.showSnackBar(err, "error");
			}
		},
		send() {
			const data = JSON.parse(JSON.stringify(this.textures));
			const apiData = data.map((e) => ({
				name: e.name,
				tags: sortTags(e.tags),
				uses: e.uses.map((u) => ({
					name: u.name,
					edition: u.edition,
					paths: u.paths.map((p) => ({
						name: p.name,
						versions: p.versions,
						mcmeta: p.mcmeta || false,
					})),
				})),
			}));
			axios
				.post(`${this.$root.apiURL}/textures/multiple`, apiData, this.$root.apiOptions)
				.then(() => {
					this.$root.showSnackBar(
						this.$root.lang().database.labels.add_textures_success,
						"success",
					);
					if (this.closeOnSubmit) this.modalOpened = false;
				})
				.catch((err) => {
					console.error(err);
					this.$root.showSnackBar(err, "error");
				});
		},
	},
	watch: {
		closeOnSubmit: {
			handler(newValue, oldValue) {
				if (oldValue === undefined && newValue === false) {
					this.closeOnSubmit = localStorage.getItem("MTMA_MODAL") || newValue;
				} else if (newValue !== oldValue) {
					localStorage.setItem("MTMA_MODAL", newValue);
				}
			},
			immediate: true,
		},
		value(newValue, oldValue) {
			if (oldValue !== newValue && newValue === true) {
				this.$nextTick(() => {
					this.textures = [emptyTexture()];
					this.$refs.form.reset();
				});
			}
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			this.$emit("input", newValue);
		},
	},
};
</script>
