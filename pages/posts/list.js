/* global axios */

const Confirm = () => import('./confirm.js')

export default {
  name: 'posts-page',
  components: {
    Confirm
  },
  template: `
  <v-container>
    <div>
      <v-row dense class="align-center py-4">
        <v-col cols="12" class="col-sm"><div class="text-h4">
        {{ $root.lang("posts.titles.list") }}
        </div></v-col>
        <v-col class="flex-grow-0 flex-shrink-0"><v-btn
          color="primary"
          href="/#/posts/new"
        >
          {{ $root.lang("posts.titles.new") }}
          <v-icon
            right
          >
            mdi-text-box-plus
          </v-icon>
        </v-btn></v-col>
      </v-row>
      <v-progress-circular
        v-if="loading"
        indeterminate
      />
    </div>

    <div v-if="loading == false && data.length == 0">
      {{ $root.lang().global.no_results }}
    </div>
    <div v-else class="my-2 text-h5">
      <v-row>
        <v-col 
          :cols="$vuetify.breakpoint.mdAndUp ? 4 : ($vuetify.breakpoint.smAndUp ? 6 : 12)" 
          v-for="post in sortedData"
          style="align-items: stretch; display: flex;"
        >
          <v-card style="background-color: rgba(255,255,255,.05); width: 100%; display: flex; flex-direction: column">
            <div>
              <v-img
                style="border-radius: 5px"
                :src="post.headerImg ? post.headerImg : 'https://database.faithfulpack.net/images/branding/backgrounds/forest.png'"
                :aspect-ratio="16/9" v-on:error="() => {failed[post.id] = true; $forceUpdate(); return false }">
                <template v-slot:placeholder>
                  <v-row
                    class="fill-height ma-0"
                    align="center"
                    justify="center"
                    style="background-color: rgba(255,255,255, 0.1);"
                  >
                    <v-icon
                      v-if="failed[post.id]"
                      x-large>mdi-image-off</v-icon>
                    <v-progress-circular
                      v-else
                      indeterminate
                      color="grey lighten-5"
                    />
                  </v-row>
                </template>
              </v-img>
            </div>
            <v-card-title v-text="post.title" style="word-break: break-word" />
            <v-card-subtitle class="text-truncate" v-text="decodeURI(post.permalink)" :title="decodeURI(post.permalink)" />
            <v-card-text style="flex-grow: 1">
              <v-badge
                dot
                inline
                :color="(post.published === true || post.published === 'true') ? 'green' : 'red'"
              />
              {{ $root.lang('posts.status.' + ((post.published === true || post.published === 'true') ? 'published' : 'unpublished')) }}
              <v-btn
                v-if="post.published === true || post.published === 'true'"
                color="blue"
                :href="'https://www.faithfulpack.net' + post.permalink"
                target="_blank"
                icon
                small
              >
                <v-icon small>mdi-open-in-new</v-icon>
              </v-btn>
            </v-card-text>

            <v-card-actions style="justify-content: flex-end;">
              <v-btn
                text
                :href="'/#/posts/edit/' + post.id"
              >
                {{ $root.lang().global.btn.edit }}
              </v-btn>
              <v-btn
                color="red"
                text
                @click="askConfirm(post.id, post.headerImg)"
              >
                {{ $root.lang().global.btn.delete }}
              </v-btn>
            </v-card-actions>
          </v-card>
              
        </v-col>
      </v-row>
    </div>

    <Confirm
      ref="confirm"
      :data="confirmData"
      :title="$root.lang('posts.confirm.title')"
      :message="confirmMessage"
      v-on:cancel="() => {}"
      v-on:submit="deletePost"
    />
  </v-container>
  `,
  data() {
    return {
      data: {},
      confirmData: undefined,
      confirmUrl: undefined,
      loading: true,
      failed: {},
      timestamp: new Date().getTime()
    }
  },
  computed: {
    sortedData: function () {
      return Object.values(this.data).sort(this.sortDates)
    },
    confirmMessage: function () {
      return this.$root.lang('posts.confirm.message')
        + (this.confirmUrl ? `<a href="${this.confirmUrl}" target="_blank">${this.confirmUrl}</a>` : '')
    }
  },
  methods: {
    askConfirm: function (id, url) {
      this.confirmUrl = url
      console.log(this.$refs, this.$refs.confirm)
      this.$refs.confirm.openDialog(id)
    },
    deletePost: function (id) {
      axios.delete(`${this.$root.apiURL}/posts/${id}`, this.$root.apiOptions)
        .then(() => {
          this.$root.showSnackBar(this.$root.lang('global.ends_success'), 'success')
          this.loadData()
        })
        .catch(err => this.$root.showSnackBar(err, 'error'))
    },
    loadData: function () {
      this.loading = true
      axios
        .get(`${this.$root.apiURL}/posts/raw`, this.$root.apiOptions)
        .then(res => {
          this.data = res.data
          this.loading = false
          this.$forceUpdate()
        })
        .catch(function (err) {
          console.error(err)
        })
    },
    parseDate: function (d) {
      const parts = d.split('-')
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
    },
    sortDates: function (a, b) {
      const a_date = this.parseDate(a.date)
      const b_date = this.parseDate(b.date)
      return b_date.getTime() - a_date.getTime()
    },
    update: function () {
      this.loadData()
      this.$forceUpdate()
    }
  },
  mounted() {
    this.loadData()
  }
}
