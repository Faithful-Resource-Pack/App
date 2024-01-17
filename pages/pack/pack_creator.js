export default {
  name: "pack-creator",
  template: `
    <v-dialog v-model="dialog" content-class="colored" max-width="600">
      <v-card>
        <v-card-title class="headline" v-text="dialogTitle"></v-card-title>
        <v-card-text>
          <v-text-field
            :disabled="!add"
            :color="color"
            persistent-hint
            :hint="'⚠️' + $root.lang().database.hints.texture_id"
            required
            :readonly="add == false"
            v-model="formData.id"
            :label="$root.lang().database.labels.texture_id">
          </v-text-field>
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
    }
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
    };
  },
  methods: {
    send() {
      console.log("PACK DATA SENT")
    }
  },
  computed: {
    dialogTitle() {
      return this.add
        ? this.$root.lang().database.titles.add_pack
        : this.$root.lang().database.titles.change_pack;
    }
  },
};
