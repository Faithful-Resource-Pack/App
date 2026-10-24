import axios from "axios";

/** Location of a mod texture in the jar and in the version folders of the contribution repositories */
export const modTexturePath = ({ namespace, path }) => `assets/${namespace}/textures/${path}.png`;

/**
 * Repository of a pack's modded textures
 * @param {{ github?: { modded?: { org: string, repo: string | null } } }} pack
 * @returns {{ org: string, repo: string } | null}
 */
export function modRepository(pack) {
	const github = pack?.github?.modded;
	return github?.repo ? { org: github.org, repo: github.repo } : null;
}

/**
 * Page of a mod version folder on GitHub, where contributions are made
 * @param {object} params
 * @param {{ org: string, repo: string }} params.repository
 * @param {{ slug: string }} params.mod
 * @param {{ version: string }} params.version
 */
export const modFolderURL = ({ repository, mod, version }) =>
	`https://github.com/${repository.org}/${repository.repo}/tree/${encodeURIComponent(mod.slug)}/${encodeURIComponent(version.version)}`;

/**
 * Image url of a contribution, empty if the pack has no modded repository.
 * The file is read from the mod's branch, so the date is added to get past the cache when it changes.
 * @param {object} params
 * @param {{ id: string, github?: object }[]} params.packs
 * @param {{ slug: string }} params.mod
 * @param {{ version: string }} params.version
 * @param {string} params.path path of the texture in the jar
 * @param {{ pack: string, date: number }} params.contribution
 */
export function modContributionURL({ packs, mod, version, path, contribution: c }) {
	const repository = modRepository(packs.find((p) => p.id === c.pack));
	if (!repository || !path) return "";
	const file = [mod.slug, version.version, ...path.split("/")].map(encodeURIComponent).join("/");
	return `https://raw.githubusercontent.com/${repository.org}/${repository.repo}/${file}?v=${c.date}`;
}

/** Data url of a texture's .mcmeta, empty if it has none (the image component loads it from an url) */
export const mcmetaURL = (texture) =>
	texture.mcmeta
		? `data:application/json,${encodeURIComponent(JSON.stringify(texture.mcmeta))}`
		: "";

/**
 * Name to show for an author: contributions made on GitHub list logins,
 * the ones inherited from vanilla textures list user ids
 * @param {string} author
 * @param {Record<string, string>} users usernames by user id
 * @param {string} anonymous
 */
export function modAuthorName(author, users, anonymous) {
	if (users[author]) return users[author];
	// discord ids are long numbers, a login is never shown as unknown
	return /^\d{15,}$/.test(author) ? anonymous : author;
}

/**
 * Latest vanilla contribution of each pack for the vanilla textures mod textures are linked to
 * @param {string} apiURL
 * @param {object[]} linked mod textures with a vanilla_id
 * @param {string} [pack] only this pack
 */
async function loadVanillaContributions(apiURL, linked, pack) {
	if (!linked.length) return [];

	const vanillaIds = [...new Set(linked.map((t) => t.vanilla_id))];
	const res = await axios.get(`${apiURL}/textures/${vanillaIds.join(",")}/contributions`);

	const latest = {};
	for (const c of res.data) {
		if (pack && c.pack !== pack) continue;
		const key = `${c.texture}/${c.pack}`;
		if (!latest[key] || latest[key].date < c.date) latest[key] = c;
	}

	return linked.flatMap((texture) =>
		Object.values(latest)
			.filter((c) => Number(c.texture) === texture.vanilla_id)
			.map((c) => ({
				id: `vanilla-${texture.id}-${c.pack}`,
				texture_id: texture.id,
				vanilla_id: texture.vanilla_id,
				pack: c.pack,
				authors: c.authors,
				date: c.date,
			})),
	);
}

/**
 * Contributions of the textures of a mod version: the ones merged in the mod's branch
 * and the ones inherited from the vanilla textures the mod textures are linked to.
 * Mod contributions come first, so they win over inherited ones for the same texture and pack.
 * @param {object} params
 * @param {string} params.apiURL
 * @param {object} params.mod
 * @param {object} params.version
 * @param {{ id: string, github?: object }[]} params.packs
 * @param {object[]} params.textures textures of the version, with their paths
 * @param {string} [params.pack] only this pack
 * @param {string} [params.textureId] only this mod texture
 */
export async function loadModContributions({
	apiURL,
	mod,
	version,
	packs,
	textures,
	pack,
	textureId,
}) {
	const own = await axios.get(`${apiURL}/mods/${mod.id}/contributions`, {
		params: { pack, texture_id: textureId },
	});

	// contributions of the linked vanilla textures are read from the vanilla textures themselves
	const linked = textures
		.map((t) => t.texture)
		.filter((t) => t.vanilla_id !== undefined && (!textureId || t.id === textureId));
	const inherited = await loadVanillaContributions(apiURL, linked, pack);

	// a texture can be used at several paths, any of them has the same file
	const paths = {};
	for (const t of textures) paths[t.texture.id] ||= modTexturePath(t);

	return [
		// contributions of the other versions' textures are not shown
		...own.data
			.filter((c) => paths[c.mod_texture_id])
			.sort((a, b) => b.date - a.date)
			.map((c) => ({
				...c,
				texture_id: c.mod_texture_id,
				inherited: false,
				url: modContributionURL({
					packs,
					mod,
					version,
					path: paths[c.mod_texture_id],
					contribution: c,
				}),
			})),
		...inherited.map((c) => ({
			...c,
			inherited: true,
			url: `${apiURL}/textures/${c.vanilla_id}/url/${c.pack}/latest`,
		})),
	];
}

/** Best contribution of each texture (the latest mod one, else an inherited one) */
export function currentByTexture(contributions) {
	const out = {};
	for (const c of contributions) {
		if (!out[c.texture_id]) out[c.texture_id] = c;
	}
	return out;
}
