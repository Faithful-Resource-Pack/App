import { formatTag } from "./textures";

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
