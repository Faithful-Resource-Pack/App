<template>
	<v-container
		style="
			display: flex;
			justify-content: center;
			align-items: center;
			height: 100%;
			flex-direction: column;
		"
	>
		<div class="text-center">
			<img
				src="https://database.faithfulpack.net/images/branding/logos/transparent/512/plain_logo.png"
				:style="{
					height: '256px',
					'image-rendering': 'pixelated',
				}"
			/>
			<h3 class="faithful-font uppercase-unsized">{{ $root.lang("reconnect.reconnecting") }}</h3>

			<v-progress-circular class="my-4" :size="70" :width="7" indeterminate color="primary" />

			<div id="reconnect-steps">
				<div v-for="step in reconnect_steps" :key="step">{{ step }}</div>
			</div>
		</div>
	</v-container>
</template>

<script>
import axios from "axios";
export default {
	name: "reconnect-page",
	data() {
		return {
			reconnect_steps: [],
		};
	},
	created() {
		const authStr = window.localStorage.getItem("auth");
		const auth = JSON.parse(authStr);
		const data = { refresh_token: auth.refresh_token };

		this.reconnect_steps.push(this.$root.lang("reconnect.refreshing_discord_token"));

		axios
			.post(this.$root.discordAuth.discordRefreshURL, data)
			.then((response) => {
				this.reconnect_steps.push(this.$root.lang("reconnect.dummy_step"));
				return response.data;
			})
			.then(async (json) => {
				console.log(json);
				this.reconnect_steps.push(this.$root.lang("reconnect.updating_profile_information"));

				await this.$root.tokenCallback(json, auth);

				return fetch("https://discord.com/api/users/@me", {
					headers: {
						authorization: `Bearer ${json.access_token}`,
					},
				});
			})
			.then((response) => {
				if (response.ok) return response.json();
				return Promise.reject(`Failed to update information`);
			})
			.then(async (json) => {
				auth.id = json.id;
				auth.avatar =
					json.avatar !== null
						? `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}?size=1024`
						: null;
				auth.banner =
					json.banner != null
						? `https://cdn.discordapp.com/banners/${json.id}/${json.banner}?size=1024`
						: "https://database.faithfulpack.net/images/branding/backgrounds/forest.png";
				auth.username =
					json.discriminator != 0 ? `${json.username}#${json.discriminator}` : json.global_name;

				await this.$root.tokenCallback(auth, auth);
			})
			.then(() => {
				// working but not perfect, will refresh page and reload $root.user with correct data
				window.location.href = window.location.origin;
			})
			.catch((err) => {
				console.error(err);
				this.$root.showSnackBar(err, "error");

				this.reconnect_steps.push(this.$root.lang("reconnect.updating_profile_information"));
				this.reconnect_steps.push(this.$root.lang("reconnect.updating_profile_information"));

				this.$root.logout();
			});
	},
};
</script>
