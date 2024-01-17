/* global axios, Vue */

export default {
  name: "pack-page",
  template: `
    <v-container>
      <div class="styles" v-html="pageStyles"></div>
      <div class="text-h4 py-4">
        {{ $root.lang().database.titles.packs }}
      </div>

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
      pageColor: "amber darken-2",
      pageStyles: "",
      search: "",
      textColorOnPage: "white--text",
      tags: [],
      packs: [],
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
