export default {
	name: "deny-popup",
	template: `
  <v-dialog
    v-model="reasonPopup"
    max-width="600"
  >
    <v-card>

      <v-card-title class="headline" v-text="''" />

      <v-card-text>
        <v-text-field
          required
          v-model="denyReason"
          :label="$root.lang().review.deny_window.label"
          :rules="reasonRules"
        ></v-text-field>
      </v-card-text>

      <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="darken-1"
            text
            @click="closePopup(false, denyReason)"
          >
            {{ $root.lang().global.btn.cancel }}
          </v-btn>
          <v-btn
            color="red"
            text
            :disabled="!denyReason || (denyReason && denyReason.length == 0)"
            @click="closePopup(true, denyReason)"
          >
            {{ $root.lang().global.btn.ok }}
          </v-btn>
        </v-card-actions>
    </v-card>

  </v-dialog>
  `,
	props: {
		reasonPopup: {
			type: Boolean,
			required: true,
		},
		closePopup: {
			type: Function,
			required: true,
		},
	},
	data() {
		return {
			denyReason: "",
			reasonRules: [(u) => !u || u?.length > 0 || this.$root.lang().review.deny_window.rule],
		};
	},
};
