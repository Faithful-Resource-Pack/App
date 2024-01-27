<template>
<div :class="['json-object-editor', { 'json-editor-bordered': !root }]">
  <div class="json-editor-header" @click="toggled = !toggled">
    <span
      v-if="!root"
      class="json-editor-toggle"
      v-text="toggled ? '-' : '+'"
    ></span><span v-if="!root" class="json-editor-title">array</span>
  </div>
  <div v-show="toggled" class="json-editor-content">
    <div v-for="(val, index) in values" :key="val + index" class="d-flex">
      <div class="json-object-key">
        <span
          class="json-editor-delete"
          @click="() => deleteItem(index)"
        >
          delete
        </span>
      </div>
      <json-editor class="flex-grow-1" v-model="values[index]" :parent="value" />
    </div>
    <json-add-editor @clicked="onClickChild" />
  </div>
</div></template>

<script>
const jsonEditor = () => import("./jsonEditor.js");
const jsonAddEditor = () => import("./jsonAddEditor.js");

function deepEqual(x, y) {
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
}

export default {
  name: "json-object-editor",
  components: {
    jsonEditor,
    jsonAddEditor,
  },
  
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
      values: [],
      toggled: true,
    };
  },
  methods: {
    deleteItem(index) {
      this.values.splice(index, 1);
    },
    extractKeysAndValues() {
      this.values = this.value;
    },
    onClickChild(obj) {
      this.values.push(obj);
    },
    /**
     * Constructs object with key and values
     * @returns {Object} final object constructed
     */
    construct() {
      if (!this.values.length) throw new Error("Not an array");

      return this.values;
    },
  },
  watch: {
    value: {
      handler(n, o) {
        if (o === undefined) return;
        if (deepEqual(n, o)) return;
        // console.log('object value', n, o, this.values, this.value);

        if (Array.isArray(n)) {
          this.extractKeysAndValues();
        }
      },
      immediate: true,
      deep: true,
    },
    values: {
      handler(n, o) {
        if (o === undefined) return;
        if (deepEqual(n, o)) return;
        // console.log('values', n, o, this.values, this.value);

        this.$emit("input", this.construct());
      },
      deep: true,
    },
  },
  created() {},
  beforeMount() {
    if (!Array.isArray(this.value)) throw new Error("Value not an object");
    this.extractKeysAndValues();
  },
};
</script>