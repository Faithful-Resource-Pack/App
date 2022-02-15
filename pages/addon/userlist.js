/* global Vue, axios */

export default {
  name: 'user-list',
  props: {
    label: {
      type: String,
      required: true
    },
    hint: {
      type: String,
      required: true
    },
    value: {
      required: true
    }
  },
  template: `
  <v-autocomplete
    multiple
    chips
    v-model="val"
    item-text="username"
    item-value="id"
    :items="contributors"
    :loading="contributors.length == 0"
    :label="label"
    :hint="hint"
  >
    <!-- Custom chips: Items list selected part -->
    <template v-slot:selection="data">
      <v-chip
        @click:close="remove(data.item.id)"
        close
        v-bind="data.attrs"
        :key="data.item.id"
        :input-value="data.selected"
        :disabled="data.disabled"
      >
        <v-avatar
          left
          :class="{
            'accent': data.item.uuid === undefined,
            'text--white': true
          }"
        >
          <template v-if="data.item.uuid != undefined">
            <v-img
              eager
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

    <!-- Custom Chips: Item list part -->
    <template v-slot:item="data">
      <template v-if="data.item && data.item.constructor && data.item.constructor.name === 'String'">
        <v-list-item-content v-text="data.item"/>
      </template>
      <template v-else>
        <v-list-item-content>
          <v-list-item-title v-text="data.item.username"/>
        </v-list-item-content>
        <v-list-item-avatar :style="{ 'background': data.item.uuid ? 'transparent' : '#4e4e4e' }">
          <v-img v-if="data.item.uuid" eager :src="'https://visage.surgeplay.com/head/48/' + data.item.uuid">
          <div v-else>{{ data.item.username.slice(0, 1).toUpperCase() }}</div>
        </v-list-item-avatar>
      </template>
    </template>
  </v-autocomplete>
  `,
  data() {
    return {
      val: [],
      contributors: []
    }
  },
  methods: {
    remove: function (id) {
      const index = this.array.indexOf(id)
      if (index >= 0) this.array.splice(index, 1)
    },
    getContributorsIDs: function () {
      axios.get('/contributors/all')
        .then(res => {
          this.contributors = res.data.sort((a, b) => (a.username > b.username) ? 1 : ((b.username > a.username) ? -1 : 0))
        })
        .catch(err => {
          console.trace(err)
        })
    }
  },
  watch: {
    val(n) {
      this.$emit('input', n)
    },
    value: {
      handler(n) {
        this.val = n
      },
      immediate: true
    }
  },
  mounted() {
    this.getContributorsIDs()
  }
}