<template>
	<dashboard-card
		:title="''"
		id="faithful-card"
		class="d-flex flex-column"
		:style="{ display: show ? 'inherit' : 'none !important' }"
	>
		<v-card-text class="pt-1 pb-3 d-flex flex-column justify-space-between flex-grow-1">
			<div class="text-center">
				<v-img
					class="mx-auto"
					aspect-ratio="1"
					max-width="100%"
					width="200px"
					src="https://database.faithfulpack.net/images/branding/logos/transparent/512/plain_logo.png"
				/>
			</div>

			<div class="mt-2 mx-auto" id="connect-title">
				<h2 class="faithful-font uppercased-unsized text-center text--primary">
					{{ $root.lang("global.name") }}
				</h2>

				<div class="font-weight-light text--secondary text-center">
					<a href="https://twitter.com/faithfulpack" target="href">@FaithfulPack</a>
				</div>
			</div>

			<v-btn
				id="login-button"
				class="text-center d-flex justify-center align-center rounded-lg pa-3 mb-2 blurple"
				:href="this.$root.discordAuth.discordAuthURL"
			>
				{{ $root.lang().global.login }}
			</v-btn>
		</v-card-text>
	</dashboard-card>
</template>

<script>
const DashboardCard = () => import("./dashcard.vue");

export default {
	name: "faithful-card",
	components: {
		DashboardCard,
	},
	props: {
		show: {
			required: true,
		},
	},
};
</script>
