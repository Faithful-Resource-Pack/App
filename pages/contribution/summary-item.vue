<template>
	<div>
		<v-list-item class="pl-2" @click.stop.prevent="() => $emit('select')">
			<v-list-item-content :class="selected ? 'primary--text' : ''">
				<v-list-item-title>{{ title }}</v-list-item-title>
				<v-list-item-subtitle class="text-truncate">
					<span v-if="contrib.authors && contrib.authors.length">
						{{ subtitle }}
					</span>
					<i v-else>{{ $root.lang().database.contributions.no_contributor_yet }}</i>
				</v-list-item-subtitle>
				<v-list-item-subtitle v-if="contrib.texture && contrib.texture.length">
					<v-chip
						class="mr-1 px-2"
						x-small
						v-for="range in contrib.texture"
						:key="formatRange(range)"
					>
						{{ formatRange(range) }}
					</v-chip>
				</v-list-item-subtitle>
			</v-list-item-content>

			<v-list-item-action>
				<v-icon color="red lighten-1" @click="$emit('delete')">mdi-trash-can</v-icon>
			</v-list-item-action>
		</v-list-item>
		<v-divider />
	</div>
</template>

<script>
import moment from "moment";

export default {
	name: "summary-item",
	props: {
		contrib: {
			type: Object,
			required: true,
		},
		selected: {
			type: Boolean,
			required: false,
			default: false,
		},
		packToName: {
			type: Object,
			required: true,
		},
		contributors: {
			type: Array,
			required: true,
		},
	},
	methods: {
		formatRange(range) {
			if (Array.isArray(range)) return `#${range.join(" – #")}`;
			return `#${range}`;
		},
	},
	computed: {
		title() {
			return `${this.packToName[this.contrib.pack]} • ${moment(new Date(this.contrib.date)).format("ll")}`;
		},
		subtitle() {
			const groupedContributors = this.contributors.reduce((acc, cur) => {
				acc[cur.id] = cur;
				return acc;
			}, {});

			const authorObjs = this.contrib.authors.map((author) => groupedContributors[author] || {});

			const knownAuthors = authorObjs.map((author) => author.username).filter((n) => n);
			const anonymousCount = authorObjs.filter((author) => !author.username).length;

			const total = knownAuthors.length + anonymousCount;

			if (anonymousCount > 0) {
				const anonymousStr = `${anonymousCount} ${this.$root.lang().database.anonymous}`;
				return `[${total}]: ${anonymousStr}, ${knownAuthors.join(", ")}`;
			}

			return `[${total}]: ${knownAuthors.join(", ")}`;
		},
	},
};
</script>
