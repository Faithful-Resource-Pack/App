/* global axios, TwinBcrypt */

export default {
  name: 'remove-confirm',
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
            <p>Do you want to delete this {{ type }}?</p>

            <v-checkbox v-if="type == 'use'" v-model="deletePaths" label="Delete all paths attached (Highly Recommended)"></v-checkbox>
            <blockquote v-if="type == 'use'">
              <v-btn
                text
                @click="getPaths(data.id)"
              >
                See affected paths
              </v-btn>

              <br>

              <v-list-item
                v-for="(path, index) in data.paths"
                :key="index"
              >
                <v-list-item-title>
                  {{ path.path }}
                  <v-list-item-subtitle v-text="'#' + path.id + ' — ' + path.versions.join(', ')"></v-list-item-subtitle>
                </v-list-item-title>
              </v-list-item>
            </blockquote>

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
            @click="deleteData"
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
    },
    type: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      formData: {},
      deletePaths: true,
      paths: {}
    }
  },
  methods: {
    getPaths: function (useID) {
      axios.get('/paths/search', {
        params: {
          useID: useID
        }
      })
      .then((res) => {
        const temp = res.data
        this.data.paths = {}

        for (let i = 0; i < temp.length; i++) {
          this.data.paths[temp[i].id] = temp[i]
        }

        this.$forceUpdate()
      })
      .catch(function (err) {
        console.error(err)
      })
    },
    deleteData: function() {
      const data = {
        id: this.data.id,
        deletePaths: this.deletePaths,
      }

      axios.post(`/${this.type}s/remove`, data)
      .then(() => {
        this.$root.showSnackBar('Ended successfully', 'success')
        this.disableDialog(true)
      })
      .catch(err => {
        console.error(err)
        this.$root.showSnackBar(`${err.message} : ${err.response.data.error}`, 'error')
        this.disableDialog(true)
      })
    }
  }
}