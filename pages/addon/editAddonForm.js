const addonForm = () => import('./addonForm.js')

export default {
  name: 'edit-addon-form',
  components: {
    'addon-form': addonForm
  },
  template: `
  <div class="container">
    <h4 class="text-h4 py-4">{{ $root.lang().addons.titles.edit }} </h4>
    <addon-form
      class="pa-0"
      
      :addon-new="false"

      :loading="loading"
      :addon-data="addonData"

      :screen-sources="screenSources"
      :header-source="headerSource"

      v-on:submit="handleSubmit"
      v-on:header="handleHeader"
      v-on:screenshot="handleScreenshot"
     />
  </div>
  `,
  data: function() {
    return {
      addonData: undefined,
      headerSource: undefined,
      screenSources: []
    }
  },
  computed: {
    loading: function() {
      return this.addonData === undefined
    },
    id: function() {
      return this.$route.params.id
    }
  },
  methods: {
    handleSubmit: function(data) {
      console.log('edit submit')
      axios.patch(this.$root.apiURL + '/addons/' + this.id, data, this.$root.apiOptions)
      .then(() => {
        this.$root.showSnackBar('Saved', 'success')
      })
    },
    handleHeader: function(file, remove=false) {
      console.log(file, remove)
      let promise
      if(remove) {
        promise = axios.delete(this.$root.apiURL + '/addons/' + this.id + '/header', this.$root.apiOptions)
      } else {
        const form = new FormData()
        form.set("file", file, file.name)
        promise = axios.post(this.$root.apiURL + '/addons/' + this.id + '/header', form, this.$root.apiOptions)
      }

      promise.then(() => {
        this.getHeader()
        this.$root.showSnackBar('Successfully ' + (remove ? 'removed' : 'uploaded') + ' header image', 'success')
      })
      .catch(err => {
        console.error(err)
        this.$root.showSnackBar(err, 'error')
      })
    },
    getHeader: function() {
      axios({
        method: "GET",
        url: this.$root.apiURL + '/addons/' + this.id + '/files/header',
        ...this.$root.apiOptions,
      })
      .then((res) => {
        const url = res.data + '?t=' + new Date().getTime(); 
        this.headerSource = url; 
      })
      .catch(() => {
        this.headerSource = undefined;
      })
    },  
    handleScreenshot: function(screenshots, index, remove=false) {
      if(Array.isArray(screenshots) && screenshots.length === 0) return

      let promise
      if(remove) {
        promise = axios.delete(this.$root.apiURL + '/addons/' + this.id + '/screenshots/' + index, this.$root.apiOptions)
      } else {
        // add all of them
        const promises = []
        screenshots.forEach(screen => {
          const form = new FormData()
          form.set("file", screen, screen.name)
          promises.push(axios.post(this.$root.apiURL + '/addons/' + this.id + '/screenshots', form, this.$root.apiOptions))
        })
        
        promise = Promise.all(promises)
      }

      promise.then(() => {
        this.getScreens()
        this.$root.showSnackBar('Successfully ' + (remove ? 'removed' : 'uploaded') + ' screenshots', 'success')
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
    this.getHeader()  
    this.getScreens()
    Promise.all([
      axios.get(this.$root.apiURL + '/addons/' + this.$route.params.id, this.$root.apiOptions),
      axios.get(this.$root.apiURL + '/addons/' + this.$route.params.id + '/files/downloads', this.$root.apiOptions)
    ])
    .then(res => {
      let addon_loaded = {
        ...res[0].data,
        downloads: res[1].data 
      }
      delete addon_loaded.slug
      delete addon_loaded.approval
      delete addon_loaded.id

      this.addonData = addon_loaded
    })
  }
}