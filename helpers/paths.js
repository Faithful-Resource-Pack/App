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
	const textureFolderIndex = split.findIndex((dir) => dir === "textures");
	const tagName = textureFolderIndex == -1 ? null : split[textureFolderIndex + 1]?.toTitleCase();
	return formatTag(tagName);
}

/** @param {string} path */
export const getEditionFromPath = (path) => (path.startsWith("assets") ? "java" : "bedrock");

export const convertEditionPath = (path, newEdition) => {
	const folderData = [
		{ java: "block", bedrock: "blocks" },
		{ java: "item", bedrock: "items" },
	];

	// quite hacky but it works
	switch (newEdition) {
		case "bedrock": {
			const folderTranslator = folderData.reduce((acc, cur) => {
				acc[cur.java] = cur.bedrock;
				return acc;
			}, {});
			const trimmed = path.replace("assets/", "").replace("minecraft/textures/", "");
			const [folder, ...rest] = trimmed.split("/");
			return `textures/${folderTranslator[folder] || folder}/${rest.join("/")}`;
		}
		case "java": {
			const folderTranslator = folderData.reduce((acc, cur) => {
				acc[cur.bedrock] = cur.java;
				return acc;
			});
			const trimmed = path.replace("textures/", "");
			const [folder, ...rest] = trimmed.split("/");
			return `assets/minecraft/textures/${folderTranslator[folder] || folder}/${rest.join("/")}`;
		}
	}
};
