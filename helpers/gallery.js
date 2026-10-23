export const COLUMN_KEY = "gallery_columns";
export const STRETCHED_KEY = "gallery_stretched";
export const ANIMATED_KEY = "gallery_animated";

/** Display options saved between visits, shared by every gallery-like page */
export const loadDisplayOptions = () => ({
	// whether the page should be stretched to the full width
	stretched: localStorage.getItem(STRETCHED_KEY) === "true",
	// whether to show animated textures
	animated: localStorage.getItem(ANIMATED_KEY) !== "false",
	// number of columns you want to display
	columns: Number(localStorage.getItem(COLUMN_KEY) || 8),
});

/**
 * Most columns that fit the screen, mostly arbitrary values, feel free to change these
 * based on https://v2.vuetifyjs.com/en/features/breakpoints/
 * @param {{ xs: boolean, sm: boolean, md: boolean, lg: boolean }} breakpoint
 */
export function maxGalleryColumns({ xs, sm, md, lg }) {
	if (xs) return 4; // mobile
	if (sm) return 8;
	if (md) return 12;
	if (lg) return 16;
	return 20;
}
