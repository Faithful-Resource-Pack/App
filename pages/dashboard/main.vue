<template>
	<div id="dashboard-page" class="pa-2 py-sm-4 px-sm-6">
		<div class="text-h4 py-4">
			{{
				$root.user.username
					? $root.lang().dashboard.welcome_user.replace("%USER%", $root.user.username)
					: $root.lang().dashboard.welcome
			}}
		</div>

		<v-row id="dashboard-row">
			<v-col cols="12" sm="3">
				<profile-card v-if="$root.isLoggedIn" />
				<faithful-card v-else />
			</v-col>
			<v-col cols="12" sm="9">
				<user-card :colors="colors" />
			</v-col>
			<v-col cols="12" sm="6">
				<addon-card />
			</v-col>
			<v-col cols="12" sm="6">
				<contribution-stats-card ref="cs" />
			</v-col>
			<v-col cols="12" sm="12">
				<contribution-card
					:colors="colors"
					:statsListener="
						(t) => {
							$refs.cs.onTotals(t);
						}
					"
				/>
			</v-col>
		</v-row>
	</div>
</template>

<script>
import AddonCard from "./addon-card.vue";
import ProfileCard from "./profile-card.vue";
import UserCard from "./user-card.vue";
import ContributionCard from "./contribution-card.vue";
import ContributionStatsCard from "./contribution-stats-card.vue";
import FaithfulCard from "./faithful-card.vue";

export default {
	name: "dashboardPage",
	components: {
		AddonCard,
		ProfileCard,
		UserCard,
		ContributionCard,
		ContributionStatsCard,
		FaithfulCard,
	},
	computed: {
		colors() {
			// https://colordesigner.io/gradient-generator
			if (this.$root.isDark)
				return ["#1e1e1e", "#303c27", "#425d30", "#537f38", "#65a33f", "#76c945"];
			return ["#f0f0f0", "#b5dd9e", "#a6d889", "#97d374", "#87ce5d", "#76c945"];
		},
	},
};
</script>
