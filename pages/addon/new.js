/* global axios, marked, FileReader, Image */
const AddonForm = () => import('./addonForm.js')

export default {
  name: 'new-addon-page',
  components: {
    AddonForm,
  },
  template: `
<v-container>
  <AddonForm :new-addon="true" />
</v-container>
  `
}