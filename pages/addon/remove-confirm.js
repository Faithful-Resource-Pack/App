/* global axios */

export default {
  name: 'addon-remove-confirm',
  template: `
  <v-dialog
      v-model="confirm"
      persistent
      max-width="600"
    >
      <v-card>
        <v-card-title class="headline">Confirm deletion</v-card-title>
        <v-card-text>
          <v-form ref="form" lazy-validation>
            <p>Do you want to delete <strong>{{ data.title }}?</strong></p>
            <p color="red">You can't undo this operation</p>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="darken-1"
            text
            @click="disableDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error darken-1"
            @click="deleteAddon"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  `,
  props: {
    confirm: {
      type: Boolean,
      required: true
    },
    data: {
      type: Object,
      required: true
    },
    disableDialog: {
      type: Function,
      required: true
    }
  },
  computed: {
    title: function () {
      return this.$props.data.title
    }
  },
  methods: {
    deleteAddon: function () {
      const data = JSON.parse(JSON.stringify(this.$props.data))

      axios.post('/addons/remove', data)
        .then(() => {
          this.$root.showSnackBar(this.$root.lang().global.ends_success, 'success')
          this.disableDialog(true)
        })
        .catch(error => {
          console.error(error)
          this.$root.showSnackBar(`${error.message} : ${error.response.data.error}`, 'error')
          this.disableDialog(true)
        })
    }
  }
}
