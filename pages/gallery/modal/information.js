/* global Vue, animate */

export default {
  name: "texture-modal-information",
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      data: {},
      packs: {
        default: {
          "16x": ["default"],
          "32x": ["faithful_32x", "classic_faithful_32x"],
          "64x": ["faithful_64x", "classic_faithful_64x"],
        },
        prog_art: {
          "16x": ["default_prog_art"],
          "32x": ["classic_faithful_32x_prog_art"],
        },
      },
      pack_names: {
        default: "Minecraft",
        default_prog_art: "Minecraft Prog. Art",
        faithful_32x: "Faithful 32x",
        faithful_64x: "Faithful 64x",
        classic_faithful_32x: "Classic Faithful 32x",
        classic_faithful_64x: "Classic Faithful 64x",
        classic_faithful_32x_prog_art: "Classic Faithful 32x Prog. Art",
        classic_faithful_64x_prog_art: "Classic Faithful 64x Prog. Art",
      },
      pack_types: [
        { id: "default", display: "Default" },
        { id: "prog_art", display: "Programmer Art" },
      ],
    };
  },
  mounted() {
    if (Object.keys(this.data.mcmeta).length === 0) return;

    for (const ref in this.$refs) {
      animate(this.data.mcmeta, ref, this.getURL(ref));
    }
  },
  methods: {
    getURL(pack) {
      const [name, url] = this.data.urls.find((el) => el[0] === pack) || [null, null];

      if (url) return url;
      return '';
    },
  },
  template: `
    <div class="gallery-modal-content">

      <div class="gallery-modal-textures-col">
        <div class="gallery-modal-textures" v-for="(pack_type, index) in pack_types">
          <h1>{{ pack_type.display }}</h1>
          <div>
            <div v-for="(res, index) in data.options.resolutions.available" :key="res" class="gallery-modal-col">
              <span>{{ res }}</span>
              <div v-for="(pack, pack_index) in packs[pack_type.id][res]" :key="pack" class="gallery-modal-texture">
                <img v-if="Object.keys(data.mcmeta).length === 0" :src="getURL(pack)" :alt="pack" onerror="this.src='/resources/transparency.png'">
                <canvas v-else :ref="pack" :id="pack"></canvas>
                <span>{{ pack_names[pack] }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- texture name -->
      <!-- <div class="gallery-modal-information-texture-name">
        <div class="gallery-modal-information-id-square">
          [#{{ data.id }}]
        </div>

        <div class="gallery-modal-information-info">
          <div>
            <span class="gallery-modal-information-text-box">{{ data.name }}</span>
          </div>
          <div class="gallery-modal-information-tags">
            <span class="gallery-modal-information-text-box" v-for="tag in data.tags">{{ tag }}</span>
          </div>
        </div>
      </div> -->

      <!-- textures uses -->
      <!-- <div class="gallery-modal-information-texture-uses">
        <div v-for="use in data.uses" class="gallery-modal-information-texture-use">
          <div class="gallery-modal-information-id-square">
            [#{{ use.id }}]
          </div>

          <div class="gallery-modal-information-info">
            <div>
              <span class="gallery-modal-information-text-box">{{ use.name }}</span>
            </div>
            <div class="gallery-modal-information-tags">
              <span class="gallery-modal-information-text-box">{{ use.edition }}</span>
            </div>
          </div>
        </div>
      </div>  -->

      <!-- textures paths -->
      <!-- <div class="gallery-modal-information-paths">
        <div v-for="path in data.paths" class="gallery-paths-per-use">
          <div class="gallery-modal-information-text-box-vertical">{{ path.id }}</div>
          <div class="gallery-modal-information-texture-image"><img v-for="res in data.options.resolutions.available" src="https://raw.githubusercontent.com/Faithful-Resource-Pack/Faithful-Java-32x/1.19/assets/minecraft/textures/block/acacia_trapdoor.png" :alt="res"></div>
        </div>
      </div> -->
    </div>
  `,
};