/* global axios */

export default {
  name: "pack-remove-confirm",
  template: `
  <v-dialog
      v-model="confirm"
      content-class="colored"
      max-width="600"
    >
      <v-card>
        <v-card-title class="headline">{{ $root.lang().database.titles.confirm_deletion }}</v-card-title>
        <v-card-text>
          <v-form ref="form" lazy-validation>
            <p>{{ label }}</p>
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
            @click="deletePack"
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
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: false,
    },
    disableDialog: {
      type: Function,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  methods: {
    deletePack() {
      axios
        .delete(`${this.$root.apiURL}/${this.type}/${this.id}`, this.$root.apiOptions)
        .then(() => {
          this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
          this.disableDialog(true);
        })
        .catch((error) => {
          console.error(error);
          this.$root.showSnackBar(err, "error");
          this.disableDialog(true);
        });
    },
  },
};
