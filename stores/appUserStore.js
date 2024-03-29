import { defineStore } from "pinia";

export const appUserStore = defineStore("appUser", {
	state: () => ({
		appUserId: undefined,
		appUserRoles: undefined,
	}),

	actions: {
		getUser(rootApiURL, accessToken) {
			return fetch(`${rootApiURL}/users/profile`, {
				method: "GET",
				headers: {
					discord: accessToken,
				},
			}).then(async (response) => {
				if (response.status === 200) {
					return response.json();
				} else {
					const json = await response.json();
					return Promise.reject(json);
				}
			});
		},
		getOrCreateUser(rootApiURL, accessToken) {
			return fetch(`${rootApiURL}/users/newprofile`, {
				method: "POST",
				headers: {
					discord: accessToken,
				},
			}).then(async (response) => {
				if (response.status === 200) {
					return response.json();
				} else {
					const json = await response.json();
					return Promise.reject(json);
				}
			});
		},
		watchDiscordAuth(store, rootApiURL, onError) {
			// https://pinia.vuejs.org/core-concepts/state.html#subscribing-to-the-state
			store.$subscribe((mutation) => {
				if (mutation.type === "patch function") return;

				const auth = store.$state;

				if (auth.access_token === undefined) {
					this.$reset();
					this.$patch({
						appUserId: this.$state.appUserId,
					});
					return;
				}

				return this.getOrCreateUser(rootApiURL, auth.access_token)
					.then((data) => {
						this.$patch({
							appUserId: data.id,
							appUserRoles: data.roles,
						});
						// console.log(this.$state)
						return; // void
					})
					.catch((...args) => {
						onError(...args);
					});
			});
		},
	},
});
