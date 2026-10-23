<template>
	<v-row align="center" dense>
		<v-col cols="12" sm="6">
			<v-switch
				:input-value="value.prerelease"
				:label="$root.lang().mods.filters.prerelease"
				:color="color"
				hide-details
				dense
				class="mt-0"
				@change="update({ prerelease: !!$event })"
			/>
			<v-switch
				v-if="showUnparsed"
				:input-value="value.unparsed"
				:label="$root.lang().mods.filters.unparsed"
				:color="color"
				hide-details
				dense
				class="mt-0"
				@change="update({ unparsed: !!$event })"
			/>
		</v-col>
		<v-col cols="12" sm="6">
			<v-select
				:value="value.minecraft"
				:items="minecraftVersions"
				:label="$root.lang().mods.filters.minecraft"
				:color="color"
				:item-color="color"
				clearable
				hide-details
				dense
				@change="update({ minecraft: $event || null })"
			/>
		</v-col>
	</v-row>
</template>

<script>
import { minecraftVersionsOf } from "@helpers/modVersions";

// shared filters when listing mod versions
export default {
	name: "mod-version-filters",
	props: {
		value: {
			type: Object,
			required: true,
		},
		// mod versions the minecraft selector is built from
		versions: {
			type: Array,
			required: true,
		},
		// versions that couldn't be parsed only exist while importing
		showUnparsed: {
			type: Boolean,
			required: false,
			default: false,
		},
		color: {
			type: String,
			required: false,
			default: "primary",
		},
	},
	emits: ["input"],
	computed: {
		minecraftVersions() {
			return minecraftVersionsOf(this.versions);
		},
	},
	methods: {
		update(patch) {
			this.$emit("input", { ...this.value, ...patch });
		},
	},
};
</script>
