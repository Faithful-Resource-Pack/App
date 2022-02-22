export default {
  name: 'fullscreen-preview',
  template: `
  <v-dialog
    v-model="fullscreen"
  >
    <v-card>
      <v-img
        alt="fullscreen preview"
        :src="src" 
        :aspect-ratio="aspectRatio" 
        v-on:click="close"
      />
    </v-card>
  </v-dialog>
  `,
  props: {
    aspectRatio: {
      required: false,
      type: Number,
      default: () => 16/9
    },
    src: {
      required: true,
      type: String
    }
  },
  data: function () {
    return {
      fullscreen: false
    }
  },
  methods: {
    close: function() {
      this.fullscreen = false
    },
    open: function() {
      this.fullscreen = true
    }
  }
}