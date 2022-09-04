/* global axios */

const contributionForm = () => import("./contributionForm.js")

export default {
  name: 'contribution-modal',
  components: {
    'contribution-form': contributionForm
  },
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
    },
    multiple: {
      required: false,
      type: Boolean,
      default: false
    },
  },
  template: `
    <v-dialog
      v-model="opened"
      width="800"
    >      
      <v-card>
        <v-card-title class="headline" v-text="$root.lang().database.titles.contributions"></v-card-title>
        <v-card-text>
          <v-row>
            <v-col class="flex-grow-0 flex-shrink-1" v-if="selectedFormIndex !== undefined">
              <v-date-picker
                v-model="forms[selectedFormIndex].date"
                :locale="$root.langBCP47"
                :max="(new Date()).toISOString().substr(0, 10)"
                flat
                scrollable
                show-adjacent-months
              ></v-date-picker>
            </v-col>
            <v-col :class="['flex-grow-1 flex-shrink-0', {'px-0': multiple }]">
              <template v-if="multiple">
                <div>
                  <v-expansion-panels
                    v-model="panel"
                    class="mb-2"
                    :disabled="forms.length < 2"
                  >
                    <v-expansion-panel
                      v-for="(form,form_index) in forms"
                      :key="form.formId"
                    >
                      <v-expansion-panel-header
                        style="min-height: 24px"
                        disable-icon-rotate
                      >
                        {{ panelLabels[form_index] }}
                      
                        <template v-slot:actions>
                          <v-icon color="error" @click="() => removeForm(form_index)">
                            mdi-delete
                          </v-icon>
                        </template>
                      </v-expansion-panel-header>
                      <v-expansion-panel-content>
                        <contribution-form v-model="form" :contributors="contributors"></contribution-form>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                  </v-expansion-panels>
                  <v-btn block @click="addNewForm">{{ $root.lang('global.btn.add') }}</v-btn>
                </div>
              </template>
              <template v-else>
                <contribution-form v-model="forms[0]" :contributors="contributors"></contribution-form>
              </template>
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
  computed: {
    panelLabels: function() {
      return this.multiple ? this.forms.map(f => `#${
        f.texture
      } | ${
        f.pack
      } | ${
        moment(new Date(f.date)).format('ll')
      }`) : ['']
    },
    selectedFormIndex: function() {
      return this.multiple ? this.panel : 0
    }
  },
  data () {
    return {
      opened: false,
      closeOnSubmit: true,
      forms: [{}],
      packs: undefined,
      lastId: 0,
      panel: 0,
    }
  },
  methods: {
    addNewForm: function() {
      // create new form
      let form = this.defaultValue(this.packs)

      // match last opened form
      if(this.panel !== undefined) {
        // make a copy
        form = JSON.parse(JSON.stringify(this.forms[this.panel]))
      }

      // add form
      this.forms.push(form)

      // open last expansion panel
      this.panel = this.forms.length - 1
    },
    open: function(inputData = undefined, packs, closeOnSubmit = true) {
      this.packs = packs
      this.opened = true
      if (inputData !== undefined) {
        // set forms as array
        this.forms = [Object.assign({}, this.defaultValue(packs), inputData)]

        // override default date with given date
        const da = new Date(this.forms[0].date)
        this.forms[0].date = (new Date(da - (da).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)
      } else {
        // get one empty form
        this.forms = [this.defaultValue(packs)]

        // open first panel
        this.panel = 0
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

      const data = this.forms.map(f => {
        delete f.formId
        return f
      })

      const res = Object.assign({}, this.multiple ? data : data[0])
      res.date = (new Date(res.date)).getTime()
      this.onSubmit(res)
    },
    defaultValue: function (packs) {
      this.lastId++;

      return {
        date: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        packs: packs,
        pack: packs ? packs[0] : null,
        texture: 0,
        authors: [],
        formId: this.lastId
      }
    },
    removeForm: function(form_index) {
      // set next panel opened
      this.panel = (form_index+1) % this.forms.length

      this.forms.splice(form_index, 1)
      this.$forceUpdate()
    }
  },
  created: function() {
    this.form = this.defaultValue()
  },
}
