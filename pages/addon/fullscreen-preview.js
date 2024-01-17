export default {
  name: "fullscreen-preview",
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
      default: () => 16 / 9,
    },
    src: {
      required: true,
    },
  },
  data() {
    return {
      fullscreen: false,
    };
  },
  methods: {
    close() {
      this.fullscreen = false;
    },
    open() {
      this.fullscreen = true;
    },
  },
};
