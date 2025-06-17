<template>
	<v-tab-item>
		<h2 class="pt-5 pb-3">{{ $root.lang().database.textures.modal.title }}</h2>
		<v-row>
			<v-col cols="12" sm="6">
				<v-text-field
					v-model="texture.name"
					required
					clearable
					:color="color"
					:label="$root.lang().database.textures.modal.name"
				/>
			</v-col>
			<v-col cols="12" sm="6">
				<v-combobox
					v-model="texture.tags"
					:color="color"
					:item-color="color"
					required
					multiple
					small-chips
					deletable-chips
					:items="tags"
					:label="$root.lang().database.textures.modal.tags"
					@change="
						() => {
							texture.tags = sortTags(texture.tags);
						}
					"
				/>
			</v-col>
		</v-row>
		<h2 class="py-3">
			{{ $root.lang().database.textures.modal.subtitle }}
		</h2>
		<v-timeline dense align-top class="pl-0">
			<v-timeline-item v-for="(use, ui) in texture.uses" :key="use.key" fill-dot :color="color">
				<template #icon>
					<span class="white--text">{{ useIDFromIndex(ui) }}</span>
				</template>
				<v-row>
					<v-col cols="12" sm="5">
						<v-text-field
							v-model="use.name"
							:color="color"
							:label="$root.lang().database.textures.uses.name"
						/>
					</v-col>
					<v-col cols="12" sm="6">
						<v-select
							v-model="use.edition"
							:color="color"
							:item-color="color"
							:items="settings.editions"
							:label="$root.lang().database.textures.uses.edition"
							@change="(e) => onEditionChange(e, use)"
						/>
					</v-col>
					<v-col cols="12" sm="1">
						<v-btn color="red lighten-1" icon @click="deleteUse(ui)">
							<v-icon>mdi-trash-can</v-icon>
						</v-btn>
					</v-col>
				</v-row>
				<v-row v-for="(path, pi) in use.paths" :key="path.key">
					<v-col cols="12" sm="5">
						<v-text-field
							v-model="path.name"
							:color="color"
							:label="$root.lang().database.textures.paths.name"
							clearable
							persistent-hint
							:hint="$root.lang().database.textures.paths.name_prefill"
							@change="(e) => onPathAdded(e, path, use)"
						/>
					</v-col>
					<v-col cols="12" sm="4">
						<v-select
							v-model="path.versions"
							:color="color"
							:item-color="color"
							:items="sortedVersions"
							:label="$root.lang().database.textures.paths.versions"
							multiple
							hide-details
							clearable
							small-chips
							deletable-chips
						/>
					</v-col>
					<v-col cols="12" sm="2">
						<v-checkbox
							v-model="path.mcmeta"
							:color="color"
							:label="$root.lang().database.textures.paths.mcmeta"
						/>
					</v-col>
					<v-col cols="12" sm="1">
						<v-btn color="red lighten-1" icon @click="deletePath(ui, pi)">
							<v-icon>mdi-minus</v-icon>
						</v-btn>
					</v-col>
				</v-row>
				<v-btn block class="my-5" color="secondary" @click="addPath(ui)">
					{{ $root.lang().database.textures.paths.add_path }}
					<v-icon right>mdi-plus</v-icon>
				</v-btn>
			</v-timeline-item>
		</v-timeline>
		<v-btn block class="my-5" color="secondary" @click="addUse">
			{{ $root.lang().database.textures.uses.add_use }} <v-icon right>mdi-plus</v-icon>
		</v-btn>
		<!-- one use and one path are essentially guaranteed by the modal setup -->
		<v-btn
			v-if="canAddEditionUse"
			block
			class="my-5 white--text"
			:color="color"
			@click="addEditionUse"
		>
			{{ addEditionUseLabel }}
			<v-icon right>mdi-plus</v-icon>
		</v-btn>
	</v-tab-item>
</template>

<script>
import { formatTag, sortTags, emptyPath, emptyUse } from "@helpers/textures";
import {
	getNameFromPath,
	getEditionFromPath,
	getTagFromPath,
	convertEditionPath,
} from "@helpers/paths";

