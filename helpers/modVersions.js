import versionSorter from "./versionSorter.js";

/**
 * @typedef {{ minecraft: string | null, prerelease: boolean, unparsed: boolean }} ModVersionFilters
 */

/** @type {() => ModVersionFilters} */
export const defaultModVersionFilters = () => ({
	minecraft: null,
	prerelease: false,
	// versions that couldn't be converted to semver (only found while importing)
	unparsed: false,
});

/**
 * Release channel of a version, versions imported before channels existed are releases
 * @param {{ channel?: "release" | "beta" | "alpha" }} version
 */
export const channelOf = (version) => version.channel || "release";

/**
 * Every minecraft version supported by at least one of the given mod versions, newest first
 * @param {{ minecraft: string[] }[]} versions
 */
export function minecraftVersionsOf(versions) {
	return [...new Set(versions.flatMap((v) => v.minecraft))].sort(versionSorter).reverse();
}

/**
 * @template {{ minecraft: string[], channel?: "release" | "beta" | "alpha" }} T
 * @param {T[]} versions
 * @param {ModVersionFilters} filters
 * @returns {T[]}
 */
export function filterModVersions(versions, { minecraft, prerelease, unparsed }) {
	return versions.filter(
		(v) =>
			(prerelease || channelOf(v) === "release") &&
			(unparsed || v.version !== null) &&
			(!minecraft || v.minecraft.includes(minecraft)),
	);
}

/**
 * Compare two semver strings, a version with a pre-release tag is lower than the release
 * @param {string} a
 * @param {string} b
 */
export function compareSemver(a, b) {
	const parse = (v) => {
		const [main, ...rest] = v.split("+")[0].split("-");
		return { core: main.split(".").map(Number), pre: rest.join("-") };
	};
	const pa = parse(a);
	const pb = parse(b);
	for (let i = 0; i < Math.max(pa.core.length, pb.core.length); i++) {
		const diff = (pa.core[i] || 0) - (pb.core[i] || 0);
		if (diff) return diff;
	}
	if (pa.pre === pb.pre) return 0;
	if (!pa.pre) return 1;
	if (!pb.pre) return -1;
	return pa.pre.localeCompare(pb.pre, undefined, { numeric: true });
}

/**
 * Sort versions from the highest semver to the lowest (unparsed ones last),
 * and each version's minecraft versions newest to oldest
 * @template {{ version: string | null, raw_version?: string, minecraft: string[] }} T
 * @param {T[]} versions
 * @returns {T[]}
 */
export function sortModVersions(versions) {
	return versions
		.map((v) => ({ ...v, minecraft: [...v.minecraft].sort(versionSorter).reverse() }))
		.sort((a, b) => {
			if (a.version && b.version)
				return (
					compareSemver(b.version, a.version) ||
					versionSorter(b.minecraft[0] || "", a.minecraft[0] || "")
				);
			if (a.version || b.version) return a.version ? -1 : 1;
			return (b.raw_version || "").localeCompare(a.raw_version || "", undefined, { numeric: true });
		});
}

/** @param {"release" | "beta" | "alpha"} channel */
export const channelColor = (channel) =>
	({ release: undefined, beta: "orange", alpha: "red" })[channel];
