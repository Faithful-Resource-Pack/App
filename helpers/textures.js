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
