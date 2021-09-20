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
        <v-card-title class="headline">{{ $root.lang().addons.remove.title }}</v-card-title>
        <v-card-text>
          <v-form ref="form" lazy-validation>
            <p>{{ $root.lang().addons.remove.labels.question.replace("%s", data.title) }}</p>
            <p style="color: red">{{ $root.lang().addons.remove.labels.warning }}</p>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="darken-1"
            text
            @click="disableDialog"
          >
            {{ $root.lang().global.btn.cancel }}
          </v-btn>
          <v-btn
            color="error darken-1"
            @click="deleteAddon"
          >
            {{ $root.lang().global.btn.yes }}
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
      const data = {
        id: JSON.parse(JSON.stringify(this.$props.data.id)),
        token: this.$root.user.access_token
      }

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
