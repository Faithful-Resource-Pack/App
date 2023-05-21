const Form = () => import('./form.js')

export default {
  name: 'new-addon-form',
  components: {
    'addon-form': Form
  },
  template: `
  <div class="container">
    <h4 class="text-h4 py-4">{{ $root.lang().addons.titles.submit }} </h4>
    <addon-form
      class="pa-0"
      ref="form"
      :is-new="false"
      :incoming-data="loadedData"
      v-on:reset="handleReset"
      v-on:submit="handleSubmit"
    />
  </div>
  `,
  data: function () {
    return {
      loadedData: undefined,
      isMounted: false
    }
  },
  methods: {
    emptyData: function () {
      return {
        title: "",
        permalink: "",
        date: moment(new Date()).format("DD-MM-YYYY").toString(),
        headerImg: "",
        description: "",
        published: false,
        downloads: {},
        changelog: {}
      }
    },
    handleReset: function () {
      this.loadedData = this.emptyData()
    },
    handleSubmit: function () {
      axios.post(`${this.$root.apiURL}/posts/`, data, this.$root.apiOptions)
        .then(() => {
          this.$root.showSnackBar('Saved', 'success')
          this.$router.push('/posts/list')
        })
        .catch(err => {
          this.$root.showSnackBar(err, 'error', 3000)
        })
    }
  },
  created: function () {
    this.loadedData = this.emptyData()
  }
}