import versionSorter from "@helpers/versionSorter";

export default {
	name: "texture-panel",
	props: {
		value: {
			type: Object,
			required: true,
		},
		color: {
			type: String,
			required: false,
			default: "primary",
		},
		tags: {
			type: Array,
			required: false,
			default: () => [],
		},
	},
	data() {
		return {
			texture: {},
			settings,
		};
	},
	methods: {
		sortTags,
		addUse() {
			this.texture.uses.push(emptyUse());
		},
		addEditionUse() {
			// we already know at least one use exists at this point
			const use = this.texture.uses[0];
			const newEdition = this.getCorrespondingEdition(use.edition);
			this.texture.uses.push({
				...emptyUse(),
				name: use.name,
				edition: newEdition,
				paths: use.paths.map((p) => ({
					name: convertEditionPath(p.name, newEdition),
					versions: [settings.versions[newEdition][0]],
					mcmeta: false,
				})),
			});
			this.addEditionTag(newEdition);
		},
		deleteUse(useIndex) {
			this.texture.uses.splice(useIndex, 1);
			if (!this.texture.uses.length) this.addUse();
		},
		addPath(useIndex) {
			this.texture.uses[useIndex].paths.push(emptyPath());
		},
		deletePath(useIndex, pathIndex) {
			this.texture.uses[useIndex].paths.splice(pathIndex, 1);
			if (!this.texture.uses[useIndex].paths.length) this.addPath(useIndex);
		},
		useIDFromIndex(i) {
			// 'a' == 97
			return String.fromCharCode(97 + i);
		},
		addEditionTag(edition) {
			if (!this.texture.tags.includes(edition.toTitleCase()))
				this.texture.tags = sortTags([edition.toTitleCase(), ...this.texture.tags]);
		},
		onEditionChange(edition, use) {
			use.paths ||= [emptyPath()];
			use.paths.forEach((path) => {
				// add latest version if nothing added yet
				if (!path.versions.length) path.versions.push(settings.versions[edition][0]);
			});
			this.addEditionTag(edition);
		},
		onPathAdded(el, path, use) {
			// windows fix
			path.name = el.replace(/\\/g, "/").trim();
			// infer png extension if not present
			if (!path.name.includes(".")) path.name += ".png";

			// largely ripped from https://github.com/3vorp/faithful-utilities/blob/main/tools/createTextures.js
			if (!el || !path) return;

			const name = getNameFromPath(path.name);
			const edition = getEditionFromPath(path.name);
			if (!path.versions.length) path.versions.push(settings.versions[edition][0]);

			if (!use) return;
			if (!use.edition) {
				use.edition = edition;
				this.onEditionChange(edition, use);
			}

			use.name ||= name;

			this.texture.name ||= name;

			this.texture.tags = sortTags(
				[...this.texture.tags, getTagFromPath(path.name)].map(formatTag),
			);
		},
		getCorrespondingEdition(edition) {
			return settings.editions.find((e) => e !== edition) || "bedrock";
		},
	},
	computed: {
		sortedVersions() {
			// use cached settings to save request
			return Object.values(settings.versions).flat().sort(versionSorter).reverse();
		},
		canAddEditionUse() {
			// must have only one use to select from
			if (this.texture.uses.length !== 1) return false;
			const use = this.texture.uses[0];
			// can't make edition use without an edition
			if (!use.edition) return false;
			// at least one path is guaranteed by the modal
			if (!use.paths[0].name) return false;
			return true;
		},
		addEditionUseLabel() {
			const uses = this.texture.uses;
			if (!uses.length) return "";
			const newEdition = this.getCorrespondingEdition(uses[0].edition);
			return this.$root
				.lang()
				.database.textures.uses.add_edition_use.replace("%edition%", newEdition.toTitleCase());
		},
	},
	watch: {
		value: {
			handler(newValue) {
				this.texture = newValue;
			},
			immediate: true,
			deep: true,
		},
		texture(newValue) {
			this.$emit("input", newValue);
		},
	},
};
</script>
