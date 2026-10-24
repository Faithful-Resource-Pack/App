<template>
	<texture-tooltip :label="`#${texture.textureID}`" :title="texture.name" :tags="texture.tags">
		<!-- always show contributions even if a texture is ignored/modded -->
		<template v-if="lastContribution !== undefined">
			<p>
				<v-icon small>{{ icon }}</v-icon>
				{{ authors }}
			</p>
			<p>
				<v-icon small>mdi-calendar</v-icon>
				{{ date }}
			</p>
		</template>
		<!-- even in 16x the modded textures aren't by mojang -->
		<p v-else-if="modded">
			<v-icon small>mdi-wrench</v-icon>
			{{ $root.lang().gallery.tooltip.modded }}
		</p>
		<!-- there's no mdi mojang icon so this is a custom one -->
		<p v-else-if="mojang">
			<i class="icon-mojang-red" />
			{{ $root.lang().gallery.tooltip.mojang }}
		</p>
		<p v-else-if="ignored">
			<v-icon small>mdi-texture</v-icon>
			{{ $root.lang().gallery.tooltip.ignored }}
		</p>
		<p v-else>
			{{ $root.lang().gallery.error_message.contribution_not_found }}
		</p>
	</texture-tooltip>
</template>

<script>
import TextureTooltip from "@components/texture-tooltip.vue";

export default {
	name: "gallery-tooltip",
	components: { TextureTooltip },
	props: {
		texture: {
			type: Object,
			required: true,
		},
		mojang: {
			type: Boolean,
			required: true,
		},
		// passed as prop since you only need one request for every tooltip
		contributions: {
			type: Object,
			required: false,
			default: () => ({}),
		},
		discordIDtoName: {
			type: Function,
			required: true,
		},
		ignoreList: {
			type: Array,
			required: true,
		},
	},
	computed: {
		lastContribution() {
			return this.contributions[this.texture.textureID];
		},
		authors() {
			if (this.lastContribution === undefined) return "";
			return (
				this.lastContribution.authors
					// nbsp so users with spaces don't get wrapped
					.map((d) => this.discordIDtoName(d).replace(/\s/gm, "\u00A0"))
					.join(", ")
			);
		},
		date() {
			return this.$root.formatDate(this.lastContribution.date);
		},
		icon() {
			return this.lastContribution.authors.length === 1 ? "mdi-account" : "mdi-account-multiple";
		},
		// can be changed if we ever find a better way to handle this
		modded() {
			return this.texture.tags.includes("Modded");
		},
		ignored() {
			return this.ignoreList.some((el) => this.texture.url.includes(el));
		},
	},
};
</script>
