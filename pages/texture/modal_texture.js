/* global axios, Vue */

const useModal = () => import("./modal_use.js");
const removeConfirm = () => import("./remove-confirm.js");

export default {
  name: "texture-modal",
  components: {
    useModal,
    removeConfirm,
  },
  template: `
    <v-dialog
      v-model="modalOpened"
      content-class="colored"
      max-width="600"
    >
      <use-modal
        :color="color"
        :subDialog="subDialogOpen"
        :disableSubDialog="disableSubDialog"
        :add="subDialogAdd"
        :textureID="formData.id"
        :usesLength="Object.keys(formData.uses).length"
        :data="subDialogData">
      </use-modal>
      <remove-confirm
        type="use"
        :confirm="remove.confirm"
        :disableDialog="closeAndUpdate"
        :data="remove.data">
      </remove-confirm>

      <v-card>
        <v-card-title class="headline" v-text="dialogTitle"></v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field :disabled="!add" :color="color" persistent-hint :hint="'⚠️' + $root.lang().database.hints.texture_id" required :readonly="add == false" v-model="formData.id" :label="$root.lang().database.labels.texture_id"></v-text-field>
            <v-text-field :color="color" required clearable v-model="formData.name" :label="$root.lang().database.labels.texture_name"></v-text-field>
            <v-combobox :color="color" :item-color="color" required multiple deletable-chips small-chips v-model="formData.tags" :items="tags" :label="$root.lang().database.labels.texture_tags"></v-combobox>

            <h2 class="title">{{ $root.lang().database.subtitles.uses }}</h2>
            <v-list v-if="Object.keys(formData.uses).length" :label="$root.lang().database.labels.texture_uses">
              <v-list-item
                class="list-item-inline"
                v-for="(use, index) in formData.uses"
                :key="index"
              >
                <v-list-item-avatar tile :class="[color, textColor]" :style="{ 'padding': '0 10px 0 10px', 'border-radius': '4px !important', width: 'auto' }" >#{{ index }}</v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title>
                    <v-list-item style="display: inline; padding: 0 0 0 5px;">
                      <template v-if="use.name">{{ use.name }}</template>
                      <template v-else><i>{{ $root.lang().database.labels.nameless }}</i></template>
                    </v-list-item>
                    <v-list-item-subtitle style="display: block; padding: 0 0 0 5px;"  v-text="use.edition"></v-list-item-subtitle>
                  </v-list-item-title>
                </v-list-item-content>

                <v-list-item-action class="merged">
                  <v-btn icon @click="openSubDialog(use, false)">
                    <v-icon color="lighten-1">mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon @click="askRemoveUse(use)">
                    <v-icon color="red lighten-1">mdi-delete</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
            <div v-else>{{ $root.lang().database.labels.no_use_found }}</div>

            <v-btn block :style="{ 'margin-top': '10px' }" color="secondary" @click="openSubDialog(null, true)">{{ $root.lang().database.labels.add_new_use }} <v-icon right>mdi-plus</v-icon></v-btn>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="red darken-1"
            text
            @click="onCancel"
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
    value: {
      type: Boolean,
      required: true,
    },
    disableDialog: {
      type: Function,
      required: true,
    },
    add: {
      type: Boolean,
      required: false,
      default: false,
    },
    data: {
      type: Object,
      required: true,
    },
    tags: {
      type: Array,
      required: false,
      default() {
        return [];
      },
    },
    color: {
      type: String,
      required: false,
      default: "primary",
    },
    textColor: {
      type: String,
      required: false,
      default: "",
    },
  },
  data() {
    return {
      modalOpened: false,
      formData: {
        name: "",
        tags: [],
        id: "",
        uses: {},
      },
      subDialogOpen: false,
      subDialogData: {},
      subDialogAdd: false,
      remove: {
        confirm: false,
        data: {},
      },
    };
  },
  computed: {
    dialogTitle() {
      return this.add
        ? this.$root.lang().database.titles.add_texture
        : this.$root.lang().database.titles.change_texture;
    },
  },
  methods: {
    openSubDialog(data, add) {
      this.subDialogOpen = true;
      this.subDialogAdd = add;

      if (add) {
        let texture_id = String(this.formData.id);
        let use_ids = Object.keys(this.formData.uses);
        let use_letters = use_ids.map((uid) => uid.replace(texture_id, "")[0]);
        let max_letter = use_letters.reduce((acc, cur) => (acc < cur ? cur : acc), "a");
        let next_letter = String.fromCharCode(max_letter.charCodeAt(0) + 1);
        let next_id = texture_id + next_letter;
        // Autofill use id
        this.subDialogData = { id: next_id };
      } else {
        this.subDialogData = data;
      }
    },
    disableSubDialog() {
      this.subDialogOpen = false;
      this.getUses(this.formData.id);
      this.$forceUpdate();
    },
    closeAndUpdate() {
      this.remove.confirm = false;
      this.getUses(this.formData.id);
      this.$forceUpdate();
    },
    send() {
      if (!this.$root.isUserLogged) return;

      let promise = Promise.resolve();
      if (this.add) {
        // this modal is NEVER used to add textures but anyway
        const data = JSON.parse(JSON.stringify(this.formData));
        data.token = this.$root.user.access_token;
        promise = axios.post("/textures/add", data);
      } else {
        const data = {
          name: this.formData.name,
          tags: this.formData.tags,
        };
        promise = axios.put(
          `${this.$root.apiURL}/textures/${this.formData.id}`,
          data,
          this.$root.apiOptions,
        );
      }

      promise
        .then(() => {
          this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
          this.disableDialog(true);
        })
        .catch((err) => {
          console.error(err);
          this.$root.showSnackBar(err, "error");
        });
    },
    getUses(textureID) {
      axios
        .get(`${this.$root.apiURL}/textures/${textureID}/uses`, this.$root.apiOptions)
        .then((res) => {
          const temp = res.data;
          this.formData.uses = {};

          for (let i = 0; i < temp.length; i++) {
            this.formData.uses[temp[i].id] = temp[i];
          }
        })
        .catch((err) => {
          console.error(err);
        });
    },
    askRemoveUse(data) {
      this.remove.data = data;
      this.remove.confirm = true;
    },
    onCancel() {
      this.modalOpened = false;
      this.disableDialog();
    },
  },
  watch: {
    value(newValue) {
      this.modalOpened = newValue;
    },
    modalOpened(newValue) {
      if (newValue === true) {
        Vue.nextTick(() => {
          if (this.add) this.$refs.form.reset();

          if (!this.add) {
            this.formData.name = this.data.name;
            this.formData.tags = this.data.tags;
            this.formData.id = this.data.id;
            this.getUses(this.data.id);
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
