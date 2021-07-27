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

        <v-form ref="form" lazy-validation :style="{ 'padding-left': '20px', 'padding-right': '20px' }">
          <v-text-field required clearable v-model="localUser.uuid" label="Minecraft profile UUID"></v-text-field>
          <v-text-field required clearable v-model="localUser.username" label="Website Username"></v-text-field>
        </v-form>

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