const addonForm = () => import('./addonForm.js')

export default {
  name: 'new-addon-form',
  components: {
    'addon-form': addonForm
  },
  template: `
  <addon-form newAddon v-on:submit="handleSubmit" v-on:header="handleHeader" v-on:screenshot="handleScreenshot" />
  `,
  data: function() {
    return {
      header: undefined,
      screenshots: []
    }
  },
  methods: {
    handleSubmit: function(data) {
      // 1. Upload 
      axios.post(this.$root.apiURL + '/addons', data, this.$root.apiOptions)
      .then(response => {
        const addon = response.data
        const id = addon.id
        
        const promises = []
        // 2. Upload header and screenshots
        let form
        if(this.header || this.screenshots.length) {
          form = new FormData()
        }

        if(this.header) {
          console.log(this.header)
          form.set("file", this.header, this.header.name)
          promises.push(axios.post(this.$root.apiURL + '/addons/' + id + '/header', form, this.$root.apiOptions))
        }
        if(this.screenshots.length) {
          this.screenshots.forEach(screen => {
            console.log(screen)
            form.set("file", screen, screen.name)
            promises.push(axios.post(this.$root.apiURL + '/addons/' + id + '/screenshots', form, this.$root.apiOptions))
          })
        }

        return Promise.all(promises)
      })
      .then(() => {
        this.$root.showSnackBar(`Saved`, 'Success')
      })
      .catch(err => {
        console.error(err.response.data)
        this.$root.showSnackBar(`${err.message}: ${err.response.data.message}`, 'error')
      })
    },
    handleHeader: function(file) {
      console.log(file)
      this.header = file
    },
    handleScreenshot: function(screenshot, index, remove) {

    }
  }
}