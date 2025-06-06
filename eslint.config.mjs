import pluginVue from "eslint-plugin-vue";

export default [
	...pluginVue.configs["flat/vue2-recommended"],
	{
		rules: {
			"vue/html-self-closing": "off",
			// site uses kebab-case for everything
			"vue/component-definition-name-casing": "off",
			"vue/order-in-components": "off",
			"vue/attribute-hyphenation": "off",
			"vue/v-on-event-hyphenation": "off",
			// handled much better by prettier
			"vue/html-indent": "off",
			"vue/max-attributes-per-line": "off",
			"vue/singleline-html-element-content-newline": "off",
		},
	},
];
