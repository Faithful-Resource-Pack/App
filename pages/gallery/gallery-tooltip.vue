<template>
	<div class="tooltip">
		<div class="texture-tooltip">
			<div class="texture-info-container">
				<span class="texture-id" v-text="'#' + texture.textureID" />
				<h1 align="left" class="encased" v-text="texture.name" />
				<ul align="left" class="encased">
					<li v-if="modded">
						<i
							class="v-icon notranslate mdi mdi-wrench"
							style="font-size: 14px; margin-right: 0.2rem"
						></i>
						Modded texture
					</li>
					<li v-else-if="mojang"><i class="icon-mojang-red"></i> Mojang Studios</li>
					<li v-else-if="lastContribution !== undefined">
						<p><i :class="icon"></i> {{ lastContributionNames }}</p>
						<p><i class="icon-time"></i> {{ timestampToDate(lastContribution.date) }}</p>
					</li>
					<li v-else>
						{{ $root.lang("gallery.error_message.contribution_not_found") }}
					</li>
				</ul>
			</div>
			<div class="texture-tags-container">
				<span class="encased" v-for="tag in texture.tags">
					{{ `#${tag}` }}
				</span>
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
	},
	computed: {
		lastContribution() {
			const contributions = this.contributions[this.pack]?.[this.texture.textureID];

			if (contributions !== undefined)
				return contributions.sort((a, b) => (a.date > b.date ? -1 : 1))?.[0];
		},
		lastContributionNames() {
			if (this.lastContribution === undefined) return "";
			return this.lastContribution.contributors
				.map((d) => this.discordIDtoName(d).replace(/\s/gm, "\u00A0"))
				.join(", ");
		},
		icon() {
			if (this.lastContribution.contributors.length === 1) return "icon-people";
			// thank you material icons, very cool
			return "icon-peoples";
		},
		modded() {
			const somethingWithPath = this.texture.url;

			return ["assets/forge", "assets/fml", "assets/fabric", "assets/modmenu"].some((path) =>
				somethingWithPath.includes(path),
			);
		},
	},
	methods: {
		timestampToDate(t) {
			return moment(new Date(t)).format("ll");
		},
	},
};
</script>
