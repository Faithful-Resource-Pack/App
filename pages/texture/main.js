/* global axios, Vue */

const TextureModal = () => import("./modal_texture.js");
const MCVersionModal = () => import("./modal_mc_version.js");
const TextureModalMultipleAdd = () => import("./modal_texture_multiple_add.js");
const ModalVersionAdd = () => import("./modal_version_add.js");
const RemoveConfirm = () => import("./remove-confirm.js");

export default {
  name: "texture-page",
  components: {
    "texture-modal": TextureModal,
    "version-modal": MCVersionModal,
    "add-multiple-texture": TextureModalMultipleAdd,
    "add-minecraft-version": ModalVersionAdd,
    "remove-confirm": RemoveConfirm,
  },
  template: `
  <v-container id="texturePage">
    <div class="styles" v-html="pageStyles"></div>
    <texture-modal
      :color="pageColor"
      :textColor="textColorOnPage"
      v-model="dialogOpen"
      :disableDialog="disableDialog"
      :add="Object.keys(dialogData).length == 0"
      :data="dialogData"
      :types="types">
    </texture-modal>
    <version-modal
      :color="pageColor"
      :MCDialog="MCDialogOpen"
      :disableMCDialog="disableMCDialog">
    </version-modal>
    <add-multiple-texture
      :textColor="textColorOnPage"
      :color="pageColor"
      v-model="addMultiple"
      :types="types"
      :editions="editions"
      :versions="versions">
    </add-multiple-texture>
    <add-minecraft-version
      :color="pageColor"
      :dialog="newVersionModal"
      :disableDialog="() => { newVersionModal = false }"
      :editions="editions"
      :versions="versions">
    </add-minecraft-version>
    <remove-confirm type="texture"
      :confirm="remove.confirm"
      :data="remove.data"
      :disableDialog="() => { remove.confirm = false; }"
      :on-submit="removeTexture">
    </remove-confirm>

    <div class="text-h4 py-4">
      {{ $root.lang().database.titles.textures }}
    </div>
    <div class="my-2 text-h5">{{ $root.lang().database.labels.select_texture_type }}</div>
    <div v-if="$vuetify.breakpoint.smAndUp" class="selector">
      <v-btn
        v-for="t in texturesTypes"
        :key="t"
        :class="['my-1 mr-2', activeType(t)]"
        :to="textureURL(t)"
        :exact="t == 'all'"
      >{{ t }}</v-btn>
    </div>
    <v-select
      id="selectTextureType"
      v-else
      :items="texturesTypes.map(e => { return {'text': e.toUpperCase(), 'value': e } })"
      item-text="text"
      item-value="value"
      :color="pageColor"
      :item-color="pageColor"
      filled
      v-model="selectTextureType"
    ></v-select>
    <div class="mt-4 mb-2 text-h5">{{ $root.lang().database.subtitles.search }}</div>
    <div class="my-2">
      <v-text-field
        v-model="search"
        :append-outer-icon="search ? 'mdi-send' : undefined"
        filled
        clear-icon="mdi-close"
        clearable
        :color="pageColor"
        :placeholder="$root.lang().database.labels.search_texture"
        type="text"
        v-on:keyup.enter="startSearch"
        @click:append-outer="startSearch"
        @click:clear="clearSearch"
      ></v-text-field>
    </div>

    <div>
      <v-row>
        <v-col>
          <v-btn block :color="pageColor" :class="[textColorOnPage]" @click="openNewMCDialog()">{{ $root.lang().database.labels.add_texture }} <v-icon right>mdi-plus</v-icon></v-btn>
        </v-col>
      </v-row>
      <br>
      <v-row>
        <v-col>
          <v-btn block :color="pageColor" :class="[textColorOnPage]" @click="() => { newVersionModal = true }">{{ $root.lang().database.labels.add_mc_version }} <v-icon right>mdi-plus</v-icon></v-btn>
        </v-col>
        <v-col>
          <v-btn block :color="pageColor" :class="[textColorOnPage]" @click="openModifyMCDialog()">{{ $root.lang().database.labels.edit_mc_version }}<v-icon right>mdi-plus</v-icon></v-btn>
        </v-col>
      </v-row>

      <div class="mt-4 mb-2 text-h5">{{ $root.lang().database.subtitles.texture_result }}</div>
      <div v-if="Object.keys(textures).length" class="main-container pb-4 rounded">
        <v-row class="mb-1 mt-0"><v-col :cols="12/listColumns" xs="1" class="py-0"
            v-for="(textures_arr, index) in splittedResults"
            :key="index"
          >
          <v-list two-line style="padding-top: 1px; padding-bottom: 1px; background: transparent;">
          <v-list-item
            v-for="texture in textures_arr"
            class="my-4"
            :key="texture.id"
          >
            <v-list-item-avatar
              tile
              class="texture-avatar my-0"
              v-text="texture.id"
            ></v-list-item-avatar>

            <v-list-item-content class="py-0">
              <v-list-item-title v-text="texture.name"></v-list-item-title>
              <v-list-item-subtitle v-text="(texture.tags||[]).join(', ')"></v-list-item-subtitle>
            </v-list-item-content>

            <v-list-item-action class="merged">
              <v-btn icon @click="openDialog(texture)">
                <v-icon color="lighten-1">mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon @click="askRemove(texture)">
                <v-icon color="red lighten-1">mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          </v-list>
        </v-col></v-row>

        <v-btn
          :style="{ 'margin': 'auto', 'min-width': '250px !important' }"
          :disabled="displayedResults >= Object.keys(textures).length"
          :color="pageColor"
          :class="textColorOnPage"
          block
          @click="showMore()"
          :v-if="displayedResults < Object.keys(textures).length"
          elevation="2"
        >{{ $root.lang().global.btn.load_more }}</v-btn>

      </div>
      <div v-else><br><p><i>{{ $root.lang().global.no_results }}</i></p></div>
    </div>
  </v-container>`,
  data() {
    const INCREMENT = 250;

    return {
      pageColor: "blue darken-1",
      pageStyles: "",
      textColorOnPage: "white--text",
      newVersionModal: false,
      addMultiple: false,
      recompute: false,
      types: [],
      editions: [],
      versions: [],
      textures: {},
      search: "",
      dialogOpen: false,
      MCDialogOpen: false,
      dialogData: {},
      remove: {
        confirm: false,
        data: {},
      },
      displayedResults: INCREMENT,
      selectTextureType: "all",
    };
  },
  computed: {
    texturesTypes() {
      return ["all", ...this.types];
    },
    type() {
      if (this.$route.params.type && this.texturesTypes.includes(this.$route.params.type))
        return this.$route.params.type;
      return undefined;
    },
    name() {
      if (this.type !== undefined) return this.$route.params.name;
      return this.$route.params.type;
    },
    listColumns() {
      let columns = 1;

      if (this.$vuetify.breakpoint.mdAndUp && this.displayedResults >= 6) {
        columns = 2;
        if (this.$vuetify.breakpoint.lgAndUp && this.displayedResults >= 21) {
          columns = 3;
        }
      }

      if (Object.keys(this.textures).length === 1) columns = 1;

      return columns;
    },
    splittedResults() {
      const res = [];

      const keys = Object.keys(this.textures);
      const len = keys.length;

      for (let col = 0; col < this.listColumns; ++col) {
        res.push([]);
      }

      let arrayIndex = 0;

      for (let i = 0; i < Math.min(this.displayedResults, len); i++) {
        res[arrayIndex].push(this.textures[keys[i]]);
        arrayIndex = (arrayIndex + 1) % this.listColumns;
      }

      return res;
    },
  },
  methods: {
    activeType(t) {
      let res = {};
      if (
        (t === "all" && !this.type && !!this.name) ||
        (t && this.type && t.toLowerCase() === this.type.toLowerCase())
      ) {
        res["v-btn--active " + this.pageColor + " " + this.textColorOnPage] = true;
      }
      return res;
    },
    textureURL(t, name = undefined) {
      return this.name || name
        ? `/textures/${t}/${name !== undefined ? name : this.name}`
        : `/textures/${t}`;
    },
    startSearch() {
      let newPath = this.textureURL(this.type, this.search);

      // DO NOT CHANGE ROUTE IF SAME PATH
      if (newPath !== this.$route.path) {
        this.$router.push(newPath);
      } else {
        // else get textures manually
        this.getTextures();
      }
    },
    clearSearch() {
      this.search = "";
      this.startSearch();
    },
    openDialog(data = {}) {
      this.dialogOpen = true;
      this.dialogData = data;
    },
    disableDialog(refresh = false) {
      if (refresh) {
        this.getTypes();
        this.getEditions();
        this.getTextures();
        this.getVersions();
      }
    },
    openModifyMCDialog() {
      this.MCDialogOpen = true;
    },
    disableMCDialog() {
      this.MCDialogOpen = false;
    },
    openNewMCDialog() {
      this.addMultiple = true;
    },
    askRemove(data) {
      this.remove.data = data;
      this.remove.confirm = true;
    },
    getTypes() {
      axios
        .get(`${this.$root.apiURL}/textures/tags`)
        .then((res) => {
          this.types = res.data;
        })
        .catch(function (err) {
          console.error(err);
        })
        .finally(() => {
          Vue.nextTick(() => {
            this.search = this.name;
          });
        });
    },
    getEditions() {
      axios
        .get(`${this.$root.apiURL}/textures/editions`)
        .then((res) => {
          this.editions = res.data;
        })
        .catch(function (err) {
          console.error(err);
        });
    },
    getVersions() {
      axios
        .get(`${this.$root.apiURL}/textures/versions`)
        .then((res) => {
          this.versions = res.data;
        })
        .catch(function (err) {
          console.error(err);
        });
    },
    getTextures() {
      let url = new URL(`${this.$root.apiURL}/textures/search`);
      if (this.$route.params.type && this.$route.params.type != "all")
        url.searchParams.set("tag", this.$route.params.type);
      if (this.$route.params.name)
        url.searchParams.set("name", this.$route.params.name.replace(/ /g, "_"));
      axios
        .get(url.toString())
        .then((res) => {
          this.textures = res.data;
        })
        .catch((err) => console.error(err));
    },
    update(textures = true) {
      this.getTypes();
      if (textures) this.getTextures();
      this.getEditions();
      this.getVersions();
    },
    showMore() {
      this.displayedResults += 100;
      this.update();
    },
    removeTexture(data) {
      const textureId = data.id;
      return axios
        .delete(`${this.$root.apiURL}/textures/${textureId}`, this.$root.apiOptions)
        .then(() => {
          this.startSearch();
        });
    },
  },
  watch: {
    $route() {
      this.getTextures();
    },
    type(n) {
      this.selectTextureType = n;
    },
    selectTextureType(n) {
      if (n) {
        this.$router.push(this.textureURL(n)).catch(() => {});
      }
    },
  },
  mounted() {
    this.update(false);
    window.updatePageStyles(this);
  },
};
