const newAddonForm = () => import('./newAddonForm.js')

export default {
  name: 'new-addon-page',
  components: {
    newAddonForm,
  },
  template: `
<v-container>
  <newAddonForm />
</v-container>
  `
}