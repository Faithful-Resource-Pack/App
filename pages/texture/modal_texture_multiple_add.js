/* global axios, Vue, Prism */

const emptyPath = function () {
	return ["", [], false];
};

const emptyUse = function () {
	return {
		name: "",
		editions: [],
		paths: [emptyPath()],
	};
};

const emptyTexture = function () {
	return {
		name: "",
		type: [],
		uses: [emptyUse()],
	};
};

export default {
	name: "add-multiple-texture-modal",
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		types: {
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
	template: `
  <v-dialog
      v-model="modalOpened"
      content-class="colored"
      max-width="860"
    >
      <v-card>
        <v-card-title class="headline">{{ $root.lang().database.titles.add_textures }}</v-card-title>
        <v-card-text class="pb-0">
          <v-row>
            <v-col class="col-12" sm="12">
              <v-form ref="form">
                <v-expansion-panels flat v-model="panel">
                  <v-expansion-panel>
                    <v-expansion-panel-header class="px-0 py-0"><h2 class="title">{{ $root.lang().database.subtitles.import_json_data }}</h2></v-expansion-panel-header>
                    <v-expansion-panel-content class="mx-n6">
                      <prism-editor class="ma-0 my-editor fixed-height mb-2" v-model="formData.importjson" :highlight="highlighter" line-numbers></prism-editor>
                      <v-btn block @click="parseJSON" :color="color" :class="[textColor]">{{ $root.lang().database.labels.parse_json }}</v-btn>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
                <h2 class="title my-2">{{ $root.lang().database.subtitles.add_manually }}</h2>
                <v-container fluid class="pa-0" v-for="(texture, t_i) in textures" :key="'tex-' + t_i">
                  <v-row dense>
                    <v-col><v-text-field :color="color" class="mb-1" v-model="texture.name" :placeholder="$root.lang().database.labels.texture_name" hide-details dense clearable /></v-col>
                    <v-col><v-select :color="color" :item-color="color" class="mb-1" v-model="texture.type" :items="types" :placeholder="$root.lang().database.labels.texture_type" multiple hide-details dense clearable small-chips /></v-col>
                    <v-col class="flex-grow-0 flex-shrink-0"><v-icon color="error" @click="() => deleteTexture(t_i)">mdi-close</v-icon></v-col>
                  </v-row>
                  <v-row dense class="mb-2">
                    <v-col class="flex-grow-0 flex-shrink-0">
                      <h3 class="ma-0 mt-1">{{ $root.lang().database.subtitles.uses }}</h3>
                      <v-btn x-small @click="() => addNewUse(t_i)">{{ $root.lang().global.btn.add }}</v-btn>
                    </v-col>
                    <v-col>
                      <v-container fluid class="pa-0" v-for="(use, u_i) in texture.uses" :key="'tex-' + t_i + '-use-' + u_i">
                        <v-row dense>
                          <v-col><v-text-field :color="color" class="mb-1" v-model="use.name" :placeholder="$root.lang().database.labels.use_name" hide-details dense clearable /></v-col>
                          <v-col><v-select :color="color" :item-color="color" class="mb-1" :items="editions" @change="(e) => onEditionChange(e, use)" v-model="use.editions[0]" :placeholder="$root.lang().database.labels.use_edition" hide-details dense clearable /></v-col>
                          <v-col class="flex-grow-0 flex-shrink-0"><v-icon color="error" @click="() => deleteUse(t_i, u_i)">mdi-close</v-icon></v-col>
                        </v-row>
                        <v-row dense class="mb-2">
                          <v-col class="flex-grow-0 flex-shrink-0">
                            <h3 class="ma-0">{{ $root.lang().database.subtitles.paths }}</h3>
                            <v-btn x-small class="mt-2" @click="() => addNewPath(t_i, u_i)">{{ $root.lang().global.btn.add }}</v-btn>
                          </v-col>
                          <v-col>
                            <v-container class="pa-0" fluid v-for="(path, p_i) in use.paths" :key="'tex-' + t_i + '-use-' + u_i + '-p_i-' + p_i">
                              <v-row dense>
                                <v-col><v-text-field :color="color" class="mb-0" v-model="path[0]" :placeholder="$root.lang().database.labels.path" hide-details dense clearable /></v-col>
                                <v-col><v-select :color="color" :item-color="color" class="mb-0" :items="versions_sorted" v-model="path[1]" :placeholder="$root.lang().database.labels.versions" multiple hide-details dense clearable small-chips /></v-col>
                                <v-col class="flex-grow-0 flex-shrink-0"><v-checkbox :color="color" v-model="path[2]" hide-details label="MCMETA"></v-checkbox></v-col>
                                <v-col class="flex-grow-0 flex-shrink-0"><v-icon color="error" @click="() => deletePath(t_i, u_i, p_i)">mdi-close</v-icon></v-col>
                              </v-row>
                            </v-container>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-col>
                  </v-row>
                </v-container>
                <v-btn x-small @click="addNewTexture">{{ $root.lang().database.labels.add_new_texture }}</v-btn>
              </v-form>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <div class="pb-1 pr-4"><v-checkbox
            :color="color"
            v-model="closeOnSubmit"
            hide-details
            :label="$root.lang('database.labels.close_on_submit')"
          ></v-checkbox></div>
          <v-btn
            color="red darken-1"
            text
            @click="onCancel"
          >
            {{ $root.lang().global.btn.cancel }}
          </v-btn>
          <v-btn
            color="darken-1"
            text
            @click="send"
          >
            {{ $root.lang().global.btn.save }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  `,
	data() {
		return {
			modalOpened: false,
			panel: undefined,
			closeOnSubmit: false,
			formData: {
				importjson: "[]",
			},
			textures: [emptyTexture()],
		};
	},
	computed: {
		versions_sorted() {
			return this.versions.sort((a, b) => -1 * this.MinecraftSorter(a, b));
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
		MinecraftSorter(a, b) {
			const aSplit = a.split(".").map((s) => parseInt(s));
			const bSplit = b.split(".").map((s) => parseInt(s));

			if (aSplit.includes(NaN) || bSplit.includes(NaN)) {
				return String(a).localeCompare(String(b)); // compare as strings
			}

			const upper = Math.min(aSplit.length, bSplit.length);
			let i = 0;
			let result = 0;
			while (i < upper && result == 0) {
				result = aSplit[i] == bSplit[i] ? 0 : aSplit[i] < bSplit[i] ? -1 : 1; // each number
				++i;
			}

			if (result != 0) return result;

			result = aSplit.length == bSplit.length ? 0 : aSplit.length < bSplit.length ? -1 : 1; // longer length wins

			return result;
		},
		onCancel() {
			this.modalOpened = false;
		},
		onEditionChange(value, use) {
			if (value !== "bedrock") return;

			if (!use.paths) use.paths = [emptyPath()];
			use.paths.forEach((path) => {
				// if version is empty
				if (path[1].length == 0) {
					path[1].push("bedrock-latest");
				}
			});
		},
		versionsLeft(textureIndex, useIndex) {
			const otherUseIndex = 1 - useIndex;
			let result = this.editions;

			const otherEditions = this.textures[textureIndex].uses[otherUseIndex].editions;
			if (otherEditions.length > 0 && this.editions.include(otherEditions[0])) {
				result = this.editions.splice(this.editions.indexOf(otherEditions[0]), 1);
			}
			return result;
		},
		parseJSON() {
			try {
				const data = JSON.parse(this.formData.importjson);
				this.textures = data;
			} catch (err) {
				console.error(err);
				this.$root.showSnackBar(err, "error");
			}
		},
		send() {
			const data = JSON.parse(JSON.stringify(this.textures));
			const api_data = data.map((e) => ({
				name: e.name,
				tags: e.type,
				uses: e.uses.map((u) => ({
					name: u.name,
					edition: u.editions[0],
					paths: u.paths.map((p) => ({
						name: String(p[0]),
						versions: p[1],
						mcmeta: p[2] || false,
					})),
				})),
			}));
			axios
				.post(`${this.$root.apiURL}/textures/multiple`, api_data, this.$root.apiOptions)
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
				Vue.nextTick(() => {
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
