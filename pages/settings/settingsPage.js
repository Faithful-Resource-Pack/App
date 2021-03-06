/* global axios, Vue, Prism */
const JSONEditor = () => import('./jsonEditor/jsonEditor.js')

export default {
  name: 'settings-page',
  components: {
    'json-editor': JSONEditor
  },
  template: `
<v-container>
  <h2>{{ $root.lang().settings.title }}</h2>
  <div class="my-2">
    <v-btn color="primary" :disabled="jsonIsNotValid" block append-icon v-on:click="save">
      {{ $root.lang().global.btn.save }} <v-icon small>mdi-content-save</v-icon>
    </v-btn>
  </div>
  <v-card class="mb-2">
    <v-expansion-panels flat v-model="panels">
      <v-expansion-panel disabled>
        <v-expansion-panel-header>
          {{ $root.lang().settings.label.edit_editor }}
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <json-editor v-model="json" root />
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header>
          {{ $root.lang().settings.label.edit_raw }}
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <prism-editor
            style="max-height: 600px"
            class="ma-0 my-editor mb-2"
            v-model="jsonText"
            :highlight="highlighter"
            line-numbers
          />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
</v-container>
  `,
  data: function() {
    return {
      panels: 1,
      jsonText: '{}',
      json: {}
    }
  },
  computed: {
    jsonIsNotValid: function() {
      try {
        const stringParsed = JSON.parse(this.jsonText)
        return false
      } catch (_ignored) {
        console.error(_ignored);
      }
      return true
    }
  },
  methods: {
    highlighter (code) {
      return Prism.highlight(code, Prism.languages.js, 'json')
    },
    save () {
      axios.post(this.$root.apiURL + '/settings/raw', this.json, {
        'headers': {
          discord: this.$root.user.access_token
        }
      })
      .then(() => {
        this.$root.showSnackBar(this.$root.lang().global.ends_success, 'success')
      })
      .catch(err => {
        console.error(err)
        this.$root.showSnackBar(`${err.message}: ${err.response.data.error}`, 'error')
      })
    }
  },
  watch: {
    json(n, o) {
      //* update if content different
      const newStringified = JSON.stringify(n, null, 2)
      if(newStringified !== JSON.stringify(o, null, 2)) {
        //* update if text content is updated : new line, new space, the text must not be adapted if same content
        if(newStringified !== JSON.stringify(JSON.parse(this.jsonText), null, 2)) {
          this.jsonText = newStringified
        }
      }
    },
    jsonText(n, o) {
      try {
        const parsed = JSON.parse(n)
        this.json = parsed
      } catch (_ignore) {}
    }
  },
  created: function() {
    axios.get(this.$root.apiURL + '/settings/raw', {
      headers: {
        Accept: 'application/json',
        discord: this.$root.user.access_token
      }
    })
    .then((res) => {
      this.json = res.data
    })
    .catch(err => {
      console.error(err)
      this.$root.showSnackBar(`${err.message}: ${err.response ? err.response.data.error : err.message}`, 'error')
    })
  }
}