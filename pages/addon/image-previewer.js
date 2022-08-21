const FullscreenPreview = () => import('./fullscreen-preview.js')

export default {
  name: `image-previewer`,
  components: {
    FullscreenPreview
  },
  template: `
<div>
  <div class="scroller" style="overflow: auto; white-space: nowrap;">
    <div class="scroller-content">
      <v-card class="pa-0 mr-2" style="display: inline-block;" v-for="(item, index) in sources" :key="index">
        <v-img
          class="rounded"
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
          </v-icon><v-icon small class="ma-1" @click.stop="(e) => onDelete(item, index, e)">
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
  `,
  props: {
    sources: {
      required: true,
      type: Array
    },
    ids: {
      required: false,
      type: Array,
      default: undefined
    },
  },
  data: function() {
    return {
      fullscreenIndex: undefined
    }
  },
  computed: {
    fullscreenItem: function() {
      if (this.fullscreenIndex === undefined) return undefined
      return this.sources[this.fullscreenIndex]
    },
  },
  methods: {
    onDelete: function(item, index, e) {
      if(e) e.target.blur();

      if(this.ids !== undefined) {
        this.$emit('item-delete', item, index, this.ids[index])
      } else {
        this.$emit('item-delete', item, index, undefined)
      }
    },
    onFullscreen: function(item, index, e) {
      if (e) e.target.blur();
      this.fullscreenIndex = index
      this.$refs.preview.open()
    }
  }
}