/* global axios, Vue, settings */

const textureModal = () => import('./modal.js')
const GalleryTooltip = () => import('./gallery_tooltip.js')

const Chain = function(val) {
  return {
    value: val,
    chain: function(predicate) {
      if(this.value !== undefined) return Chain(predicate(this.value))
      return this
    }
  }
}

const MIN_ROW_DISPLAYED = 5;
const COLUMN_KEY = "gallery_columns";
const STRETCHED_KEY = "gallery_stretched";

export default {
  name: "texture-page",
  components: {
    textureModal,
    GalleryTooltip,
  },
  template: `
  <v-container :style="stretched ? 'max-width: 100% !important' : ''">
    <div class="text-h4 py-4">{{ $root.lang().gallery.title }}</div>

    <v-row>
      <v-col cols="12" sm="6">
        <v-select
          :items="options.resolutions"
          :value="current.resolution"
          :label="$root.lang('gallery.category.resolution')"
          v-on:change="updateRoute($event, 'resolution')"
        ></v-select>
      </v-col>

      <v-col cols="12" sm="6">
        <v-select
          :items="options.editions"
          :value="current.edition"
          :label="$root.lang('gallery.category.edition')"
          v-on:change="updateRoute($event, 'edition')"
        ></v-select>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="6">
        <v-select
          :items="options.versions"
          :value="current.version"
          :label="$root.lang('gallery.category.mc_version')"
          v-on:change="updateRoute($event, 'version')"
        ></v-select>
      </v-col>

      <v-col cols="12" sm="6">
        <v-select
          :items="options.tags"
          :value="current.tag"
          :label="$root.lang('gallery.category.tags')"
          v-on:change="updateRoute($event, 'tag')"
        ></v-select>
      </v-col>
    </v-row>

    <v-row  class="my-2">
      <v-col cols="12" sm="6">
        <v-slider
          :label="$root.lang('gallery.max_items_per_row')"
          v-model="columns"
          step="1"
          thumb-label  
          ticks="always"
          tick-size="4"
          ticks
          hide-details
          min="1"
          max="16"
        ></v-slider>
      </v-col>
      <v-col cols="12" sm="6">
        <v-switch
          :label="$root.lang('gallery.stretched_switcher')"
          v-model="stretched"
        ></v-switch>
      </v-col>
    </v-row>

    <div class="my-2 text-h5">{{ $root.lang().gallery.category.search }}</div>
    <v-text-field
      v-model="current.search"
      :append-icon="current.search ? 'mdi-send' : undefined"
      filled
      clear-icon="mdi-close"
      clearable
      hide-details
      :placeholder="$root.lang().database.labels.search_texture"
      type="text"
      v-on:keyup.enter="startSearch"
      @click:append="startSearch"
      @click:clear="clearSearch"
    />

    <br>

    <v-list
      class="main-container pa-2"
      two-line
    >
      <div class="text-center">
        <template v-if="loading">
          <div class="text-h6 ma-1">{{ $root.lang().gallery.loading_message.general }}</div>
          <v-progress-circular
            class="ma-1"
            v-if="loading"
            indeterminate
          />
        </template>
        <template v-if="!loading && displayedTextures.length === 0">
          <div class="text-h6 my-2">
            {{ error ? error : $root.lang().global.no_results }}
          </div>
        </template>
      </div>

      <div
        v-if="!loading"
        class="gallery-textures-container mx-auto"
        :style="styles.grid"
      >
        <div
          v-for="(texture, index) in displayedTextures"
          :key="texture.id"
          v-if="index <= displayedResults"
          :style="styles.cell"
          class="gallery-texture-in-container"
          @click.stop="() => changeShareURL(texture.textureID)"
        >
          <tippy :to="texture.id" placement="right-start" theme="" maxWidth="none">
            <template v-slot:trigger>
              <img
                class="gallery-texture-image"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='block'; this.parentElement.style.background='rgba(0,0,0,0.3)';this.parentElement.classList.add('rounded')"
                :src="texture.url"
                :style="styles.cell"
                lazy-src="https://database.faithfulpack.net/images/bot/loading.gif" />
              
              <div class="not-done" style="display: none;">
                <span></span><div>
                  <h1 :style="styles.not_done.texture_id">#{{ texture.textureID }}</h1>
                  <h3 :style="styles.not_done.texture_name">{{ texture.name }}</h3>
                  <p :style="styles.not_done.message">{{ $root.lang().gallery.error_message.texture_not_done }}</p>
                </div>
              </div>
              <v-btn
                @click.stop="() => copyShareLink(texture.textureID)"
                class="ma-2 gallery-share"
                absolute
                plain
                icon>
                <v-icon>mdi-share-variant</v-icon>
              </v-btn>
            </template>

            <GalleryTooltip
              :mojang="current.resolution === '16x'" 
              :texture="texture"
              :contributions="loadedContributions" 
              :resolution="current.resolution"
              :discordIDtoName="discordIDtoName"
            />
          </tippy>
        </div>
      </div>
    </v-list>
    <div class="bottomElement"></div>

    <texture-modal
      v-model="modalOpen"
      :textureID="modalTextureID"
      :textureObj="modalTextureObj"
      :contributors="loadedContributors"
      :onClose="() => changeShareURL()"
    ></texture-modal>

    <v-btn icon large @click="toTop" v-show="scrollY > 300" class="go_up_btn">
      <v-icon>
        mdi-arrow-up
      </v-icon>
    </v-btn>
  </v-container>
  `,
  data() {
    return {
      // whether the page shouldn't be stretched to the full width
      stretched:
        localStorage.getItem(STRETCHED_KEY, "true") === "true" ? true : false,
      // number of columns you want to display
      columns: Number.parseInt(localStorage.getItem(COLUMN_KEY) || 7),
      // whether search is loading
      loading: false,
      // string error extracted
      error: undefined,
      // search values available
      options: {
        resolutions: ["16x", ...settings.resolutions],
        tags: [this.$root.lang().gallery.all],
        versions: settings.versions.java.map((e) => e.toLowerCase()),
        editions: settings.editions.map((e) => e.toLowerCase()),
      },
      // search values
      current: {
        resolution: settings.resolutions[0],
        tag: "all",
        version: settings.versions.java[0],
        edition: settings.editions[0],
        search: null,
      },
      // number of displayed results
      displayedResults: 1,
      // result
      displayedTextures: [],
      // loaded contributions
      loadedContributions: [],
      // loaded contributors
      loadedContributors: [],
      // modal opened ID
      modalTextureID: null,
      // modal texture opened
      modalTextureObj: {},
      // whether modal is opened
      modalOpen: false,
      // styles
      styles: {
        // gallery cell styles
        cell: {
          "aspect-ratio": "1",
        },
        // grid styles
        grid: undefined,
        // placeholder font size styles
        not_done: {
          texture_id: "font-size: 2em;",
          texture_name: "font-size: 1.17em;",
          message: "font-size: 16px",
        },
      },
    };
  },
  computed: {
    displayedTexturesObject: function () {
      return this.displayedTextures.reduce((acc, cur) => {
        acc[cur.textureID] = cur;
        return acc;
      }, {});
    },
  },
  watch: {
    "$route.params": {
      handler(params, old_params) {
        // if hash changed but not params
        if (JSON.stringify(params) === JSON.stringify(old_params)) return;

        this.current.resolution = params.resolution;
        this.current.edition = params.edition;
        this.current.version = params.version;
        this.current.tag = params.tag;
        this.current.search = params.search;

        this.updateSearch();
      },
      deep: true,
      immediate: true,
    },
    columns(n) {
      localStorage.setItem(COLUMN_KEY, String(n));
      this.computeGrid();
    },
    stretched(n) {
      localStorage.setItem(STRETCHED_KEY, n);
      this.computeGrid();
    },
  },
  methods: {
    shareID() {
      let index = location.hash.indexOf("?show=");
      return index !== -1
        ? Number.parseInt(location.hash.substring(index + 6), 10)
        : undefined;
    },
    changeShareURL(id, dry_run = false) {
      let index = location.hash.indexOf("?show=");

      let new_hash = location.hash;
      // we remove it
      if (index !== -1) {
        new_hash = new_hash.substring(0, index);
      }

      if (id !== undefined) {
        new_hash += "?show=" + id.toString();
      }

      if (!dry_run) {
        location.hash = new_hash;
      }

      return location.href.replace(location.hash, "") + new_hash;
    },
    copyShareLink(id) {
      let url = this.changeShareURL(id, true);
      navigator.clipboard.writeText(url);
      this.$root.showSnackBar(
        this.$root.lang("gallery.share_link_copied_to_clipboard"),
        "success"
      );
    },
    checkShare(n) {
      if (n === undefined) return;

      this.openModal(n);
    },
    openModal(id) {
      this.modalTextureID = id;
      this.modalTextureObj = {}; // changes text back to loading text if reopening modal
      this.modalOpen = true;

      axios.get(`${this.$root.apiURL}/gallery/modal/${id}/${this.current.version}`).then((res) => {
        this.modalTextureObj = res.data;
      });
    },
    getAuthor(textureID) {
      let contributionsHTML = "";

      // safely chains operations
      let contributions = Chain(this.loadedContributions)
        .chain(
          (contribs) =>
            contribs[
              this.current.resolution === "32x"
                ? "faithful_32x"
                : "faithful_64x"
            ]
        )
        .chain((res_contribs) => res_contribs[textureID]).value;

      if (contributions) {
        const timestamp = contributions.reduce(
          (a, b) => (a = a > b.date ? a : b.date),
          0
        );
        const contribution = contributions.filter(
          (el) => el.date == timestamp
        )[0];

        contributionsHTML = `
          <li>
            <p><i class="icon-people${
              contribution.contributors.length == 1 ? "" : "s"
            }"></i>${contribution.contributors
          .map((c) => this.discordIDtoName(c).replace(/\s/g, "&nbsp;"))
          .join(", ")}</p>
            <p><i class="icon-time"></i>${this.timestampToDate(timestamp)}</p>
          </li>
        `;
      } else contributionsHTML = `<li class="danger-text"><p>$</p></li>`;

      if (this.current.resolution === "16x")
        contributionsHTML = `<li><i class="icon-mojang-red"></i>Mojang Studios</li>`;

      return `
      <div class="texture-tooltip">
        <div class="texture-info-container">
          <h1 align="left" class="encased">#${textureID}&nbsp;&dash;&nbsp;${
        this.displayedTexturesObject[textureID].name
      }</h1>
          <ul align="left" class="encased">${contributionsHTML}</ul>
        </div>
        <div class="texture-tags-container">
          <span class="encased">#${this.displayedTexturesObject[
            textureID
          ].tags.join('</span><span class="encased">#')}</span>
        </div>
      </div>
      `;
    },
    discordIDtoName(d) {
      return (
        new Chain(this.loadedContributors[d]).chain(
          (c) =>
            c.username || this.$root.lang().gallery.error_message.user_anonymous
        ).value || this.$root.lang().gallery.error_message.user_not_found
      );
    },
    timestampToDate(t) {
      const a = new Date(t);
      return moment(a).format("ll");
    },
    startSearch() {
      this.updateRoute(null, null, true);
    },
    clearSearch() {
      this.updateRoute(null, "search", true);
    },
    updateRoute(data, type, force = false) {
      if (this.current[type] === data && !force) return; // avoid redundant redirection

      this.current[type] = data;

      // user safe interaction
      // check if resolution exist
      if (
        !settings.resolutions.includes(this.current.resolution) &&
        this.current.resolution !== "16x"
      )
        this.current.resolution = settings.resolution[0];

      // check if edition exist
      if (!settings.editions.includes(this.current.edition))
        if (
          !settings.versions[this.current.edition.toLowerCase()].includes(
            this.current.version
          )
        ) {
          this.current.version = settings.versions[this.current.edition][0];
          this.options.versions = settings.versions[this.current.edition];
        }

      let route = `/gallery/${this.current.edition}/${this.current.resolution}/${this.current.version}/${this.current.tag}`;
      route += !this.current.search ? "" : `/${this.current.search}`;

      if (this.$route.path === route) return; // new search is the same as before
      return this.$router.push(route);
    },
    updateSearch: function () {
      if (this.loading) return;
      this.loading = true;
      this.displayedTextures = [];

      const version =
        this.current.version === "latest"
          ? this.options.versions[0]
          : this.current.version;

      // /gallery/{res}/{edition}/{mc_version}/{tag}
      axios
        .get(
          `${this.$root.apiURL}/gallery/${this.current.resolution}/${
            this.current.edition
          }/${version}/${this.current.tag}${
            this.current.search ? `?search=${this.current.search}` : ""
          }`
        )
        .then((res) => {
          this.displayedTextures = res.data;
        })
        .catch((e) => {
          console.error(e);
          this.error = `${e.statusCode}: ${e.response.message}`;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    scroll() {
      window.onscroll = () => {
        let scrolledTo = document.querySelector(".bottomElement");

        if (scrolledTo && this.isScrolledIntoView(scrolledTo, 600)) {
          this.displayedResults += this.columns * MIN_ROW_DISPLAYED;
          this.$forceUpdate();
        }
      };
    },
    isScrolledIntoView(el, margin = 0) {
      let rect = el.getBoundingClientRect();
      let elemTop = rect.top;
      let elemBottom = rect.bottom;

      let isVisible = elemTop < window.innerHeight + margin && elemBottom >= 0;
      return isVisible;
    },
    toTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
    computeGrid() {
      let breakpoints = this.$root.$vuetify.breakpoint;
      let gap;
      let number;

      let base_columns = this.columns;

      if (breakpoints.smAndDown) {
        base_columns = breakpoints.smOnly ? 2 : 1;
      }

      // constants
      const MIN_WIDTH = 110;
      const MARGIN = 20; // .container padding (12px) + .v-list.main-container padding (8px)

      // real content width
      const width = this.$el.clientWidth - MARGIN * 2;

      if (base_columns != 1) {
        // * We want to solve n * MIN_WIDTH + (n - 1) * A = width
        // * where A = 200 / (1.5 * n)
        // * => n * MIN_WIDTH + ((n*200)/(1.5*n)) - 1*200/(1.5*n) = width
        // * => n * MIN_WIDTH + 200/1.5 - 200/(1.5*n) = width
        // * multiply by n
        // * => n² * MIN_WIDTH + 200n/1.5 - 200/1.5 = width*n
        // * => n² * MIN_WITH + n * (200/1.5 - width) - 200/1.5 = 0
        // * solve that and keep positive value
        let a = MIN_WIDTH;
        let b = 200 / 1.5 - width;
        let c = -200 / 1.5;
        let delta = b * b - 4 * a * c;
        let n = (-b + Math.sqrt(delta)) / (2 * a);
        gap = 200 / (n * 1.5);
        number = Math.min(base_columns, Math.floor(n));
      } else {
        gap = 8;
        number = 1;
      }

      const font_size = width / number / 20;

      this.styles.not_done = {
        texture_id: { "font-size": `${font_size * 4}px` },
        texture_name: { "font-size": `${font_size * 2}px` },
        message: { "font-size": `${font_size * 1.2}px` },
      };

      this.styles.grid = {
        gap: `${gap}px`,
        "grid-template-columns": `repeat(${number}, 1fr)`,
      };
    },
  },
  created() {
    window.addEventListener("hashchange", () => {
      this.checkShare(this.shareID());
    });
    this.checkShare(this.shareID());

    axios.get(`${this.$root.apiURL}/textures/tags`).then((res) => {
      this.options.tags = [...this.options.tags, ...res.data];
    });
    axios.get(`${this.$root.apiURL}/contributions/authors`).then((res) => {
      this.loadedContributors = res.data.reduce((acc, cur) => {
        acc[cur.id] = cur;
        return acc;
      }, {});
    });
    axios.get(`${this.$root.apiURL}/contributions/raw`).then((res) => {
      this.loadedContributions = res.data
        .filter((contribution) => contribution.pack && contribution.texture)
        .reduce((acc, cur) => {
          if (!acc[cur.pack]) acc[cur.pack] = {};
          if (!acc[cur.pack][cur.texture]) acc[cur.pack][cur.texture] = [];

          acc[cur.pack][cur.texture].push({
            contributors: cur.authors,
            date: cur.date,
          });

          return acc;
        }, {});
    });

    this.displayedResults = this.columns * MIN_ROW_DISPLAYED;
  },
  mounted() {
    this.scroll();
    window.addEventListener("resize", () => {
      this.computeGrid();
    });
    this.computeGrid();
  },
};