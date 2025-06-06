<template>
	<dashboard-card
		:title="$root.lang().dashboard.titles.profile"
		to="/profile"
		clickable
		class="d-flex flex-column"
	>
		<v-card-text v-if="user" class="pt-1 pb-3 d-flex flex-column justify-space-between flex-grow-1">
			<div v-if="user.roles.length === 0" />

			<div class="text-center">
				<v-list-item-avatar
					tile
					:class="['rounded-lg', 'my-3', 'mr-0', user.avatar ? 'transparent' : 'primary']"
					size="120"
				>
					<v-img v-if="user.avatar" :src="user.avatar" />
					<div v-else class="text-h5 text-center text--primary font-weight-medium">
						{{ user.username[0] }}
					</div>
				</v-list-item-avatar>
			</div>

			<div class="my-2">
				<div id="user-username" class="text-h5 text-center text--primary mb-2">
					{{ user.username }}
				</div>

				<div class="text--secondary text-center">
					{{ user.id }}
				</div>
			</div>

			<p
				v-if="user.roles.length"
				class="text-center d-flex justify-center align-center flex-column rounded-lg pa-3 mb-0"
			>
				<span v-for="role in user.roles" :key="role">
					{{ role }}
					<br />
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
