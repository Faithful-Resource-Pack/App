/**
 * Get the texture name from a path
 * @param {string} path full path
 * @returns {string} texture name
 */
export function getNameFromPath(path) {
	const split = path.split("/");
	return split[split.length - 1].split(".")[0];
}

/**
 * Get the tag from a texture path
 * @param {string} path input path
 * @returns {string} tag to add as string
 */
export function getTagFromPath(path) {
	const split = path.split("/");
	const textureFolderIndex = split.findIndex((v) => v == "textures");
	const tagName = textureFolderIndex == -1 ? null : split[textureFolderIndex + 1]?.toTitleCase();
	return formatTag(tagName);
}

/** @param {string} path */
export const getEditionFromPath = (path) => (path.startsWith("assets") ? "java" : "bedrock");

/**
 * Format a folder tag into a texture tag
 * @param {string} tag unformatted tag
 * @returns {string} formatted tag
 */
export function formatTag(tag) {
	switch (tag) {
		case "Blocks":
			return "Block";
		case "Items":
			return "Item";
		case "Gui":
			return "GUI";
		case "Ui":
			return "UI";
		default:
			return tag;
	}
}

/**
 * Sort an array of tags according to Pomi108's specification
 * @param {string[]} input input array of tags
 * @returns {string[]} sorted tags
 */
export function sortTags(input) {
	// remove duplicates/null items and alphabetically sort
	let arr = [...new Set(input.filter((i) => i))].sort();
	// shift broader tags to start
	if (arr.includes("Realms")) arr = ["Realms", ...arr.filter((i) => i !== "Realms")];
	if (arr.includes("Modded")) arr = ["Modded", ...arr.filter((i) => i !== "Modded")];
	if (arr.includes("Bedrock")) arr = ["Bedrock", ...arr.filter((i) => i !== "Bedrock")];
	if (arr.includes("Java")) arr = ["Java", ...arr.filter((i) => i !== "Java")];
	return arr;
}


/**
 * Sort Minecraft Version Numbers
 * Use this function as a filter for the sort() method:
 * [].sort(MinecraftSorter)
 */
export function MinecraftSorter(a, b) {
	const aSplit = a.split(".").map((s) => parseInt(s));
	const bSplit = b.split(".").map((s) => parseInt(s));

	if (aSplit.includes(NaN) || bSplit.includes(NaN)) {
		return String(a).localeCompare(String(b)); // compare as strings
	}

	const upper = Math.min(aSplit.length, bSplit.length);
	let i = 0;
	let result = 0;
	while (i < upper && result == 0) {
		result = aSplit[i] == bSplit[i] ? 0 : aSplit[i] < bSplit[i] ? -1 : 1; // each number
		++i;
	}

	if (result != 0) return result;

	result = aSplit.length == bSplit.length ? 0 : aSplit.length < bSplit.length ? -1 : 1; // longer length wins

	return result;
}
