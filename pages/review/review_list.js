export default {
  name: "review-list",
  props: {
    value: {
      type: String,
      required: true,
    },
    items: {
      type: Array, // [{ primary: String, secondary: String, key: Number }]
      required: true,
    },
    empty: {
      type: String,
      required: true,
    },
    activeColor: {
      type: String,
      required: true,
    },
  },
  template: `
<v-card
    flat
    class="overflow-y-auto rounded-lg"
>
    <v-list-item
        v-if="items.length > 0"
        two-line v-for="(item,i) in items"
        :key="item.key"
        :class="classes[i]"
        @click="() => onClick(item.key)"
    >
      <v-list-item-content>
        <v-list-item-title>{{ item.primary }}</v-list-item-title>
        <v-list-item-subtitle>{{ item.secondary }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <div v-else class="pa-2">
        {{ empty }}
    </div>
</v-card>`,
  methods: {
    onClick(key) {
      this.$emit("input", key);
    },
  },
  computed: {
    classes() {
      return this.items.map((v) => (v.key === this.value ? this.activeColor + " selected" : ""));
    },
  },
};
