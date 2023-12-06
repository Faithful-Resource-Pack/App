/* global axios */

export default {
	name: "profile-page",
	template: `
  <v-container>
    <div class="text-h4 py-4">
      {{ $root.lang().profile.title }}
    </div>

    <div :class="['my-2 text-h5', {'mx-n3': !$vuetify.breakpoint.mdAndUp }]">
      <v-list :rounded="$vuetify.breakpoint.mdAndUp" class="main-container">

        <v-list-item>
          <v-list-item-avatar>
            <v-img :src="$root.user.avatar" />
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title v-text="$root.user.username"/>
            <v-list-item-subtitle style="font-size: 0.7rem; opacity: 0.8" v-text="$root.user.id"/>
            <div>
              <v-list-item-subtitle v-text="($root.user.roles||[]).join(' | ')"/>
            </div>
          </v-list-item-content>
        </v-list-item>

        <!--
        ================ GENERAL SETTINGS ================
        -->
        <v-list-item>
        <v-row
          :style="{
            'margin-top': '20px',
            'align-items': $vuetify.breakpoint.mdAndUp ? 'flex-start' : 'center',
            'flex-direction': $vuetify.breakpoint.mdAndUp ? 'row' : 'column',
            'justify-content': 'space-between'
          }"
        >
          <v-col v-if="localUser.uuid && localUser.uuid.length == uuidMaxLength" class="col-2" :sm="$vuetify.breakpoint.mdAndUp ? 3 : 2" style="max-width: 250px;">
            <img
              alt="avatar"
              :style="{
                'display': 'block',
                'margin-left': 'auto',
                'margin-right': $vuetify.breakpoint.mdAndUp ? 'inherit' : 'auto',
                'height': '100%'
              }"
              :src="($vuetify.breakpoint.mdAndUp ? 'https://visage.surgeplay.com/full/256/' : 'https://visage.surgeplay.com/head/128/') + localUser.uuid"
            />
          </v-col>
          <v-col :class="'col-' + (localUser.uuid && localUser.uuid.length == uuidMaxLength) ? '10' : '12'" :sm="(localUser.uuid && localUser.uuid.length == uuidMaxLength) ? ($vuetify.breakpoint.mdAndUp ? 9 : 10) : 12" style="max-width: 100%;">
            <v-form ref="form" lazy-validation>
              <div class="text-h6">{{ $root.lang().profile.general.title }}</div>
              <v-row class="height-90 mt-2">
                <v-col>
                  <v-text-field
                    placeholder="aaabbbcc-ddee-1122-3344-zzz555aadd33"
                    :rules="uuidRules"
                    :counter="uuidMaxLength"
                    clearable
                    v-model="localUser.uuid"
                    :label="$root.lang().profile.general.uuid.label"
                    :hint="$root.lang().profile.general.uuid.hint"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                    required
                    :rules="usernameRules"
                    :counter="usernameMaxLength"
                    clearable
                    v-model="localUser.username"
                    :label="$root.lang().profile.general.username.label"
                    :hint="$root.lang().profile.general.username.hint"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-col>
        </v-row>
        </v-list-item>

        <br>

        <!--
        ================ SOCIAL SETTINGS ================
        -->
        <v-list-item>
        <v-row class="mb-2"><v-col>
          <v-form lazy-validation>
            <div class="text-h6">{{ $root.lang().profile.social.title }}</div>
            <template v-if="localUser.media && Object.keys(localUser.media).length">
            <v-row
              v-for="(socialMedia, index) in localUser.media"
              :key="index"
              align="center"
              :class="['mt-0', { 'mb-1': !$vuetify.breakpoint.mdAndUp }]"
            >
              <v-col class="py-0" :cols="$vuetify.breakpoint.mdAndUp ? false : 12">
                <v-text-field
                  clearable
                  style="margin-bottom: 0px; margin-top: 12px"
                  v-model="socialMedia.link"
                  :rules="urlRules"
                  :label="$root.lang().profile.social.edit.label.replace('%s', socialMedia.type)"
                >
                </v-text-field>
              </v-col>
              <v-col class="py-0" :cols="$vuetify.breakpoint.mdAndUp ? false : 12" :style="[{ 'max-width': $vuetify.breakpoint.mdAndUp ? '300px' : 'none' }, 'margin-top: 10px']">
                <v-row align="center">
                  <v-col :style="{ 'max-width': $vuetify.breakpoint.mdAndUp ? '250px' : 'none' }">
                    <v-select
                      :items="media"
                      :label="$root.lang().profile.social.select.label"
                      v-model="socialMedia.type"
                      hide-details
                      solo
                    >
                    </v-select>
                  </v-col>
                  <v-col class="flex-grow-0 flex-shrink-0">
                    <v-btn icon @click="removeSocialMedia(index)" style="margin-right: 8px" elevation="2">
                      <v-icon color="red lighten-1">mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            </template>

            <v-row
              class="mt-2"
              align="center"
            >
              <v-col class="py-0" :cols="$vuetify.breakpoint.mdAndUp ? false : 12">
                <v-text-field
                  clearable
                  :placeholder="$root.lang().profile.social.new.placeholder"
                  :label="$root.lang().profile.social.new.label"
                  style="margin-bottom: 0px; margin-top: 12px"
                  v-model="newMedia.link"
                  :rules="urlAddRules"
                >
                </v-text-field>
              </v-col>
              <v-col class="py-0" :cols="$vuetify.breakpoint.mdAndUp ? false : 12" :style="[{ 'max-width': $vuetify.breakpoint.mdAndUp ? '300px' : 'none' }, 'margin-top: 10px']">
                <v-row align="center">
                  <v-col :style="{ 'max-width': $vuetify.breakpoint.mdAndUp ? '250px' : 'none' }">
                    <v-select
                      :items="media"
                      :label="$root.lang().profile.social.select.label"
                      v-model="newMedia.type"
                      hide-details
                      solo
                    ></v-select>
                  </v-col>
                  <v-col class="flex-grow-0 flex-shrink-0">
                    <v-btn icon @click="addSocialMedia()" :disabled="isMediaOk()" style="margin-right: 8px" elevation="2">
                      <v-icon color="lighten-1">mdi-plus</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-form>
        </v-col></v-row>
        </v-list-item>

        <div :style="{'display': 'flex', 'justify-content': 'center'}">
          <v-btn
            color="primary"
            @click="send"
            :disabled="!everythingIsOk"
          >
            {{ $root.lang().global.btn.save }}
          </v-btn>
        </div>

      </v-list>
    </div>
  </v-container>
  `,
	data() {
		return {
			uuidMaxLength: 36,
			usernameMaxLength: 24,
			everythingIsOk: false,
			newMedia: {
				type: "",
				link: "",
			},
			media: settings.socials,
			urlAddRules: [(u) => this.validForm(this.validURL(u) || u === "", "URL must be valid.")],
			urlRules: [(u) => this.validForm(this.validURL(u), "URL must be valid.")],
			uuidRules: [
				(u) =>
					this.validForm(
						(u && u.length === this.uuidMaxLength) || !u,
						"The UUID needs to be 36 characters long.",
					),
			],
			usernameRules: [
				(u) => this.validForm(!!u, "Username is required."),
				(u) =>
					this.validForm(
						u && typeof u === "string" && u.trim().length > 0,
						`Username cannot be empty`,
					),
				(u) =>
					this.validForm(
						u && u.length <= this.usernameMaxLength,
						`Username must be less than ${this.usernameMaxLength} characters.`,
					),
			],
			localUser: {},
		};
	},
	methods: {
		isMediaOk: function () {
			if (this.newMedia.type !== "" && this.newMedia.link !== "") return false;
			return true;
		},
		validURL: function (str) {
			const pattern = new RegExp(
				"^(https?:\\/\\/)?" + // protocol
					"((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
					"((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
					"(\\:\\d+)?(\\/[-a-z\\d%_.~+@]*)*" + // port and path
					"(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
					"(\\#[-a-z\\d_]*)?$",
				"i",
			); // fragment locator
			return !!pattern.test(str);
		},
		removeSocialMedia: function (index) {
			this.localUser.media.splice(index, 1);
		},
		addSocialMedia: function () {
			if (!this.localUser.media) this.localUser.media = [];

			this.localUser.media.push({
				type: this.newMedia.type,
				link: this.newMedia.link,
			});

			this.newMedia = {
				type: "",
				link: "",
			};
		},
		validForm: function (boolResult, sentence) {
			if (boolResult) {
				this.everythingIsOk = true;
				return true;
			}

			this.everythingIsOk = false;
			return sentence.toString();
		},
		send: function () {
			if (!this.$root.isUserLogged) return;

			// fix if new user
			const data = {
				uuid: this.localUser.uuid || "",
				username: this.localUser.username || "",
				media: this.localUser.media || [],
			};

			axios
				.post(`${this.$root.apiURL}/users/profile/`, data, this.$root.apiOptions)
				.then(() => {
					this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
				})
				.catch((error) => {
					console.error(error);
					this.$root.showSnackBar(error, "error");
				});
		},
		getUserInfo: function () {
			if (!this.$root.isUserLogged) return;

			axios
				.get(`${this.$root.apiURL}/users/profile/`, this.$root.apiOptions)
				.then((res) => {
					this.localUser = res.data;

					// fix if new user or empty user
					this.localUser.uuid = this.localUser.uuid || "";
					this.localUser.username = this.localUser.username || "";
					this.localUser.media = this.localUser.media || [];
				})
				.catch((err) => {
					console.error(err);
					this.$root.showSnackBar(err, "error");
				});
		},
		update: function () {
			this.getUserInfo();
		},
	},
	mounted: function () {
		this.$root.addAccessTokenListener(this.update);
	},
};
