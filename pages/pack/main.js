/* global axios, Vue */

const PackCreator = () => import("./pack_creator.js");
const PackRemoveConfirm = () => import("./pack_remove_confirm.js");

export default {
  name: "pack-page",
  components: {
    "pack-creator": PackCreator,
    "pack-remove-confirm": PackRemoveConfirm
  },
  template: `
    <v-container>
      <div class="styles" v-html="pageStyles"></div>
      <pack-creator
        :color="pageColor"
        :dialog="dialogOpen"
        :disableDialog="disableDialog"
        :data="dialogData"
        :add="dialogDataAdd"
        :tags="tags">
      </pack-creator>
      <pack-remove-confirm
        :confirm="remove.confirm"
        :disableDialog="function() { remove.confirm = false; startSearch(); }"
        :data="remove.data">
      </pack-remove-confirm>

      <v-row no-gutters class="py-0 mb-0" align="center">
        <v-col cols="12" sm="6" class="mt-4 py-sm-0">
        <div class="text-h4 py-4">
          {{ $root.lang().database.titles.packs }}
        </div>
        </v-col>
        <v-col cols="12" sm="6" class="mt-4 py-sm-0">
          <v-btn block :color="pageColor" @click="openDialog()">
            {{ $root.lang('database.labels.add_new_pack') }}<v-icon right dark>mdi-plus</v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <!-- tag switcher -->
      <div class="my-2 text-h5">{{ $root.lang().database.labels.select_pack_type }}</div>
      <v-btn
        v-for="t in packTags"
        :key="t"
        :class="['my-1 mr-2', activeTag(t)]"
        :to="packURL(t)"
        :exact="t == 'all'"
      >{{ formatTags(t) }}</v-btn>

      <!-- results -->
      <div class="mt-4 mb-2 text-h5">{{ $root.lang().database.subtitles.pack_result }}</div>
      <v-list rounded v-if="packs.length" two-line class="main-container">
        <v-row class="mb-1 mt-0"><v-col :cols="12/listColumns" xs="1" class="py-0"
          v-for="(pack, index) in packs"
          :key="pack.id"
        >
          <v-list-item>
            <v-list-item-avatar
              :style="{
                'height': '64px',
                'width': '64px',
                'min-width': '64px',
                'border-radius': '10px'
              }"
            >
              <v-img :src="pack.logo" />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="pack.name"></v-list-item-title>
              <v-list-item-subtitle v-text="(pack.tags.map(formatTags) || []).join(', ')"></v-list-item-subtitle>
            </v-list-item-content>

            <!-- action buttons -->
            <v-list-item-action class="merged">
              <v-btn icon @click="openDialog(pack)">
                <v-icon color="lighten-1">mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon @click="askRemove(pack)">
                <v-icon color="red lighten-1">mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-col></v-row>
      </v-list>
      <div v-else class="text-center">
        <v-progress-circular
          indeterminate
          :color="pageColor"
        ></v-progress-circular>
      </div>
    </v-container>
  `,
  data() {
    return {
      pageColor: "amber accent-4",
      pageStyles: "",
      search: "",
      textColorOnPage: "white--text",
      tags: [],
      packs: [],
      dialogOpen: false,
      dialogData: {},
      dialogDataAdd: false,
      remove: {
        data: {},
        confirm: false,
      },
    };
  },
  methods: {
    activeTag(t) {
      const result = {};
      result["v-btn--active " + this.pageColor + " " + this.textColorOnPage] =
        (t === "all" && !this.tag) || (t && this.tag && t.toLowerCase() === this.tag.toLowerCase());

      return result;
    },
    startSearch() {
      // change url to match
      const newPath = this.packURL(this.tag);
      if (newPath !== this.$route.path) return this.$router.push(newPath);

      // "all" tag searches everything
      const url = new URL(`${this.$root.apiURL}/packs/search`);
      if (this.tags.includes(this.$route.params.type))
        url.searchParams.set("tag", this.$route.params.type);

      axios
        .get(url.toString())
        .then((res) => {
          this.packs = res.data;
        })
        .catch((err) => console.error(err));
    },
    packURL(tag) {
      return "/packs/" + tag ?? "all";
    },
    formatTags(s) {
      return s
        .split("_")
        .map((p) => (p == "progart" ? "Programmer Art" : p[0].toUpperCase() + p.slice(1)))
        .join(" ");
    },
    openDialog(data = undefined) {
      this.dialogData = data;
      this.dialogDataAdd = data === undefined;
      this.dialogOpen = true;
    },
    disableDialog(refresh = false) {
      this.dialogOpen = false;
      this.dialogData = {};
      if (refresh) this.startSearch();
    },
    askRemove(data) {
      this.remove.data = data;
      this.remove.confirm = true;
    },
  },
  computed: {
    packTags() {
      return ["all", ...this.tags];
    },
    tag() {
      if (this.$route.params.type) return this.$route.params.type;
      return "all";
    },
    listColumns() {
      // big screens use two columns, smaller use one
      return this.$vuetify.breakpoint.mdAndUp ? 2 : 1;
    },
  },
  mounted() {
    axios.get(`${this.$root.apiURL}/packs/tags`).then((res) => (this.tags = res.data));
    this.startSearch();
    window.updatePageStyles(this);
  },
  watch: {
    "$route.params": {
      handler(params, old) {
        // if hash changed but not params
        if (JSON.stringify(params) === JSON.stringify(old)) return;

        // search whenever the url changes (when tag is switched)
        this.startSearch();
      },
    },
  },
};