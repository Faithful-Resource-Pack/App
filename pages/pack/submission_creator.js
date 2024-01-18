export default {
  name: "submission-creator",
  template: `
    <v-dialog
      v-model="dialog"
      content-class="colored"
      max-width="800"
    >
      <v-card>
        <v-card-title class="headline" v-text="submissionTitle"></v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-text-field
              :color="color"
              v-if="!add"
              persistent-hint
              :hint="$root.lang().database.hints.pack_id_editing"
              v-model="formData.id"
              :label="$root.lang().database.labels.pack_id" />
            <v-select
              :color="color"
              :item-color="color"
              required
              :hint="$root.lang().database.hints.pack_reference"
              v-model="formData.reference"
              :items="computePacks"
              item-text="label"
              item-value="value"
              :label="$root.lang().database.labels.submission_reference">
            </v-select>
            <v-container>
              <v-row><v-checkbox :color="color" v-model="formData.council_enabled" :label="$root.lang().database.labels.council_enabled">
              </v-checkbox></v-row>
              <v-row><v-range></v-range></v-row>
            </v-container>
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
          :disabled="!formValid"
        >
          {{ $root.lang().global.btn.save }}
        </v-btn>
      </v-card-actions>
      </v-card>
    </v-dialog>
  `,
  props: {
    color: {
      type: String,
      required: false,
      default: "primary",
    },
    dialog: {
      type: Boolean,
      required: true,
    },
    disableDialog: {
      type: Function,
      required: true,
    },
    data: {
      type: Object,
      required: false,
    },
    add: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      formValid: false,
      formData: {
        id: "",
        reference: "",
        council_enabled: "",
        channels: {
          submit: "",
          council: "",
          results: "",
        },
        time_to_council: "",
        time_to_results: "",
        contributor_role: "",
      },
      packs: [],
    };
  },
  methods: {
    send() {
      this.$emit("submissionFinished", this.formData);
      this.disableDialog();
    },
  },
  computed: {
    submissionTitle() {
      return this.add
        ? this.$root.lang().database.titles.add_submission
        : this.$root.lang().database.titles.edit_submission;
    },
    computePacks() {
      return this.packs.map((p) => ({ label: p.name, value: p.id }));
    },
  },
  created() {
    axios.get(`${this.$root.apiURL}/packs/raw`).then((res) => {
      this.packs = Object.values(res.data);
    });
  },
  watch: {
    dialog(newValue) {
      if (newValue === true) {
        Vue.nextTick(() => {
          if (!this.add) {
            this.formData.id = this.data.id;
            this.formData.reference = this.data.reference;
            this.formData.channels = this.data.channels;
            this.formData.council_enabled = this.data.council_enabled;
            this.formData.time_to_council = this.data.time_to_council;
            this.formData.time_to_results = this.data.time_to_results;
            this.formData.contributor_role = this.data.contributor_role;
          } else {
            this.$refs.form.reset();
            if (this.data.id) this.formData.id = this.data.id;
          }
        });
      } else {
        // Fixes bug where click outside changes dialog to false but not dialogOpen to false
        this.disableDialog();
      }
      this.$emit("input", newValue);
    },
  },
};
