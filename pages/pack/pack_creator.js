const submissionCreator = () => import("./submission_creator.js");
const packRemoveConfirm = () => import("./pack_remove_confirm.js");

export default {
  name: "pack-creator",
  components: {
    submissionCreator,
    packRemoveConfirm,
  },
  template: `
    <v-dialog v-model="dialog" content-class="colored" max-width="600">
      <submission-creator
        :color="color"
        :dialog="submissionOpen"
        :disableDialog="disableSubmission"
        :data="submissionData"
        :add="submissionAdd"
        :first="add"
        @submissionFinished="addSubmissionData"
      >
      </submission-creator>
      <pack-remove-confirm
        type="submissions"
        :confirm="remove.confirm"
        :disableDialog="function() { remove.confirm = false; getSubmission(data.id); }"
        :id="remove.id"
        :name="remove.name">
      >
      </pack-remove-confirm>
      <v-card>
        <v-card-title class="headline" v-text="dialogTitle"></v-card-title>
        <v-card-text>
          <v-form ref="form" lazy-validation>
            <v-text-field
              :color="color"
              :hint="add ? $root.lang().database.hints.pack_id_creation : $root.lang().database.hints.pack_id_editing"
              v-model="formData.id"
              :label="$root.lang().database.labels.pack_id">
            </v-text-field>
            <v-text-field :color="color" required clearable v-model="formData.name" :label="$root.lang().database.labels.pack_name"></v-text-field>
            <v-combobox
              :color="color"
              :item-color="color"
              required
              multiple
              deletable-chips
              small-chips
              v-model="formData.tags"
              :items="tags"
              :label="$root.lang().database.labels.pack_tags">
            </v-combobox>
            <v-text-field :color="color" required type="number" v-model="formData.resolution" :label="$root.lang().database.labels.pack_resolution"></v-text-field>
            <v-text-field :color="color" :rules="downloadLinkRules" clearable v-model="formData.logo" :label="$root.lang().database.labels.pack_logo"></v-text-field>
            <h2 class="title">{{ $root.lang().database.subtitles.github }}</h2>
            <p class="text-caption">{{ $root.lang().database.hints.github_required }}</p>
            <div v-for="(edition, index) in editions" :key="index">
              <p class="text-body-1">{{ toTitleCase(edition) }}</p>
              <v-row>
                <v-col>
                  <v-text-field
                    :color="color"
                    :label="$root.lang().database.labels.github_org"
                    v-model="(formData.github[edition] || createNewGithub(edition)).org">
                  </v-text-field>
                </v-col>
                <v-col>
                  <v-text-field
                    :color="color"
                    :label="$root.lang().database.labels.github_repo"
                    v-model="(formData.github[edition] || createNewGithub(edition)).repo">
                  </v-text-field>
                </v-col>
              </v-row>
            </div>
            <h2 class="title">{{ $root.lang().database.subtitles.submissions }}</h2>
            <div v-if="Object.keys(formData.submission).length">
              <v-container>
                <v-row>
                  <v-col>
                    <v-btn block color="secondary" @click="submissionModal(formData, false)">
                      {{ $root.lang().database.labels.edit_submission }}<v-icon right>mdi-pencil</v-icon>
                    </v-btn>
                  </v-col>
                  <v-col cols="2">
                    <v-btn block color="error darken-1" @click="deleteSubmission(formData)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-container>
            </div>
            <v-btn v-else block :style="{ 'margin-top': '10px' }" color="secondary" @click="submissionModal(formData, true)">
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
        id: null,
        name: null,
        tags: [],
        logo: null,
        resolution: null,
        github: {},
        submission: {},
      },
      editions: [],
      downloadLinkRules: [(u) => this.validURL(u) || this.$root.lang().database.labels.invalid_url],
      submissionOpen: false,
      submissionData: {},
      submissionAdd: false,
      remove: {
        id: "",
        name: "",
        confirm: false,
      },
    };
  },
  methods: {
    submissionModal(data, add) {
      this.submissionOpen = true;
      this.submissionAdd = add;
      if (add)
        this.submissionData = {
          id: data.id,
        };
      else this.submissionData = data.submission;
    },
    disableSubmission() {
      this.submissionOpen = false;
      // clear form
      this.submissionData = {};
      if (!this.add) this.getSubmission(this.formData.id);
      this.$forceUpdate();
    },
    getSubmission(packID) {
      axios
        .get(`${this.$root.apiURL}/submissions/${packID}`)
        // set to empty object if no submission exists
        .catch(() => ({ data: {} }))
        .then((res) => {
          this.formData.submission = res.data;
        });
    },
    deleteSubmission() {
      if (this.add) {
        // reset directly, no need for confirmation modal
        this.formData.submission = {};
        return;
      }

      this.remove.id = this.data.id;
      this.remove.name = "submission data for " + this.data.name;
      this.remove.confirm = true;
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
    toTitleCase(val) {
      return val[0].toUpperCase() + val.slice(1);
    },
    addSubmissionData(data) {
      if (!this.submissionAdd) return;
      this.formData.submission = data || {};
    },
    send() {
      const data = { ...this.formData };

      // if user doesn't specify id on pack creation (falsy), the API will assume it
      if (this.add) {
        if (!data.submission.id) delete data.submission.id;
        if (!data.id) delete data.id;
      }

      // stop accidental casting
      if (!data.logo) data.logo = null;

      Object.entries(data.github).forEach(([k, v]) => {
        if (!v.repo || !v.org) delete data.github[k];
      });

      if (!Object.keys(data.github).length)
        return this.$root.showSnackBar(
          "At least one GitHub repository needs to be present.",
          "error",
        );

      // only add submission property if filled out
      if (
        !this.submissionAdd || // if changing submission, already done separately
        !data.submission ||
        !Object.keys(data.submission ?? {}).length
      )
        delete data.submission;

      const requestPromise =
        this.submissionAdd || this.add
          ? axios.post(`${this.$root.apiURL}/packs`, data, this.$root.apiOptions)
          : axios.put(`${this.$root.apiURL}/packs/${data.id}`, data, this.$root.apiOptions);

      requestPromise
        .then(() => {
          this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
          this.disableDialog(true);
        })
        .catch((err) => {
          console.error(err);
          this.$root.showSnackBar(err, "error");
        });
    },
    createNewGithub(edition) {
      this.formData.github[edition] = {
        org: null,
        repo: null,
      };
      return this.formData.github[edition];
    },
  },
  created() {
    axios.get(`${this.$root.apiURL}/textures/editions`).then((res) => {
      this.editions = res.data;
    });
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
            for (const [k, v] of Object.entries(this.data)) {
              if (this.formData[k] === undefined) continue;
              this.formData[k] = v;
            }
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
