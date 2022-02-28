export default {
  name: 'file-form',
  template: `
<v-form style="padding: 10px">
  <!-- File name -->
  <v-text-field
    clearable
    v-model="value.name"
    :counter="form.name.counter.max"
    :label="$root.lang().files.general.name.label"
    :hint="$root.lang().files.general.name.hint"
  />

  <!-- File use -->
  <v-text-field
    clearable
    v-model="value.use"
    :rules="form.use.rules"
    :counter="form.use.counter.max"
    :label="$root.lang().files.general.use.label"
     :hint="$root.lang().files.general.use.hint"
  />

  <!-- File type -->
  <v-text-field
    clearable
    v-model="value.type"
    :rules="form.type.rules"
    :counter="form.type.counter.max"
    :label="$root.lang().files.general.type.label"
    :hint="$root.lang().files.general.type.hint"
  />

  <v-row>
    <v-col>

  <!-- File parent type -->
  <v-text-field
    clearable
    v-model="value.parent.type"
    :rules="form.parent.type.rules"
    :label="$root.lang().files.general.parent.type.label"
     :hint="$root.lang().files.general.parent.type.hint"
  />

  </v-col><v-col>

  <!-- File parent id -->
  <v-text-field
    clearable
    type="number"
    v-model="value.parent.id"
    :rules="form.parent.id.rules"
    :label="$root.lang().files.general.parent.id.label"
     :hint="$root.lang().files.general.parent.id.hint"
  />

  </v-col></v-row>

  <!-- File source -->
  <v-text-field
    clearable
    v-model="value.source"
    :rules="form.source.rules"
    :label="$root.lang().files.general.source.label"
     :hint="$root.lang().files.general.source.hint"
  />
</v-form>
  `,
  props: {
    value: {
      required: true
    }
  },
  data() {
    return {
      form: {
        name: {
          counter: {
            max: 30
          },
        },
        use: {
          rules: [
            name => !!name || this.$root.lang().files.general.use.rules.name_required,
            name => (name && name.length <= this.form.use.counter.max) || this.$root.lang().files.general.use.rules.name_too_big.replace('%s', this.form.name.counter.max),
            name => (name && name.length >= this.form.use.counter.min) || this.$root.lang().files.general.use.rules.name_too_small.replace('%s', this.form.name.counter.min),
          ],
          counter: {
            min: 5,
            max: 30
          },
        },
        type: {
          rules: [
            name => !!name || this.$root.lang().files.general.type.rules.name_required,
            name => (name && name.length <= this.form.type.counter.max) || this.$root.lang().files.general.type.rules.name_too_big.replace('%s', this.form.type.counter.max),
            name => (name && name.length >= this.form.type.counter.min) || this.$root.lang().files.general.type.rules.name_too_small.replace('%s', this.form.type.counter.min),
          ],
          counter: {
            min: 3,
            max: 30
          },
        },
        source: {
          rules: [
            name => !!name || this.$root.lang().files.general.source.rules.name_required
          ],
        },
        parent: {
          type: {
            rules: [
              name => !!name || this.$root.lang().files.general.parent.type.rules.name_required,
              name => (name && name.length >= this.form.parent.type.counter.min) || this.$root.lang().files.general.parent.type.rules.name_too_small.replace('%s', this.form.parent.type.counter.min),
              name => (name && name.length <= this.form.parent.type.counter.max) || this.$root.lang().files.general.parent.type.rules.name_too_big.replace('%s', this.form.parent.type  .counter.max),
            ],
            counter: {
              min: 5,
              max: 30
            },
          },
          id: {
            rules: [
              name => !!name || this.$root.lang().files.general.parent.id.rules.name_required,
            ],
          },
        }
      },
    }
  },
}