<template>
	<texture-tooltip
		:label="`${texture.namespace} - #${texture.texture.id}`"
		:title="filename"
		:tags="tags"
	>
		<template v-if="contribution">
			<p>
				<v-icon small>{{ icon }}</v-icon>
				{{ authors }}
			</p>
			<p>
				<v-icon small>mdi-calendar</v-icon>
				{{ date }}
			</p>
			<p v-if="contribution.inherited">
				<v-icon small>mdi-link-variant</v-icon>
				{{ $root.lang().mods.gallery.vanilla_link.replace("%ID%", contribution.vanilla_id) }}
			</p>
		</template>
		<p v-else-if="packSelected">
			{{ $root.lang().gallery.error_message.contribution_not_found }}
		</p>
		<p v-else>
			<mod-icon :src="mod.icon" :size="16" class="mr-1" />
			{{ mod.name }}
		</p>
	</texture-tooltip>
</template>

<script>
import ModIcon from "@components/mod-icon.vue";
import TextureTooltip from "@components/texture-tooltip.vue";

export default {
	name: "mod-texture-tooltip",
	components: { ModIcon, TextureTooltip },
	props: {
		mod: {
			type: Object,
			required: true,
		},
		texture: {
			type: Object,
			required: true,
		},
		// contribution of the selected pack for this texture, if any
		contribution: {
			type: Object,
			required: false,
			default: undefined,
		},
		packSelected: {
			type: Boolean,
			required: false,
			default: false,
		},
		userIDtoName: {
			type: Function,
			required: true,
		},
	},
	computed: {
		// folders are left out, they take too much space
		filename() {
			return this.texture.path.split("/").pop();
		},
		authors() {
			return (
				this.contribution.authors
					// nbsp so users with spaces don't get wrapped
					.map((id) => this.userIDtoName(id).replace(/\s/gm, " "))
					.join(", ")
			);
		},
		tags() {
			const { width, height, animated } = this.texture.texture;
			const tags = [`${width}×${height}`];
			if (animated) tags.push(this.$root.lang().mods.gallery.animated);
			return tags;
		},
		date() {
			return this.$root.formatDate(this.contribution.date);
		},
		icon() {
			return this.contribution.authors.length === 1 ? "mdi-account" : "mdi-account-multiple";
		},
	},
};
</script>
