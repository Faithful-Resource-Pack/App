<template>
	<dashboard-card id="faithful-card" class="d-flex flex-column">
		<v-card-text class="pt-1 pb-3 d-flex flex-column justify-space-between flex-grow-1">
			<div class="text-center">
				<v-img
					class="mx-auto"
					aspect-ratio="1"
					max-width="100%"
					width="200px"
					src="https://database.faithfulpack.net/images/branding/logos/transparent/hd/main_logo.png"
				/>
			</div>

			<div id="connect-title" class="mt-2 mx-auto">
				<h3 class="faithful-font uppercase-unsized text-center text--primary card-text-shadow">
					{{ $root.lang().global.name }}
				</h3>

				<div class="d-flex mt-3 justify-center">
					<v-btn
						v-for="listing in listings"
						:key="listing.name"
						:href="listing.href"
						target="_blank"
						class="text--secondary"
						icon
					>
						<v-icon>{{ listing.icon }}</v-icon>
					</v-btn>
				</div>
			</div>

			<v-btn
				id="login-button"
				class="text-center d-flex justify-center align-center rounded-lg pa-3 my-2 blurple"
				:href="$root.discordAuth.discordAuthURL"
			>
				{{ $root.lang().global.login }}
			</v-btn>
		</v-card-text>
	</dashboard-card>
</template>

<script>
import DashboardCard from "./dashboard-card.vue";

export default {
	name: "faithful-card",
	components: {
		DashboardCard,
	},
	data() {
		return {
			listings: [
				{ icon: "mdi-cube", href: "https://faithfulpack.net/news" },
				{ icon: "mdi-twitter", href: "https://twitter.com/faithfulpack" },
				{ icon: "mdi-reddit", href: "https://reddit.com/r/faithfulpack" },
				{ icon: "mdi-github", href: "https://github.com/faithful-resource-pack" },
			],
		};
	},
};
</script>
