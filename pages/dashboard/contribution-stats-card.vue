<template>
<dashboard-card
  id="contribution-stats-card"
  :title="$root.lang('global.tabs.database.subtabs.contributions') || ''"
  go_to="/contributions"
  :can_go_to="admin"
  class="d-flex flex-column"
>
  <v-card-text class="pb-4 flex-grow-1 d-flex align-stretch">
    <v-row dense v-if="data" class="col-12 pa-0">
      <v-col cols="12" class="d-flex align-stretch">
        <v-row dense class="d-flex">
          <v-col cols="12" :sm="(i == totals.length-1 && total.name.includes('last_day')) ? 12 : 6" v-for="(total,i) in totals" :key="total.name" class="d-flex align-stretch">
            <p class="mb-0 rounded-lg pa-2">
              <span class="v-card__title pa-0 d-inline text--primary">{{ total.value }}</span>{{ ' ' + $root.lang('dashboard.totals.' + total.name) }}
            </p>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row dense v-else class="col-12 pa-0">
      <v-col cols="12" class="d-flex align-stretch">
        <v-row dense class="d-flex">
          <v-col cols="12" sm="6" v-for="i in 4" :key="'skeleton'+i" class="d-flex align-stretch">
            <p class="mb-0 rounded-lg pa-2">
              <span class="v-card__title pa-0 d-inline text--primary">
                <v-skeleton-loader height="24" type="text" />
              </span>
            </p>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-card-text>
</dashboard-card>
  </template>

<script>
const DashBoardCard = () => import("./dashcard.js");

export default {
  name: "contribution-stats-card",
  components: {
    "dashboard-card": DashBoardCard,
  },
  props: {
    admin: {
      required: true,
      type: Boolean,
      default: false,
    },
  },
  
  data() {
    return {
      data: undefined,
    };
  },
  computed: {
    totals() {
      if (!this.data) return [];
      return this.data;
    },
  },
  methods: {
    onTotals(data) {
      this.data = data;
    },
  },
};
</script>