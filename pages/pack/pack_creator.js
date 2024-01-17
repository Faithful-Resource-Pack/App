export default {
  name: "pack-creator",
  template: `
    <v-dialog v-model="dialog" content-class="colored" max-width="600">
      <v-card>
        <v-card-title class="headline" v-text="dialogTitle"></v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field
              :color="color"
              :hint="add ? $root.lang().database.hints.pack_id_creation : $root.lang().database.hints.pack_id_editing"
              v-model="formData.id"
              :label="$root.lang().database.labels.pack_id">
            </v-text-field>
            <v-text-field :color="color" required clearable v-model="formData.name" :label="$root.lang().database.labels.pack_name"></v-text-field>
            <v-select :color="color" :item-color="color" required multiple deletable-chips small-chips v-model="formData.tags" :items="tags" :label="$root.lang().database.labels.pack_tags"></v-select>
            <v-text-field :color="color" required type="number" v-model="formData.resolution" :label="$root.lang().database.labels.pack_resolution"></v-text-field>
            <v-text-field :color="color" required :rules="downloadLinkRules" clearable v-model="formData.logo" :label="$root.lang().database.labels.pack_logo"></v-text-field>
            <v-btn v-if="Object.keys(formData.submission).length" block :style="{ 'margin-top': '10px' }" color="secondary" @click="editSubmissionModal()">
              {{ $root.lang().database.labels.edit_submission }}<v-icon right>mdi-pencil</v-icon>
            </v-btn>
            <v-btn v-else block :style="{ 'margin-top': '10px' }" color="secondary" @click="newSubmissionModal()">
              {{ $root.lang().database.labels.new_submission }}<v-icon right>mdi-plus</v-icon>
            </v-btn>

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
            {{ $root.lang().global.btn.save }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  `,
  props: {
    dialog: {
      type: Boolean,
      required: true,
    },
    disableDialog: {
      type: Function,
      required: true,
    },
    color: {
      type: String,
      required: false,
      default: "primary",
    },
    add: {
      type: Boolean,
      required: false,
      default: false,
    },
    data: {
      type: Object,
      required: false,
    },
    tags: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      modalOpened: false,
      formData: {
        id: "",
        name: "",
        tags: [],
        logo: "",
        resolution: 0,
        github: {},
        submission: {},
      },
      downloadLinkRules: [(u) => this.validURL(u) || this.$root.lang().database.labels.invalid_url],
    };
  },
  methods: {
    getSubmission(packID) {
      axios
        .get(`${this.$root.apiURL}/submissions/${packID}`)
        // set to empty object if no submission exists
        .catch(() => ({ data: {} }))
        .then((res) => {
          this.formData.submission = res.data;
        });
    },
    validURL(str) {
      const pattern = new RegExp(
        "^(https?:\\/\\/)?" + // protocol
          "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
          "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
          "(\\:\\d+)?(\\/[-a-z\\d%_.~+@]*)*" + // port and path
          "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
          "(\\#[-a-z\\d_]*)?$",
        "i",
      ); // fragment locator
      return pattern.test(str);
    },
    send() {
      console.log("PACK DATA SENT");
    },
  },
  computed: {
    dialogTitle() {
      return this.add
        ? this.$root.lang().database.titles.add_pack
        : this.$root.lang().database.titles.change_pack;
    },
  },
  watch: {
    dialog(newValue) {
      if (newValue === true) {
        Vue.nextTick(() => {
          if (this.add) this.$refs.form.reset();

          if (!this.add) {
            this.formData.id = this.data.id;
            this.formData.name = this.data.name;
            this.formData.tags = this.data.tags;
            this.formData.logo = this.data.logo;
            this.formData.resolution = this.data.resolution;
            this.formData.github = this.data.github;
            this.getSubmission(this.data.id);
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
