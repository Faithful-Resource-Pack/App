/* global axios */

export default {
  name: 'contribution-modal',
  props: {
    contributors: {
      required: true,
      type: Array
    },
    onCancel: {
      required: false,
      type: Function,
      default: function() {}
    },
    onSubmit: {
      required: false,
      type: Function,
      default: function() {}
    }
  },
  template: `
    <v-dialog
      v-model="opened"
      persistent
      width="600"
    >      
      <v-card>
        <v-card-title class="headline" v-text="$root.lang().database.titles.contributions"></v-card-title>
        <v-card-text>
          <v-row>
            <v-col>
              <v-date-picker
                v-model="form.date"
                :locale="$root.langBCP47"
                :max="(new Date()).toISOString().substr(0, 10)"
                flat
                scrollable
                show-adjacent-months
              ></v-date-picker>
            </v-col>
            <v-col>
              <h3>{{ $root.lang().database.subtitles.resolution }}</h3>
              <v-select
                required
                :items="res"
                v-model="form.res"></v-select>
              <h3>{{ $root.lang().database.labels.texture_id }}</h3>
              <v-text-field
                required
                v-model="form.textureID" />
              <h3>{{ $root.lang().database.titles.contributors }}</h3>
              <v-autocomplete
                v-model="form.contributors"
                :items="contributors"
                :loading="contributors.length == 0"
                item-text="username"
                item-value="id"
                :label="$root.lang().database.labels.one_contributor"
                multiple
                chips
              >
                <!-- SELECTED THINGY -->
                <template v-slot:selection="data">
                  <v-chip
                    :key="data.item.id"
                    v-bind="data.attrs"
                    :input-value="data.selected"
                    :disabled="data.disabled"
                    close
                    @click:close="remove(data.item.id)"
                  >
                    <v-avatar
                      :class="{ accent: data.item.uuid == undefined, 'text--white': true }"
                      left
                    >
                      <template v-if="data.item.uuid != undefined">
                        <v-img eager
                          :src="'https://visage.surgeplay.com/face/24/' + data.item.uuid"
                          :alt="data.item.username.slice(0, 1).toUpperCase()"
                        />
                      </template>
                      <template v-else>
                        {{ data.item.username.slice(0, 1) }}
                      </template>
                    </v-avatar>
                    {{ data.item.username }}
                  </v-chip>
                </template>

                <!-- LIST ITEM PART -->
                <template v-slot:item="data">
                  <template v-if="data.item && data.item.contructor && data.item.constructor.name === 'String'">
                    <v-list-item-content v-text="data.item"></v-list-item-content>
                  </template>
                  <template v-else>
                    <v-list-item-content>
                      <v-list-item-title v-text="data.item.username"></v-list-item-title>
                      <v-list-item-subtitle v-html="data.item.occurences + ' contribution' + (data.item.occurences > 1 ? 's' : '')"></v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-avatar :style="{ 'background': data.item.uuid ? 'transparent' : '#4e4e4e' }">
                      <template v-if="data.item.uuid">
                        <v-img eager :src="'https://visage.surgeplay.com/head/48/' + data.item.uuid" />
                      </template>
                      <div v-else>{{ data.item.username.slice(0, 1).toUpperCase() }}</div>
                    </v-list-item-avatar>
                  </template>
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="red darken-1"
            text
            @click="closeAndCancel"
          >
            {{ $root.lang().global.btn.cancel }}
          </v-btn>
          <v-btn
            color="darken-1"
            text
            @click="closeOrAndSubmit"
          >
            {{ $root.lang().global.btn.save }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  `,
  data () {
    return {
      opened: false,
      closeOnSubmit: true,
      res: settings.compliance_resolutions,
      form: {},
    }
  },
  methods: {
    open: function(inputData = undefined, closeOnSubmit = true) {
      this.opened = true
      console.log(inputData)
      if(inputData !== undefined) {
        this.form = Object.assign({}, this.defaultValue(), inputData)
        const da = new Date(this.form.date)
        this.form.date = (new Date(da - (da).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)
      } else {
        this.form = this.defaultValue()
      }
      this.closeOnSubmit = !!closeOnSubmit
    },
    close: function() {
      this.opened = false
    },
    closeAndCancel: function() {
      this.close()
      this.onCancel()
    },
    closeOrAndSubmit: function() {
      this.opened = !this.closeOnSubmit

      const res = Object.assign({}, this.form)
      res.date = (new Date(res.date)).getTime()
      this.onSubmit(res)
    },
    defaultValue: function() {
      return {
        date: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        res: settings.compliance_resolutions[0],
        textureID: '0',
        contributors: []
      }
    },
    remove (id) {
      const index = this.form.contributors.indexOf(id)
      if (index >= 0) this.form.contributors.splice(index, 1)
    }
  },
  created: function() {
    this.form = this.defaultValue()
  }
}