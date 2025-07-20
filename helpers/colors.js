/**
 * @type {Record<string, Record<string, string>>}
 * Record<ColorName, Record<ColorVariant, HEX>>
 */
const colors = (await import("https://cdn.jsdelivr.net/npm/vuetify@2.6.4/lib/util/colors.min.js"))
	.default;

/** @param {string} color */
const colorToHex = (color) => {
	if (color.startsWith("#")) return color;
	const colorArr = color.trim().split(" ");

	// to camel case
	const colorName = colorArr[0].replace(/-./g, (x) => x[1].toUpperCase());
	// remove hyphens
	const variant = colorArr.length > 1 ? colorArr[1].replace("-", "") : "base";
	if (colors[colorName]?.[variant]) return colors[colorName][variant];
	return "inherit";
};

/**
 * Generate page style CSS for a given color
 * @param {import("vue").Vue} page
 * @param {string} pageColor - Vuetify or hex color
 * @returns {string} CSS style tag to apply
 */
export function generatePageStyles(page, pageColor) {
	// not mounted yet
	if (!page.$el) return "";
	page.$el.id ||= page.name;

	const pageId = page.$el.id;
	const hex = colorToHex(pageColor);

	return `
	<style>
		html.theme--light,
		html.theme--light .colored,
		html.theme--light .colored *,
		html.theme--light .v-menu__content,
		html.theme--light .v-menu__content *,
		html.theme--light #${pageId},
		html.theme--light #${pageId} * {
			scrollbar-color: ${hex} #ffffffbb !important;
		}

		html.theme--dark,
		html.theme--dark .colored,
		html.theme--dark .colored *,
		html.theme--dark .v-menu__content,
		html.theme--dark .v-menu__content *,
		html.theme--dark #${pageId},
		html.theme--dark #${pageId} * {
			scrollbar-color: ${hex} #000000bb !important;
		}
	</style>`;
}
