import axios from "axios";
import { defineStore } from "pinia";

/** Handle Discord integration using tokens from the auth store */
export const discordUserStore = defineStore("discordUser", {
	state: () => ({
		discordUserURL: "https://discord.com/api/users/@me",
		/** @type {string} */
		discordId: undefined,
		/** @type {string} */
		discordAvatar: undefined,
		/** @type {string} */
		discordBanner: undefined,
		discordName: "",
	}),

	actions: {
		params(newDiscordUserURL) {
			this.$patch({
				discordUserURL: newDiscordUserURL || this.discordUserURL,
			});
		},
		async getInfo(accessToken) {
			const res = await axios.get(this.discordUserURL, {
				headers: { authorization: `Bearer ${accessToken}` },
			});
			return res.data;
		},
		watchDiscordAuth(authStore, onError) {
			// https://pinia.vuejs.org/core-concepts/state.html#Subscribing-to-the-state
			authStore.$subscribe((mutation) => {
				if (mutation.type === "patch function") return;

				const auth = authStore.$state;

				// logged out
				if (auth.access_token === undefined) return this.$reset();

				this.getInfo(auth.access_token)
					.then((json) => {
						this.$patch({
							discordId: json.id,
							discordAvatar:
								json.avatar !== null
									? `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}?size=1024`
									: null,
							discordBanner:
								json.banner != null
									? `https://cdn.discordapp.com/banners/${json.id}/${json.banner}?size=1024`
									: "https://database.faithfulpack.net/images/branding/backgrounds/forest.png",
							discordName:
								json.discriminator != 0
									? `${json.username}#${json.discriminator}`
									: json.global_name,
						});
					})
					.catch((...args) => {
						onError(...args);
					});
			});
		},
	},
});
