/** @type {Record<string, Record<string, string>>} */
const colors = (await import("https://cdn.jsdelivr.net/npm/vuetify@2.6.4/lib/util/colors.min.js"))
	.default;

/** @param {string} color */
const colorToHex = (color) => {
	const colorArr = color.trim().split(" ");

	try {
		colorArr[0] = colorArr[0].replace(/-./g, (x) => x[1].toUpperCase());
		if (colorArr.length > 1) colorArr[1] = colorArr[1].replace("-", "");
		return colors[colorArr[0]][colorArr.length > 1 ? colorArr[1] : "base"];
	} catch (error) {
		return "inherit";
	}
};

/** @param {import("vue").Vue} page */
export const updatePageStyles = (page) => {
	if (!page.$el) return;
	page.$el.id ||= page.name;

	const pageId = page.$el.id;
	const hex = colorToHex(page.pageColor);

	page.pageStyles = `
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
};
