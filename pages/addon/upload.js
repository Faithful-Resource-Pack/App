export default {
  name: "upload",
  props: {
    multiple: {
      type: Boolean,
      required: false,
      default: false
    },
    onError: {
      type: Function,
      required: false,
      default: function () { }
    },
    label: {
      type: String,
      required: false,
      default: 'Drop your file(s) here, or click to select them.'
    },
    dense: {
      type: Boolean,
      required: false,
      default: false,
    },
    verify: {
      type: Function,
      required: false,
      default: function () { return true }
    },
    prependIcon: {
      type: String,
      required: false,
      default: 'mdi-cloud-upload'
    },
    accept: {
      type: String,
      required: false,
      default: '*'
    },
    value: {
      required: true
    },
    smallChips: {
      type: Boolean,
      required: false,
      default: false
    },
    counter: {
      type: [Boolean, Number, String],
      required: false,
      default: false
    },
    showSize: {
      type: Boolean,
      required: false,
      default: false
    },
    rules: {
      type: Array,
      required: false,
      default: function () { return [] }
    }
  },
  template: `
    <div class="upload-file-input mt-3">
      <v-card
        flat
        @drop.prevent="onDrop($event)"
        @dragover.prevent="dragover = true"
        @dragenter.prevent="dragover = true"
        @dragleave.prevent="dragover = false"
        :class="{ 'dragover': dragover, 'error': isError }"
      >
        <v-card-text :class="{'pa-2': dense }">
          <v-row v-if="!dense">
            <v-col @click.stop="openDialog" style="opacity: 0;" :class="['upload-reset-button flex-grow-0 flex-shrink-0', { 'clear': multiple ? value.length > 0 : !!value }]">
              <v-icon id="upload-button">mdi-close</v-icon>
            </v-col><v-col class="pa-0">
              <v-row class="d-flex flex-column" dense align="center" justify="center" @click.stop="openDialog">
                <v-icon size="60">{{ prependIcon }}</v-icon>
                <p v-text="label" class="upload-label"></p>
              </v-row>
            </v-col><v-col @click.stop="reset" :class="['upload-reset-button flex-grow-0 flex-shrink-0', { 'clear': multiple ? value.length > 0 : !!value }]">
              <v-icon id="upload-button" :class="{'error--text': isError}">mdi-close</v-icon>
            </v-col>
          </v-row>
          <v-row no-gutter v-else>
            <v-col @click.stop="openDialog">
              <div :class="{'my-n1': valueChips.length > 0 }">
                <v-icon :class="['mr-2', {'my-1': valueChips.length > 0 }]">{{ prependIcon }}</v-icon>
                <span v-if="valueChips.length > 0">
                  <v-chip
                    v-for="file in valueChips" :key="file.key"
                    :small="smallChips"
                    class="my-1 ml-2 mr-0"
                    label
                  >{{ file.name }}</v-chip>
                </span>
                <span v-else v-text="label" class="upload-label"></span>
              </div>
            </v-col><v-col @click.stop="reset" :class="['upload-reset-button flex-grow-0 flex-shrink-0', { 'clear': multiple ? value.length > 0 : !!value }]">
              <v-icon id="upload-button" :class="{'error--text': isError}">mdi-close</v-icon>
            </v-col>
          </v-row>
          <v-row v-if="!dense && valueChips.length > 0" class="mt-0 pt-2">
            <v-chip
              v-for="file in valueChips" :key="file.key"
              :small="smallChips"
              class="mt-0 mb-2 ml-2 mr-0"
              label
            >
              {{ file.name }}
            </v-chip>
          </v-row>
        </v-card-text>
      </v-card>
      <div v-if="counterText || showSize || errorMessage" :class="['mt-2', {'error--text': isError}]">
        <v-row no-gutters dense>
        <v-col class="v-messages">{{ errorMessage }}</v-col>
        <v-col class="v-counter flex-grow-0 flex-shrink-0" style="white-space: nowrap;"><span>{{ counterText }}{{ totalSizeText }}</span></v-col>
        </v-row>
      </div>
    </div>
  `,
  data() {
    return {
      dragover: false
    }
  },
  computed: {
    fileList: function () {
      let arr
      if (!this.multiple) arr = [this.value]
      else arr = this.value

      let result = []
      arr.forEach(file => {
        if (file && file.contructor && file.constructor.name === 'Object' && 'name' in file && 'size' in file && 'lastModified' in file) {
          result.push(file)
        }
      })

      return result
    },
    valueChips: function () {
      let result = []
      this.fileList.forEach(file => {
        let sizePrepend = this.showSize ? ` (${this.bytesToText(file.size)})` : ''

        result.push({
          name: `${file.name}${sizePrepend}`,
          key: 'file-' + file.name + '-' + file.size + '-' + file.lastModified
        })
      })

      return result
    },
    counterValue: function () {
      let counter = this.counter

      if (typeof counter === 'string') {
        let tmp = parseFloat(counter)

        if (isNaN(tmp) || tmp % 1 !== 0) {
          if (['false', 'true'].includes(counter)) counter = counter == 'true'
        } else {
          counter = tmp
        }
      }

      return counter
    },
    counterText: function () {
      let counter = this.counterValue

      if (typeof counter === 'number') return counter % 1 === 0 && counter > 0 ? `${this.valueChips.length} / ${counter}` : ''
      else if (typeof counter === 'boolean') return counter ? `${this.valueChips.length} file${this.valueChips.length > 1 ? 's' : ''}` : ''

      return ''
    },
    totalSizeText: function () {
      if (!this.counter || this.smallChips) return ''
      return this.fileList.length ? ` (${this.bytesToText(this.fileList.reduce((acc, cur) => acc + cur.size, 0))} in total)` : ''
    },
    errorReason: function () {
      let i = 0
      while (i < this.rules.length) {
        let type = typeof this.rules[i]
        if (type === 'string') return true
        if (type === 'boolean') if (this.rules[i] === false) return true
        if (type === 'function') {
          let u = 0, res
          while (u < this.fileList.length) {
            res = this.rules[i](this.fileList[u])
            if (res === false) return true
            if (typeof res === 'string') return [true, res]
            ++u
          }
        }
        ++i
      }

      let counter = this.counterValue
      if (typeof counter === 'number' && this.fileList.length !== 0 && this.fileList.length !== counter) return true

      return false
    },
    isError: function () {
      return typeof this.errorReason === 'boolean' ? this.errorReason : this.errorReason[0]
    },
    errorMessage: function () {
      return typeof Array.isArray(this.errorReason) && this.errorReason.length > 1 ? this.errorReason[1] : ''
    }
  },
  methods: {
    onDrop(e) {
      this.dragover = false

      // multiple
      const files = [...e.dataTransfer.files]
      this.addFiles(files)
    },
    addFiles(files) {
      try {
        if (!this.multiple && files.length > 1) throw new Error('Only one file can be uploaded at a time..')

        let verified = true, i = 0
        while (i < files.length && verified) {
          verified = this.verify(files[0])
          ++i
        }

        if (!verified) throw new Error('Incorrect file type')
      } catch (error) {
        this.onError({
          message: error.message,
          colour: 'error'
        })
        return
      }

      if (!this.multiple) {
        if (files.length == 1) [
          this.setValue(files[0]) // single replace
        ]
      } else {
        this.setValue([...this.value, ...files]) // else add
      }
    },
    setValue(val) {
      this.$emit('input', val)
      if (this.value != val) {
        this.$emit('change')
      }
    },
    reset() {
      this.setValue(this.multiple ? [] : '')
    },
    selectFile(contentType, multiple) {
      return new Promise(resolve => {
        let input = document.createElement('input')
        input.type = 'file'
        input.multiple = multiple
        input.accept = contentType

        if (this.value != undefined)
          input.value = this.value

        input.onchange = () => {
          let files = Array.from(input.files)

          resolve(files)
        };

        input.click();
      });
    },
    openDialog: function () {
      this.selectFile(this.accept, this.multiple)
        .then(files => {
          this.addFiles(files)
        })
    },
    bytesToText: function (size) {
      const units = ['B', 'kB', 'MB', 'GB', 'TB']
      let unit_index = 0
      while (size > 1000) {
        size = size / 1000
        ++unit_index
      }
      return `${size} ${units[Math.min(units.length - 1, unit_index)]}`
    }
  }
}