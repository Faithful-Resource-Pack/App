/* global axios, Vue */

export default {
  name: 'use-modal',
  props: {
    dialog: {
      type: Boolean,
      required: true
    },
    editions: {
      type: Array,
      required: false,
      default: function () { return [] }
    },
    versions: {
      type: Array,
      required: false,
      default: function () { return [] }
    },
    disableDialog: {
      type: Function,
      required: true
    }
  },
  template: `
  <v-dialog
    v-model="dialog"
    persistent
    max-width="600"
  >   
    <v-card>
      <v-card-title class="headline">{{ $root.lang().database.titles.add_mc_version }}</v-card-title>
      <v-card-text class="mb-0">
        <v-form ref="form">
          <v-row>
            <v-col><v-select class="mb-0" :items="editions" v-model="form.edition" :placeholder="$root.lang().database.labels.new_mc_version_edition"></v-select></v-col>
            <v-col><v-select class="mb-0" :items="versions" v-model="form.version" :placeholder="$root.lang().database.labels.new_mc_version_path"></v-select></v-col>
            <v-col><v-text-field class="mb-0" v-model="form.newVersion" :placeholder="$root.lang().database.labels.new_mc_version_name"></v-text-field></v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="red darken-1"
          text
          @click="disableDialog"
        >
          {{ $root.lang().global.btn.cancel }}
        </v-btn>
        <v-btn
          color="darken-1"
          text
          @click="send"
        >
          {{ $root.lang().global.btn.add }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>`,
  data () {
    return {
      form: {
        edition: '',
        version: '',
        newVersion: ''
      }
    }
  },
  methods: {
    send: function () {
      axios.post('/textures/versions/add', {
        token: this.$root.user.access_token,
        data: this.form
      })
        .then(() => {
          this.$root.showSnackBar(this.$root.lang().database.labels.add_version_success, 'success')
        })
        .catch(err => {
          console.error(err)
          this.$root.showSnackBar(`${err.message}: ${err.response.data.error}`, 'error')
        })
    }
  },
  watch: {
    dialog: function (newValue, oldValue) {
      if (oldValue !== newValue && newValue === true) {
        Vue.nextTick(() => {
          this.$refs.form.reset()
        })
      }
    }
  }
}
