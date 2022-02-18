const addonForm = () => import('./addonForm.js')

export default {
  name: 'edit-addon-form',
  components: {
    'addon-form': addonForm
  },
  template: `
    <addon-form
      :addon-new="false"
      addon-data="addonData"
      :loading="loading"
      v-on:submit="handleSubmit"
      v-on:header="handleHeader"
      v-on:screenshot="handleScreenshot"
      screen-sources="screenSources" />
  `,
  data: function() {
    return {
      addonData: undefined,
      screenSources: []
    }
  },
  computed: {
    loading: function() {
      return this.addonData !== undefined
    },
    id: function() {
      return this.$route.params.id
    }
  },
  methods: {
    handleSubmit: function(data) {
      axios.patch(this.$root.apiURL + '/addons/', data, this.$root.apiOptions)
      .then(() => {
        this.$root.showSnackBar('Saved', 'success')
      })
    },
    handleHeader: function(file, remove=false) {
      let promise
      if(remove) {
        promise = axios.delete(this.$root.apiURL + '/addons/' + this.id + '/header')
      } else {
        form = new FormData()
        form.set("file", file, file.name)
        promise = axios.post(this.$root.apiURL + '/addons/' + this.id + '/header', form, this.$root.apiOptions)
      }

      promise.then(() => {
        this.$root.showSnackBar('Saved', 'success')
      })
      .catch(err => {
        console.error(err)
        this.$root.showSnackBar(err, 'error')
      })
    },
    handleScreenshot: function(screenshots, index, remove=false) {
      let promise
      if(remove) {
        promise = axios.delete(this.$root.apiURL + '/addons/' + this.id + '/screenshots/' + index)
      } else {
        form = new FormData()

        // add all of them
        promises = []
        screenshots.forEach(screen => {
          form.set("file", screen, screen.name)
          promises.push(axios.post(this.$root.apiURL + '/addons/' + id + '/screenshots', form, this.$root.apiOptions))
        })
        Promise.all(promises)
        .then(() => {
          //get all of them
          return axios.getScreens()
        })
      }

      promise.then(() => {
        this.$root.showSnackBar('Saved', 'success')
      })
      .catch(err => {
        console.error(err)
        this.$root.showSnackBar(err, 'error')
      })
    },
    getScreens: function() {
      axios.get(this.$root.apiURL + '/addons/' + (this.id || this.$route.params.id) + '/files/screenshots', this.$root.apiOptions)
      .then(res => {
        this.screenSources = res.data
      })
    }
  },
  created: function() {
    this.getScreens()
    axios.get(this.$root.apiURL + '/addons/' + this.$route.params.id, this.$root.apiOptions)
    .then(res => {
      this.addonData = res.data
    })
  }
}