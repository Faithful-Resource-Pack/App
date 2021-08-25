export default {
  name: `deny-popup`,
  template: 
  `
  <v-dialog
    v-model="reasonPopup"
    persistent
    max-width="600"
  >
    <v-card>

      <v-card-title class="headline" v-text="''" />

      <v-card-text>
        <v-text-field 
          required 
          v-model="reason" 
          label="Write a reason..."
          :rules="reasonRules"
        ></v-text-field>
      </v-card-text>

      <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="darken-1"
            text
            @click="cleanUp('close')"
          >
            Cancel
          </v-btn>
          <v-btn
            color="red"
            text
            :disabled="!reason || (reason?.length == 0)"
            @click="cleanUp('validate')"
          >
            OK
          </v-btn>
        </v-card-actions>
    </v-card>

  </v-dialog>
  `,
  props: {
    reasonPopup: {
      type: Boolean,
      required: true
    },
    closePopup: {
      type: Function,
      required: true,
    },
    validPopup: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      reason: undefined,
      reasonRules: [
        u => (!u || (u?.length > 0)) || 'Any reason needs to be given'
      ]
    }
  },
  methods: {
    cleanUp: function(type) {
      if (type == 'validate') this.validPopup(this.reason)
      if (type == 'close') this.closePopup()

      this.reason = undefined
    }
  }
}