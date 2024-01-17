const jsonEditor = () => import("./jsonEditor.js");
const jsonAddEditor = () => import("./jsonAddEditor.js");

var deepEqual = function (x, y) {
  if (x === y) {
    return true;
  } else if (typeof x == "object" && x != null && typeof y == "object" && y != null) {
    if (Object.keys(x).length != Object.keys(y).length) return false;

    for (var prop in x) {
      if (y.hasOwnProperty(prop)) {
        if (!deepEqual(x[prop], y[prop])) return false;
      } else return false;
    }

    return true;
  } else return false;
};

export default {
  name: "json-object-editor",
  components: {
    jsonEditor,
    jsonAddEditor,
  },
  template: `
<div :class="['json-object-editor', { 'json-editor-bordered': !root, 'json-editor-root': root }]">
  <div class="json-editor-header" @click="toggled = !toggled">
    <span
      v-if="!root"
      class="json-editor-toggle"
      v-text="toggled ? '-' : '+'"
    ></span><span v-if="!root" class="json-editor-title">object</span>
  </div>
  <div v-show="toggled" class="json-editor-content">
    <div v-for="(val, index) in values" :key="val + index" class="d-flex">
      <div class="json-object-key">
        <span
          class="json-editor-delete"
          @click="() => deleteItem(index)"
        >
          delete
        </span><input
          class="json-editor-input json-object-key-input"
          type="string"
          v-model="keys[index]"
          placeholder="key"
          @keydown="resize(index)"
          :ref="'input' + index"
        /><div
          :ref="'hide' + index"
          class="json-editor-hide"
          v-text="keys[index]"
        ></div>
      </div>
      <json-editor class="flex-grow-1" v-model="values[index]" :parent="value" />
    </div>
    <json-add-editor @clicked="onClickChild" />
  </div>
</div>`,
  props: {
    value: {
      required: true,
    },
    parent: {
      required: false,
      default: undefined,
    },
    root: {
      required: false,
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      keys: [],
      values: [],
      toggled: true,
    };
  },
  methods: {
    resize(index) {
      const input = this.$refs["input" + index][0];
      const text = this.$refs["hide" + index][0];

      this.$nextTick(() => {
        const width = text.offsetWidth;
        input.style.width = width + 10 + "px";
      });
    },
    deleteItem(index) {
      this.keys.splice(index, 1);
      this.values.splice(index, 1);
    },
    extractKeysAndValues() {
      this.keys = Object.keys(this.value);
      this.values = Object.values(this.value);
    },
    onClickChild(obj) {
      this.keys.push("");
      this.values.push(obj);
    },
    /**
     * Constructs object with key and values
     * @returns {Object} final object constructed
     */
    construct() {
      if (this.keys.length !== this.values.length)
        throw new Error("Keys and values length different");
      const result = {};

      this.keys.forEach((k, i) => {
        result[k] = this.values[i];
      });

      return result;
    },
  },
  watch: {
    value: {
      handler(n, o) {
        if (o === undefined) return;
        if (deepEqual(n, o)) return;
        // console.log('object value', n, o, this.keys, this.values, this.value);

        if (typeof n === "object") {
          this.extractKeysAndValues();
        }
      },
      immediate: true,
      deep: true,
    },
    keys: {
      handler(n, o) {
        this.$nextTick(() => {
          for (let i = 0; i < this.keys.length; ++i) {
            this.resize(i);
          }
        });

        if (o === undefined) return;
        if (deepEqual(n, o)) return;
        if (this.keys.length !== this.values.length) return;
        // console.log('keys', n, o, this.keys, this.values, this.value);

        this.$emit("input", this.construct());
      },
      deep: true,
    },
    values: {
      handler(n, o) {
        if (o === undefined) return;
        if (deepEqual(n, o)) return;
        if (this.keys.length !== this.values.length) return;
        // console.log('values', n, o, this.keys, this.values, this.value);

        this.$emit("input", this.construct());
      },
      deep: true,
    },
  },
  created() {},
  beforeMount() {
    if (typeof this.value !== "object") throw new Error("Value not an object");
    this.extractKeysAndValues();
  },
};
