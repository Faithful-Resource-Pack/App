const userSelect = () => import("./userSelect.js")

export default {
    name: 'contribution-form',
    components: {
      'user-select': userSelect
    },
    props: {
        contributors: {
          required: true,
          type: Array
        },
        value: {
            required: true
        }
    },
    template: `
<div>
    <h3>{{ $root.lang('database.subtitles.pack') }}</h3>
    <v-select
    required
    :items="content.packs"
    v-model="content.pack"></v-select>
    <h3>{{ $root.lang('database.labels.texture_id') }}</h3>
    <div class="d-flex align-center">
        <v-text-field
            required
            type="number"
            class="mr-2"
            min="0"
            v-model="content.texture" />
        <v-btn icon v-on:click="() => { content.texture = String(Number.parseInt(content.texture, 10) + 1) }">
            <v-icon>mdi-chevron-up</v-icon>
        </v-btn>
        <v-btn icon v-on:click="() => { content.texture = String(Math.max(Number.parseInt(content.texture - 1, 10), 0)) }">
            <v-icon>mdi-chevron-down</v-icon>
        </v-btn>
    </div>
    <h3>{{ $root.lang().database.titles.contributors }}</h3>
    <user-select  :contributors="contributors" v-model="content.authors"></user-select>
</div>
`,
    data() {
        return {
          content: this.value
        }
    },
    watch: {
        content: {
            handler(n) {
                this.$emit('input', n)
            },
            deep: true
        }
    }
}