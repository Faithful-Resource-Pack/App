export default {
  name: 'remove-confirm',
  template: `
  <v-dialog
      v-model="opened"
      persistent
      max-width="600"
    >
      <v-card>
        <v-card-title class="headline">{{ title }}</v-card-title>
        <v-card-text>
          <slot></slot>
        <v-card-actions class="mt-4 pr-0">
          <v-spacer></v-spacer>
          <v-btn
            color="darken-1"
            text
            @click="onCancel"
          >
            {{ $root.lang().global.btn.cancel }}
          </v-btn>
          <v-btn
            color="darken-1"
            elevation="0"
            @click="onConfirm"
          >
            {{ confirmText }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  `,
  props: {
    confirmText: {
      type: String,
      required: false,
      default: function() {
        return this.$root.lang().global.btn.yes
      }
    },
    opened: {
      type: Boolean,
      required: true
    },
    onCancel: {
      type: Function,
      required: true
    },
    onConfirm: {
      type: Function,
      required: true
    },
    title: {
      type: String,
      required: false,
      default: function() {
        return this.$root.lang().database.titles.confirm_deletion
      }
    }
  }
}