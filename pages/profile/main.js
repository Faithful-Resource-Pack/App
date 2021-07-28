/* global axios, Vue */

export default {
  name: 'profile-page',
  template: `
  <v-container>
    <div class="text-h4 py-4">
      Your Profile
    </div>

    <div class="my-2 text-h5">
      <v-list two-line color="rgba(255, 255, 255, 0.08)" >

        <v-list-item>
          <v-list-item-avatar>
            <v-img :src="$root.user.avatar" />
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title v-text="$root.user.username"></v-list-item-title>

            <v-list-item-subtitle v-text="($root.user.roles||[]).join(', ')"></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-row
          :style="{
            'align-items': 'center',
            'flex-direction': $vuetify.breakpoint.mdAndUp ? 'row' : 'column'
          }"
        >
          <v-col v-if="localUser.uuid" class="col-2" :sm="$vuetify.breakpoint.mdAndUp ? 3 : 2" style="max-width: 100%;">
            <img alt="avatar" style="display: block; margin-left: auto; margin-right: auto; height: 100%;" :src="($vuetify.breakpoint.mdAndUp ? 'https://visage.surgeplay.com/full/256/' : 'https://visage.surgeplay.com/head/128/') + localUser.uuid" />
          </v-col>
          <v-col :class="'col-' + localUser.uuid ? '10' : '12'" :sm="localUser.uuid ? ($vuetify.breakpoint.mdAndUp ? 9 : 10) : 12" style="max-width: 100%;">
            <v-form ref="form" lazy-validation :style="{ 'padding-right': localUser.uuid ? 'auto' : '20px', 'padding-left': localUser.uuid ? 'auto' : '20px' }">
              <v-text-field style="margin-bottom: 50px" required clearable v-model="localUser.uuid" label="Minecraft profile UUID" hint="Your skin will be displayed on your pages"></v-text-field>
              <v-text-field required clearable v-model="localUser.username" label="Website Username"></v-text-field>
            </v-form>
          </v-col>
        </v-row>

        <div 
          :style="{ 'display': 'flex', 'justify-content': 'center' }"
        >
          <v-btn @click="send" >
            Save
          </v-btn>
        </div>

      </v-list>
    </div>
  </v-container>
  `,
  data() {
    return {
      localUser: {}
    }
  },
  methods: {
    send: function() {
      if (!this.$root.isUserLogged) return

      const data = JSON.parse(JSON.stringify(this.localUser))
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

      const data = JSON.parse(JSON.stringify(this.$root.user))

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