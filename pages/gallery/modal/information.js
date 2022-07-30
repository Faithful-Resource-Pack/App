/* global Vue */

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
      provider: {
        context: [],
      },
    };
  },
  provide() {
    return {
      provider: this.provider,
    };
  },
  mounted() {
    if (Object.keys(this.data.mcmeta).length === 0) return;

    // setup
    const mcmeta = this.data.mcmeta;
    const tick = Math.max(mcmeta.animation.frametime || 1, 1);
    const frames = [];
    let interval;

    // drawing
    for (const ref in this.$refs) {
      // wonky as f
      const canvas = document.getElementById(ref);
      const context = canvas.getContext("2d");

      canvas.width = 256;
      canvas.height = 256;

      const image = new Image();
      image.src = this.getURL(ref);
      image.onload = () => {

        if (mcmeta.animation.frames && mcmeta.animation.frames.length > 0) {
          interval = mcmeta.animation.interpolate 
            || mcmeta.animation.frames.find((e) => typeof e === 'object' && e.time % tick !== 0)
            ? 1 : tick;

          for (let e = 0; e < mcmeta.animation.frames.length; e++) {
            const a = mcmeta.animation.frames[e];
            if (typeof a === 'object') frames.push({
              index: a.index,
              duration: Math.max(a.time, 1) / interval,
            })

            else frames.push({
              index: a,
              duration: tick / interval,
            });
          }
        } else {
          interval = mcmeta.animation.interpolate ? 1 : tick;
          const e = image.height / image.width;
          for (let a = 0; a < e; a++) frames.push({ index: a, duration: tick / interval });
        }

        
        const draw = (frame = 0, ticks = 0) => {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.globalAlpha = 1;
          context.imageSmoothingEnabled = false;
          context.drawImage(
            image,
            0,
            image.width * frames[frame].index,
            image.width,
            image.width,
            0,
            0,
            canvas.width,
            canvas.height
          );

          if (mcmeta.animation.interpolate) {
            context.globalAlpha = ticks / frames[frame].duration;
            context.drawImage(
              image,
              0,
              image.width * frames[(frame + 1) % frames.length].index,
              image.width,
              image.width,
              0,
              0,
              canvas.width,
              canvas.height
            )
          }
        }

        let ticks = 0;
        let currentFrame = 0;
        const update = () => {
          ticks++;

          if (frames[currentFrame].duration <= ticks) {
            ticks = 0;
            currentFrame++;
            if (currentFrame >= frames.length) currentFrame = 0;
            draw(currentFrame);
          }
          
          else if (mcmeta.animation.interpolate) draw(currentFrame, ticks);
        }

        setInterval(() => {
          update();
        }, interval * 50);
        
      }

      image.onerror = () => {
        canvas.remove();
      }
    }

    console.log(this.provider)
  },
  methods: {
    getURL(pack) {
      const [name, url] = this.data.urls.find((el) => el[0] === pack) || [null, null];

      if (url) return url;
      return null;
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
                <img v-if="Object.keys(data.mcmeta).length === 0" :src="getURL(pack)" :alt="pack" onerror="this.src = '/resources/transparency.png'">
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