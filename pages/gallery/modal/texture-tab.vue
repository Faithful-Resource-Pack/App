<template>
	<div>
		<div class="gallery-info">
			<h2>{{ $root.lang().gallery.modal.info.texture }}</h2>
			<v-data-table
				dense
				:headers="headers.texture"
				:items="texture"
				class="elevation-1"
				style="margin-top: 10px"
				hide-default-footer
				disable-pagination
			/>
		</div>
		<div class="gallery-info">
			<h2>{{ $root.lang().gallery.modal.info.uses }}</h2>
			<v-data-table
				dense
				:headers="headers.uses"
				:items="uses"
				class="elevation-1"
				style="margin-top: 10px"
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
		<div class="gallery-info">
			<h2>{{ $root.lang().gallery.modal.info.paths }}</h2>
			<v-data-table
				dense
				:headers="headers.paths"
				:items="paths"
				class="elevation-1"
				style="margin-top: 10px"
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
</template>

<script>
import MinecraftSorter from "@helpers/MinecraftSorter";

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
			return Object.values(this.textureObj.uses);
		},
		paths() {
			return this.textureObj.paths.map((path) => ({
				...path,
				// sort() mutates the original array so we need to clone it
				versions: Array.from(path.versions).sort(MinecraftSorter),
			}));
		},
	},
};
</script>
