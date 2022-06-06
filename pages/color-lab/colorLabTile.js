export default {
  name: 'color-lab-tile',
  props: ['color', 'plus', 'index', 'buttons'],
  template: `
<v-card flat :light="isLit" :dark="!isLit" :class="['pa-0 color-lab-tile d-flex flex-column align-center justify-center, rounded-0']" :style="{ 'background' : color.color }">
  <div class="actions d-flex flex-column align-center">
    <v-btn icon>
      <v-icon>mdi-close</v-icon>
    </v-btn>
    <v-btn icon>
      <v-icon>mdi-grid</v-icon>
    </v-btn>
    <v-btn icon class="my-handle">
      <v-icon>mdi-arrow-left-right</v-icon>
    </v-btn>
    <v-btn icon @click="$emit('remove', index)" :disabled="buttons.remove">
      <v-icon>mdi-close</v-icon>
    </v-btn>
    <v-btn icon @click="$emit('lock', index)">
      <v-icon>{{ buttons.locked ? 'mdi-lock' : 'mdi-lock-open' }} </v-icon>
    </v-btn>
  </div>
  <div class="hex-btn my-1">{{ color.color.substring(1) }}</div>
  <div class="human-name">{{ humanName }}</div>

  <div v-if="plus" class="plus-zone d-flex align-center justify-center">
    <v-btn dark icon class="black text-white" @click="$emit('add', index)">
      <v-icon>mdi-plus</v-icon>
    </v-btn>
  </div>
</v-card>
  `,
  data: function() {
    return {
      humanName: ''
    }
  },
  computed: {
    colorLight: function() {
      const col = this.color.color
      const r = Number.parseInt(col.substring(1, 3), 16)
      const g = Number.parseInt(col.substring(3, 5), 16)
      const b = Number.parseInt(col.substring(5, 7), 16)
      return Math.round(((parseInt(r) * 299) + (parseInt(g) * 587) + (parseInt(b) * 114)) /1000)
    },
    isLit: function() {
      return this.colorLight > 125
    }
  },
  methods: {
    waitAndGetHumanName: function() {
      try {
        this.humanName = ntc.name(this.$props.color.color)[1]
      } catch (_) {
        setTimeout(() => {
          this.waitAndGetHumanName()
        }, 100)
      }
    }
  },
  watch: {
    color: {
      handler: function() {
        this.waitAndGetHumanName()
      },
      immediate: true,
      deep: true
    }
  }
}