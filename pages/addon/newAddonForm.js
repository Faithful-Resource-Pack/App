const addonForm = () => import('./addonForm.js')

export default {
  name: 'new-addon-form',
  components: {
    'addon-form': addonForm
  },
  template: `
  <div class="container">
    <h4 class="text-h4 py-4">{{ $root.lang().addons.titles.submit }} </h4>
    <addon-form
      class="pa-0"

      addon-new
      
      v-on:submit="handleSubmit"
      v-on:header="handleHeader"
      v-on:screenshot="handleScreenshot"
    />
  </div>
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
      let id
      axios.post(this.$root.apiURL + '/addons', data, this.$root.apiOptions)
      .then(response => {
        const addon = response.data
        id = addon.id
        
        const promises = []
        // 2. Upload header and screenshots
        let form
        if(this.header || this.screenshots.length) {
          form = new FormData()
        }

        if(this.header) {
          form.set("file", this.header, this.header.name)
          promises.push(axios.post(this.$root.apiURL + '/addons/' + id + '/header', form, this.$root.apiOptions))
        }
        if(this.screenshots.length) {
          this.screenshots.forEach(screen => {
            form.set("file", screen, screen.name)
            promises.push(axios.post(this.$root.apiURL + '/addons/' + id + '/screenshots', form, this.$root.apiOptions))
          })
        }

        return Promise.all(promises)
      })
      .then(() => {
        this.$root.showSnackBar('Saved', 'success')
        this.$router.push('/addons/submissions')
      })
      .catch(err => {
        const message = err.response ? err.response.data.message : String(err)
        console.error(err.response ? err.response.data : message)
        this.$root.showSnackBar(`${err.message}: ${message}`, 'error')

        // delete what is left of addon
        // if we have id then we at least successfully created the file
        if(id)
          axios.delete(this.$root.apiURL + '/addons/' + id, this.$root.apiOptions)
      })
    },
    handleHeader: function(file, remove=false) {
      this.header = remove ? undefined : file
    },
    handleScreenshot: function(screenshots, index, remove=false) {
      if(remove) {
        this.screenshots.slice(index, 1)
        console.log(this.screenshots);
      } else {
        this.screenshots = screenshots
      }
    }
  }
}