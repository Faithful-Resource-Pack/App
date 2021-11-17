/* global axios, Vue */

export default {
  name: 'texture-modal',
  template: `
    <v-dialog
      v-model="opened"
      fullscreen
      hide-overlay
      transition="dialog-right-transition"
      @click.stop="closeModal"
    >
      <v-card>
        <v-card-title class="headline" >[#{{ textureID }}]</v-card-title>

        <v-card-actions>
          <v-btn
            color="darken-1"
            text
            @click="closeModal"
          >
            {{ $root.lang().global.btn.close }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  `,
  props: {
    opened: {
      type: Boolean,
      required: true
    },
    closeModal: {
      type: Function,
      required: true
    },
    textureID: {
      type: String,
      required: true
    }
  }
}