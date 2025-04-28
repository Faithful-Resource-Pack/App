<template>
	<div>
		<div class="py-3">
			<h2 class="mb-3">{{ $root.lang().gallery.modal.info.texture }}</h2>
			<v-data-table
				dense
				:headers="headers.texture"
				:items="texture"
				class="elevation-1"
				hide-default-footer
				disable-pagination
			/>
		</div>
		<div class="py-3">
			<h2 class="mb-3">{{ $root.lang().gallery.modal.info.uses }}</h2>
			<v-data-table
				dense
				:headers="headers.uses"
				:items="uses"
				class="elevation-1"
				hide-default-footer
				disable-pagination
			>
				<!-- use names can be empty/null -->
				<template #item.name="{ value }">
					<template v-if="value">{{ value }}</template>
					<i v-else>{{ $root.lang().database.nameless }}</i>
				</template>
			</v-data-table>
		</div>
		<div class="py-3">
			<h2 class="mb-3">{{ $root.lang().gallery.modal.info.paths }}</h2>
			<div v-for="edition in editions" :key="edition">
				<p class="title text-button text--secondary mb-0">
					{{ edition.toTitleCase() }}
				</p>
				<v-data-table
					dense
					:headers="headers.paths"
					:items="paths[edition]"
					class="elevation-1"
					hide-default-footer
					disable-pagination
				>
					<template #item.versions="{ value }">
						<!-- title property gives alt text -->
						<span :title="value.join(', ')">{{ formatPathVersions(value) }}</span>
					</template>
				</v-data-table>
			</div>
		</div>
	</div>
</template>

<script>
import versionSorter from "@helpers/versionSorter";

export default {
	name: "texture-tab",
	props: {
		textureObj: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			headers: {
				texture: [
					{
						text: this.$root.lang().gallery.modal.data.id,
						value: "id",
						sortable: false,
					},
					{
						text: this.$root.lang().gallery.modal.data.name,
						value: "name",
						sortable: false,
					},
					{
						text: this.$root.lang().gallery.modal.data.tags,
						value: "tags",
						sortable: false,
					},
				],
				uses: [
					{
						text: this.$root.lang().gallery.modal.data.use_id,
						value: "id",
					},
					{
						text: this.$root.lang().gallery.modal.data.use_name,
						value: "name",
					},
					{
						text: this.$root.lang().gallery.modal.data.edition,
						value: "edition",
					},
				],
				paths: [
					{
						text: this.$root.lang().gallery.modal.data.path_id,
						value: "id",
					},
					{
						text: this.$root.lang().gallery.modal.data.resource_pack_path,
						value: "name",
					},
					{
						text: this.$root.lang().gallery.modal.data.mc_versions,
						value: "versions",
					},
					{
						text: this.$root.lang().gallery.modal.data.use_id,
						value: "use",
					},
				],
			},
		};
	},
	methods: {
		formatPathVersions(versions) {
			if (versions.length === 1) return versions[0];
			// use nbsp to prevent weirdness on mobile
			return `${versions[0]} – ${versions[versions.length - 1]}`;
		},
	},
	computed: {
		texture() {
			return [
				{
					...this.textureObj.texture,
					tags: this.textureObj.texture.tags.join(", "),
				},
			];
		},
		uses() {
			return this.textureObj.uses;
		},
		paths() {
			return this.textureObj.paths
				.map((path) => ({
					...path,
					// sort() mutates the original array so we need to clone it
					versions: Array.from(path.versions).sort(versionSorter),
				}))
				.reduce((acc, cur) => {
					const edition = this.uses.find((u) => u.id === cur.use)?.edition;
					if (!edition) return acc;
					acc[edition] ||= [];
					acc[edition].push(cur);
					return acc;
				}, {});
		},
		editions() {
			// faster to search path keys than use .some with uses
			const availableEditions = Object.keys(this.paths);

			// trick to make sure editions are sorted
			return settings.editions.filter((e) => availableEditions.includes(e));
		},
	},
};
</script>
