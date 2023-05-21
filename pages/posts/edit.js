const Form = () => import('./form.js')

export default {
  name: 'edit-post-form',
  components: {
    Form
  },
  template: `
  <div class="container">
    <h4 class="text-h4 py-4">{{ $root.lang('posts.form.title.edit') }} <span id="addon-id">#{{this.id}}</span></h4>
    <Form
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
      loading: true,
      error: undefined
    }
  },
  computed: {
    id: function () {
      return this.$route.params.id
    }
  },
  methods: {
    handleSubmit: function (data) {
      delete data.id

      axios.put(`${this.$root.apiURL}/posts/${this.id}`, data, this.$root.apiOptions)
        .then(() => {
          this.$root.showSnackBar('Saved', 'success')
        })
        .catch(err => {
          this.$root.showSnackBar(err, 'error', 3000)
        })
    },
    handleReset: function () {
      if (this.loading) return
      this.$refs.form.setFormData(this.loadedData)
    }
  },
  created: function () {
    axios.get(`${this.$root.apiURL}/posts/${this.id}`, this.$root.apiOptions)
      .then(res => {
        this.loadedData = res.data
      })
      .catch(err => {
        this.$root.showSnackBar(err, 'error', 3000)
        this.error = err
      })
      .finally(() => {
        this.loading = false
      })
  }
}