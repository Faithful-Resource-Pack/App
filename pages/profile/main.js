/* global axios, Vue */

export default {
  name: 'profile-page',
  template: `
  <v-container>
    <div class="text-h4 py-4">
      Profile
    </div>

    <div class="my-2 text-h5">
      <v-list rounded two-line color="rgba(255, 255, 255, 0.08)" style="background-color: rgba(255,255,255,.05)">

        <v-list-item>
          <v-list-item-avatar>
            <v-img :src="$root.user.avatar" />
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title v-text="$root.user.username"></v-list-item-title>

            <v-list-item-subtitle v-text="($root.user.roles||[]).join(' | ')"></v-list-item-subtitle>
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
              <div class="text-h6">General</div>
              <v-list class="profileList">
                <v-row>
                  <v-list-item class="height-90">
                    <v-list-item-content>
                      <v-col>
                      <v-text-field
                        placeholder="aaabbbcc-ddee-1122-3344-zzz555aadd33" 
                        :rules="uuidRules" 
                        :counter="uuidMaxLength" 
                        clearable 
                        v-model="localUser.uuid" 
                        label="Minecraft profile UUID" 
                        hint="Your skin will be displayed on your pages"
                      ></v-text-field>
                      </v-col>
                    </v-list-item-content>
                  </v-list-item>
                </v-row>
                <v-row>
                  <v-list-item class="height-90">
                    <v-list-item-content>
                      <v-col>
                      <v-text-field 
                        required 
                        :rules="usernameRules" 
                        :counter="usernameMaxLength" 
                        clearable 
                        v-model="localUser.username" 
                        label="Website Username" 
                        hint="Your username will be displayed and used on the Website for contributions, add-ons and more..."
                      ></v-text-field>
                      </v-col>
                    </v-list-item-content>
                  </v-list-item>
                </v-row>
              </v-list>
            </v-form>
          </v-col>
        </v-row>
        </v-list-item>

        <br>
        
        <!--
        ================ SOCIAL SETTINGS ================
        -->
        <v-list-item>
        <v-row><v-col>
          <v-form lazy-validation>
            <div class="text-h6">Social links</div>
            <v-list class="profileList">
              <v-row v-if="localUser.media && Object.keys(localUser.media).length">
                <v-list-item
                  v-for="(socialMedia, index) in localUser.media"
                  :key="index"
                  class="height-90"
                >
                  <v-list-item-content>
                    <v-col>
                      <v-text-field
                        clearable
                        style="margin-bottom: 10px"
                        v-model="socialMedia.link"
                        :rules="urlRules"
                        :label="'Edit ' + socialMedia.type + ' URL'"
                      >
                      </v-text-field>
                    </v-col>
                  </v-list-item-content>
                  <v-col
                    style="max-width: 250px; max-height: 48px; padding: 0; padding-left: 20px"
                  >
                    <v-select
                      :items="media"
                      label="Select media"
                      v-model="socialMedia.type"
                      solo
                    >
                    </v-select>
                  </v-col>
                  <v-list-item-action>
                    <v-btn icon @click="removeSocialMedia(index)" style="margin-right: 8px">
                      <v-icon color="red lighten-1">mdi-delete</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-row>

              <v-row>
                <v-list-item class="height-90">
                  <v-list-item-content>
                    <v-col>
                      <v-text-field
                        clearable
                        placeholder="https://www.example.com/"
                        label="New social media:"
                        style="margin-bottom: 10px"
                        v-model="newMedia.link"
                        :rules="urlAddRules"
                      >
                      </v-text-field>
                    </v-col>
                  </v-list-item-content>
                  <v-col
                    style="max-width: 250px; max-height: 48px; padding: 0; padding-left: 20px"
                  >
                    <v-select
                      :items="media"
                      label="Select media"
                      v-model="newMedia.type"
                      solo
                    >
                    </v-select>
                  </v-col>
                  <v-list-item-action>
                    <v-btn icon @click="addSocialMedia()" :disabled="isMediaOk()" style="margin-right: 8px">
                      <v-icon color="white lighten-1">mdi-plus</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-row>
            </v-list>
          </v-form>
        </v-col></v-row>
        </v-list-item>

        <div :style="{'display': 'flex', 'justify-content': 'center'}">
          <v-btn
            @click="send"
            :disabled="!everythingIsOk"
          >
            Save
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
        type: '',
        link: ''
      },
      media: [
        "CurseForge", "GitHub", "Patreon", "Paypal", "Planet Minecraft", "PSN", "Reddit", "Steam", "Twitter", "Website", "Xbox", "YouTube", "Other"
      ],
      urlAddRules: [
        u => this.validForm(this.validURL(u) || u == '', 'URL must be valid.')
      ],
      urlRules: [
        u => this.validForm(this.validURL(u), 'URL must be valid.')
      ],
      uuidRules: [
        u => this.validForm((u && (u.length == this.uuidMaxLength)) || !u, 'The UUID needs to be 36 characters long.')
      ],
      usernameRules: [
        u => this.validForm(!!u, 'Username is required.'),
        u => this.validForm(u && u.length <= this.usernameMaxLength, `Username must be less than ${this.usernameMaxLength} characters.`)
      ],
      localUser: {}
    }
  },
  methods: {
    isMediaOk: function() {
      if (this.newMedia.type != '' && this.newMedia.link != '') return false
      return true
    },
    validURL: function(str) {
      var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
      return !!pattern.test(str);
    },
    removeSocialMedia: function(index) {
      this.localUser.media.splice(index, 1)
    },
    addSocialMedia: function() {
      if (!this.localUser.media) this.localUser.media = new Array()

      this.localUser.media.push({
        type: this.newMedia.type,
        link: this.newMedia.link
      })

      this.newMedia = {
        type: '',
        link: ''
      }
    },
    validForm: function(boolResult, sentence) {
      if (boolResult) {
        this.everythingIsOk = true
        return true
      }
      
      this.everythingIsOk = false
      return sentence.toString()
    },
    send: function() {
      if (!this.$root.isUserLogged) return

      let data = JSON.parse(JSON.stringify(this.localUser))
      data.access_token = this.$root.user.access_token

      axios.post('/profile/set', data)
      .then(() => {
        this.$root.showSnackBar('Ended successfully', 'success')
      })
      .catch(error => {
        console.error(error)
        this.$root.showSnackBar(`${error.message}: ${error.response.data.error}`, 'error')
      })

    },
    getUserInfo: function() {
      if (!this.$root.isUserLogged) return

      let data = JSON.parse(JSON.stringify(this.$root.user))
      data.token = this.$root.user.access_token

      axios.post('/profile/get', data)
      .then((res) => {
        this.localUser = res.data[0]
      })
      .catch(err => {
        console.error(err)
        this.$root.showSnackBar(`${err.message}: ${err.response.data.error}`, 'error')
      })
    },
    update: function() {
      this.getUserInfo()
    }
  },
  mounted: function() {
    this.update()
  }
}