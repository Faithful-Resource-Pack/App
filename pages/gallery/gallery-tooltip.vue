<template>
	<div class="tooltip">
		<div class="texture-tooltip">
			<div class="texture-info-container">
				<span class="texture-id">#{{ texture.textureID }}</span>
				<h1 align="left" class="encased">{{ texture.name }}</h1>
				<div align="left" class="encased">
					<!-- always show contributions even if a texture is ignored/modded -->
					<template v-if="lastContribution !== undefined">
						<p>
							<v-icon small>{{ icon }}</v-icon> {{ lastContributionNames }}
						</p>
						<p>
							<v-icon small>mdi-clock-outline</v-icon> {{ timestampToDate(lastContribution.date) }}
						</p>
					</template>
					<!-- even in 16x the modded textures aren't by mojang -->
					<p v-else-if="modded">
						<v-icon small>mdi-wrench</v-icon> {{ $root.lang().gallery.tooltip.modded }}
					</p>
					<!-- there's no mdi mojang icon so this is a custom one -->
					<p v-else-if="mojang">
						<i class="icon-mojang-red"></i> {{ $root.lang().gallery.tooltip.mojang }}
					</p>
					<p v-else-if="ignored">
						<v-icon small>mdi-texture</v-icon> {{ $root.lang().gallery.tooltip.ignored }}
					</p>
					<p v-else>
						{{ $root.lang().gallery.error_message.contribution_not_found }}
					</p>
				</div>
			</div>
			<div class="texture-tags-container">
				<span class="encased" v-for="tag in texture.tags" :key="tag">{{ tag }}</span>
			</div>
		</div>
	</div>
</template>

<script>
import moment from "moment";

export default {
	name: "gallery-tooltip",
	props: {
		texture: {
			type: Object,
			required: true,
		},
		mojang: {
			type: Boolean,
			required: true,
		},
		contributions: {
			type: Object,
			required: true,
		},
		pack: {
			type: String,
			required: true,
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
			const contributions = this.contributions[this.pack]?.[this.texture.textureID];
			if (contributions !== undefined)
				return contributions.sort((a, b) => (a.date > b.date ? -1 : 1))?.[0];
		},
		lastContributionNames() {
			if (this.lastContribution === undefined) return "";
			return this.lastContribution.authors
				.map((d) => this.discordIDtoName(d).replace(/\s/gm, "\u00A0"))
				.join(", ");
		},
		icon() {
			if (this.lastContribution.authors.length === 1) return "mdi-account";
			return "mdi-account-multiple";
		},
		// can be changed if we ever find a better way to handle this
		modded() {
			return this.texture.tags.includes("Modded");
		},
		ignored() {
			return this.ignoreList.some((el) => this.texture.url.includes(el));
		},
	},
	methods: {
		timestampToDate(t) {
			return moment(new Date(t)).format("ll");
		},
	},
};
</script>
