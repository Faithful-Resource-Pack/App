const jsonEditor = () => import("./jsonObjectEditor.js");
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
  name: "json-boolean-editor",
  components: {
    jsonEditor,
    jsonAddEditor,
  },
  template: `
<div>
  <v-checkbox v-model="newValue" dense hide-details />
</div>`,
  props: {
    value: {
      required: true,
    },
    parent: {
      required: false,
      default: undefined,
    },
  },
  data() {
    return {
      newValue: "",
    };
  },
  watch: {
    newValue(n, o) {
      if (n === o) return;

      this.$emit("input", n);
    },
    value: {
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
  beforeMount() {
    this.newValue = this.value;
  },
};
