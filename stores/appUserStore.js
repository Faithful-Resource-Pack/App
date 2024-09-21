import axios from "axios";
import { defineStore } from "pinia";

/** Handle Faithful API/database integration using tokens from the auth store */
export const appUserStore = defineStore("appUser", {
	state: () => ({
		/** @type {string} */
		appUserId: undefined,
		/** @type {string[]} */
		appUserRoles: undefined,
	}),
	actions: {
		getOrCreateUser(rootApiURL, accessToken) {
			// api requires a post request even though it's really not necessary
			return axios
				.post(`${rootApiURL}/users/newprofile`, null, {
					headers: {
						discord: accessToken,
					},
				})
				.then((res) => res.data);
		},
		watchDiscordAuth(authStore, rootApiURL, onError) {
			// https://pinia.vuejs.org/core-concepts/state.html#Subscribing-to-the-state
			authStore.$subscribe((mutation) => {
				if (mutation.type === "patch function") return;

				const auth = authStore.$state;

				// logged out
				if (auth.access_token === undefined) {
					this.$reset();
					this.$patch({
						appUserId: this.$state.appUserId,
					});
					return;
				}

				return this.getOrCreateUser(rootApiURL, auth.access_token)
					.then((data) => {
						return this.$patch({
							appUserId: data.id,
							appUserRoles: data.roles,
						});
					})
					.catch((...args) => {
						onError(...args);
					});
			});
		},
	},
});
