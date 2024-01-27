<template>
  <v-card flat class="dashboard-card">
  <v-card-title class="d-flex align-center pb-2">
    <span class="title text-h5"> {{ title }} </span>
    <v-spacer />
    <v-btn icon v-if="go_to" :to="go_to" :disabled="!can_go_to" class="rounded-lg">
      <v-icon v-if="go_to" :disabled="!can_go_to" large>
        mdi-chevron-right
      </v-icon>
    </v-btn>
  </v-card-title>

  <slot></slot>
</v-card>
</template>

<script>
export default {
  name: "dashboard-card",
  props: {
    title: {
      required: false,
      type: String,
      default: "",
    },
    go_to: {
      required: false,
      type: String,
      default: undefined,
    },
    can_go_to: {
      required: false,
      type: Boolean,
      default: false,
    },
  },
  
};
</script>