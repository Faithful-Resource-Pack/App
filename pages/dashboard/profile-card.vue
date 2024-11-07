<template>
	<dashboard-card
		:title="$root.lang('dashboard.titles.profile')"
		to="/profile"
		clickable
		class="d-flex flex-column"
	>
		<v-card-text v-if="user" class="pt-1 pb-3 d-flex flex-column justify-space-between flex-grow-1">
			<div v-if="user.roles.length === 0" />

			<div class="text-center">
				<v-list-item-avatar tile class="rounded-lg my-3 mr-0 primary" size="120">
					<v-img :src="user.avatar" v-if="user.avatar" />
					<div class="text-h5 text-center text--primary font-weight-medium" v-else>
						{{ user.username[0] }}
					</div>
				</v-list-item-avatar>
			</div>

			<div class="my-2">
				<div class="text-h5 text-center text--primary" id="user-username">
					{{ user.username }}
				</div>

				<div class="font-weight-light text--secondary text-center">
					{{ user.id }}
				</div>
			</div>

			<p
				class="text-center d-flex justify-center align-center rounded-lg pa-3 mb-0"
				v-if="user.roles.length"
			>
				<span>
					<template v-for="role in user.roles">
						{{ role }}
						<br />
					</template>
				</span>
			</p>
			<div v-else />
		</v-card-text>
	</dashboard-card>
</template>

<script>
import DashboardCard from "./dashboard-card.vue";

export default {
	name: "profile-card",
	components: {
		DashboardCard,
	},
	computed: {
		user() {
			return this.$root.user;
		},
	},
};
</script>
