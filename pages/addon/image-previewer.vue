<template>
<v-container :class="[notEmpty ? 'px-0 pt-0' : 'pa-0']">
  <div class="scroller" style="overflow: auto; white-space: nowrap;">
    <div class="scroller-content">
      <v-card class="pa-0 mr-2" style="display: inline-block;" v-for="(item, index) in sources" :key="index">
        <v-img
          class="rounded image-fullscreen-thumb"
          :src="item"
          height="150"
          :width="150*16/9"
          :aspect-ratio="16/9"
          alt="preview"
          @click="onFullscreen(item, index)"
        />
        <v-card class="ma-2" rounded style="display: inline-block; position: absolute; right: 0; top: 0;">
          <v-icon small class="ma-1" @click.stop="(e) => onFullscreen(item, index, e)">
            mdi-fullscreen
          </v-icon><v-icon v-if="deletable" small class="ma-1" @click.stop="(e) => onDelete(item, index, e)">
            mdi-delete
          </v-icon>
        </v-card>
      </v-card>
    </div>
  </div>

  <fullscreen-preview
    ref="preview"
    :src="fullscreenItem"
  />
</v-container>
  </template>

<script>
const FullscreenPreview = () => import("./fullscreen-preview.vue");

export default {
  name: `image-previewer`,
  components: {
    FullscreenPreview,
  },

  props: {
    sources: {
      required: true,
      type: Array,
    },
    ids: {
      required: false,
      type: Array,
      default: undefined,
    },
    deletable: {
      required: false,
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      fullscreenIndex: undefined,
    };
  },
  computed: {
    fullscreenItem() {
      if (this.fullscreenIndex === undefined) return undefined;
      return this.sources[this.fullscreenIndex];
    },
    notEmpty() {
      return this.sources && !!this.sources.length;
    },
  },
  methods: {
    onDelete(item, index, e) {
      if (e) e.target.blur();

      if (this.ids !== undefined) {
        this.$emit("item-delete", item, index, this.ids[index]);
      } else {
        this.$emit("item-delete", item, index, undefined);
      }
    },
    onFullscreen(item, index, e) {
      if (e) e.target.blur();
      this.fullscreenIndex = index;
      this.$refs.preview.open();
    },
  },
};
</script>