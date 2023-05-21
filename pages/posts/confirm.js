/* global axios */

export default {
  name: 'confirm',
  props: {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    }
  },
  template: `
  <v-dialog
      v-model="opened"
      max-width="600"
    >
      <v-card>
        <v-card-title class="headline">{{ title }}</v-card-title>
        <v-card-text>
          <v-form ref="form" lazy-validation>
            <p v-html="message"></p>
            <slot></slot>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="darken-1"
            text
            @click="onCancel"
          >
            {{ $root.lang('global.btn.cancel') }}
          </v-btn>
          <v-btn
            color="error darken-1"
            @click="onSubmit"
          >
            {{ $root.lang('global.btn.yes') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  `,
  data: function () {
    return {
      opened: false,
      data: undefined
    }
  },
  methods: {
    openDialog(data) {
      this.data = data
      this.opened = true
    },
    onCancel() {
      this.opened = false
      this.$emit('cancel')
    },
    onSubmit() {
      this.opened = false
      this.$emit('submit', this.data)
    }
  }
}
