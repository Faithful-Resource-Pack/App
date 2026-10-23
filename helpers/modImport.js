/**
 * @typedef {{ platform: "curseforge" | "modrinth", project_id: string, name: string, slug: string,
 * summary?: string, icon?: string, exact?: boolean }} PlatformProject
 */

const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9]/g, "");

// download from modrinth first since curseforge doesn't always provide a download link
const PLATFORM_PRIORITY = ["modrinth", "curseforge"];

/**
 * Group search results that are the same mod on different platforms (same name or slug)
 * @param {PlatformProject[]} results
 */
export function groupResults(results) {
	const groups = [];
	for (const result of results) {
		const keys = [normalize(result.name), normalize(result.slug)];
		// a platform only has one project per mod
		const group = groups.find(
			(g) =>
				!g.projects.some((p) => p.platform === result.platform) &&
				g.keys.some((k) => keys.includes(k)),
		);
		if (group) {
			group.projects.push(result);
			group.keys.push(...keys);
			group.icon ||= result.icon;
			group.summary ||= result.summary;
			continue;
		}
		groups.push({
			name: result.name,
			icon: result.icon,
			summary: result.summary,
			keys,
			projects: [result],
		});
	}
	return groups;
}

/**
 * Merge the files of every platform into one row per version, listing which platforms have it
 * @param {import("../resources/types.d.ts").PlatformFile[]} files
 */
export function mergeFiles(files) {
	const rows = [];
	for (const file of files) {
		const version = file.version ?? file.raw_version;
		const loaders = [...file.loaders].sort().join("+");
		const key = `${version}|${loaders}`;
		// two files of one platform with the same version are different builds, never merge them
		let row = rows.find((r) => r.id === key && !r.files.some((f) => f.platform === file.platform));
		if (!row) {
			row = {
				id: key,
				key,
				version: file.version,
				raw_version: file.raw_version,
				channel: file.channel,
				minecraft: [],
				loaders: file.loaders,
				files: [],
			};
			rows.push(row);
		}
		row.files.push(file);
		row.minecraft = [...new Set([...row.minecraft, ...file.minecraft])];
	}
	// rows can share a key when builds clash, make the ids unique
	const seen = {};
	return rows.map((row) => {
		seen[row.key] = (seen[row.key] ?? 0) + 1;
		return {
			...row,
			id: `${row.key}#${seen[row.key]}`,
			platforms: row.files.map((f) => f.platform),
		};
	});
}

/** File to import for a row: one is enough since the assets are the same on every platform */
export function fileToImport(row) {
	return [...row.files].sort(
		(a, b) => PLATFORM_PRIORITY.indexOf(a.platform) - PLATFORM_PRIORITY.indexOf(b.platform),
	)[0];
}
