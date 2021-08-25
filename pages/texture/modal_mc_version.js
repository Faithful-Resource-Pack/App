/* global axios, Vue */

export default {
  name: 'version-modal',
  template: `
  <v-dialog
    v-model="MCDialog"
    persistent
    max-width="600"
  >

  <v-card>
    <v-card-title class="headline">Modify a Minecraft Version</v-card-title>
    <v-card-text>
      <v-row>
        <v-col class="col-12" sm="12">
          <p align="justify">
            Hm, the whole database is setup to upload texture to the 1.17 branch but there is now a 1.17.1 available, this options is made for you!
            <br><br>
            <strong style="color: red">Please don't forget to also update all GitHub branches!</strong>
          </p>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12" sm="12">
          <v-form ref="form">
            <v-text-field required v-model="form.actual" label="Actual MC Version"></v-text-field>
            <v-text-field required v-model="form.new" label="New MC Version"></v-text-field>
          </v-form>
        </v-col>
      </v-row>
    </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="darken-1"
          text
          @click="disableMCDialog"
        >
          Cancel
        </v-btn>
        <v-btn
          color="error darken-1"
          @click="send"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>`,
  props: {
    MCDialog: {
      type: Boolean,
      required: true
    },
    disableMCDialog: {
      type: Function,
      required: true
    }
  },
  data () {
    return {
      form: {
        actual: '1.17',
        new: '1.17.1'
      }
    }
  },
  methods: {
    send: function () {
      let data = JSON.parse(JSON.stringify(this.form))
      data.token = this.$root.user.access_token

      axios.post(`/paths/version-update/`, data)
      .then(() => {
        this.$root.showSnackBar('Ended successfully', 'success')
        this.disableMCDialog(true)
      })
      .catch(err => {
        console.error(err)
        this.$root.showSnackBar(`${err.message}: ${err.response.data.error}`, 'error')
      })
    }
  }
}