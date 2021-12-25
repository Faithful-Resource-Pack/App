export default {
  name: `image-previewer`,
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
        />
        <v-card class="ma-2" rounded style="display: inline-block; position: absolute; right: 0; top: 0;">
          <v-icon small class="ma-1" @click="onFullscreen(item, index)">
            mdi-fullscreen
          </v-icon><v-icon small class="ma-1" @click="onDelete(item, index)">
            mdi-delete
          </v-icon>
        </v-card>
      </v-card>
    </div>
  </div>
  <v-dialog
    v-model="fullscreen"
  >
    <v-card>
      <v-img
        v-if="fullscreenItem"
        :src="fullscreenItem"
        alt="fullscreen preview" 
        :aspect-ratio="16/9" 
      />
    </v-card>
  </v-dialog>
</v-container>
  `,
  props: {
    sources: {
      required: true,
      type: Array
    },
  },
  data: function() {
    return {
      fullscreen: false,
      fullscreenIndex: undefined
    }
  },
  computed: {
    fullscreenItem: function() {
      if(this.fullscreenIndex === undefined) return undefined
      return this.sources[this.fullscreenIndex]
    },
  },
  methods: {
    onDelete: function(item, index) {
      this.$emit('item-delete', item, index)
    },
    onFullscreen: function(item, index) {
      this.fullscreen = true
      this.fullscreenIndex = index
    },
    disableFullscreen: function() {
      this.fullscreen = false
    }
  }
}