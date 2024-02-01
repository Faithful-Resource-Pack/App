<template>
<div>
  <i>null</i>
</div></template>

<script>
const jsonEditor = () => import("./jsonObjectEditor.vue");
const jsonAddEditor = () => import("./jsonAddEditor.vue");

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
  name: "json-null-editor",

  props: {
    value: {
      required: true,
    },
    parent: {
      required: false,
      default: undefined,
    },
  },
};
</script>