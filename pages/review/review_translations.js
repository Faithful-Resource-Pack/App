export default {
  name: 'review-translations-page',
  template: `
  <v-container>
    <div class="text-h4 py-4">
    {{ $root.lang().review.titles.translation }}
    </div>
  </v-container>
  `,
  data () {
    return {
      form: {}
    }
  }
}
