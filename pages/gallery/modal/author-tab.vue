<template>
	<div>
		<template v-for="{ category, packs } in authorCategories">
			<div class="gallery-info">
				<h2>{{ category }}</h2>
				<div class="double-table">
					<div v-for="pack in packs">
						<div class="title text-button text--secondary">
							{{ packToName[pack] }}
						</div>
						<v-data-table
							dense
							:headers="headers"
							:items="getContributions(pack)"
							class="elevation-1"
							style="margin-top: 10px"
							hide-default-footer
							disable-pagination
							:no-data-text="$root.lang().gallery.modal.no_contributions"
						/>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script>
import moment from "moment";

export default {
	name: "author-tab",
	props: {
		packToName: {
			type: Object,
			required: true,
		},
		contributions: {
			type: Array,
			required: true,
		},
		contributors: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			authorCategories: [
				{
					category: "Faithful",
					packs: ["faithful_32x", "faithful_64x"],
				},
				{
					category: "Classic Faithful Jappa",
					packs: ["classic_faithful_32x", "classic_faithful_64x"],
				},
				{
					category: "Classic Faithful Programmer Art",
					packs: ["classic_faithful_32x_progart"],
				},
			],
			headers: [
				{
					text: this.$root.lang().gallery.modal.data.contribution_id,
					value: "id",
				},
				{
					text: this.$root.lang().gallery.modal.data.date,
					value: "date",
				},
				{
					text: this.$root.lang().gallery.modal.data.authors,
					value: "contributors",
				},
			],
		};
	},
	methods: {
		formatPathVersions(versions) {
			if (versions.length === 1) return versions[0];
			return `${versions[0]} – ${versions[versions.length - 1]}`;
		},
		discordIDtoName(d) {
			return this.contributors[d]
				? this.contributors[d].username || this.$root.lang().gallery.error_message.user_anonymous
				: this.$root.lang().gallery.error_message.user_not_found;
		},
		timestampToDate(t) {
			return moment(new Date(t)).format("ll");
		},
		getContributions(pack) {
			return this.contributions
					.filter((el) => pack === el.pack)
					.sort((a, b) => b.date - a.date)
					.map((el) => ({
						id: el.id,
						date: this.timestampToDate(el.date),
						contributors: el.authors.map((el) => this.discordIDtoName(el)).join(",\n"),
					}));
		}
	},
	computed: {
		packs() {
			return this.authorCategories.map((v) => v.packs).flat();
		},
	},
};
</script>
