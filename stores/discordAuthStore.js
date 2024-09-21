import axios from "axios";
import { defineStore } from "pinia";

/** Base store to handle logins and Discord tokens */
export const discordAuthStore = defineStore("discordAuth", {
	state: () => ({
		/** @type {string} */
		apiURL: undefined,
		/** @type {string} */
		access_token: undefined,
		/** @type {string} */
		refresh_token: undefined,
		/** @type {Date} */
		expires_at: undefined,
	}),
	getters: {
		discordAuthURL: ({ apiURL }) => `${apiURL}/auth/discord/webapp`,
		discordRefreshURL: ({ apiURL }) => `${apiURL}/auth/discord/refresh`,
	},
	actions: {
		parseSearchParams(search) {
			const params = new URLSearchParams(search);

			return {
				access_token: params.get("access_token"),
				refresh_token: params.get("refresh_token"),
				expires_at: this.expiryDurationToTime(params.get("expires_in")),
			};
		},
		parseLocalStorage(storedAuth) {
			if (storedAuth === null) return null;

			let auth;
			try {
				auth = JSON.parse(storedAuth);
			} catch (err) {
				console.error(err);
				return null;
			}

			if (!auth || !auth.expires_at) return null;
			return auth;
		},
		isAuthExpired(auth) {
			return new Date() > new Date(auth.expires_at);
		},
		isValidAuth(auth) {
			return auth && auth.access_token;
		},
		expiryDurationToTime(duration) {
			return new Date(new Date().getTime() + duration * 1000 - 60000);
		},
		async refreshLogin(auth = undefined) {
			if (auth === undefined) auth = this.$state;

			const json = await axios
				.post(this.discordRefreshURL, {
					refresh_token: auth.refresh_token,
				})
				.then((res) => res.data);

			return {
				access_token: json.access_token,
				refresh_token: json.refresh_token,
				expires_at: this.expiryDurationToTime(json.expires_in),
			};
		},
		logout() {
			const apiURL = this.$state.apiURL;
			this.$reset(); // ! Very important to reset all stores
			this.$patch({
				apiURL,
				access_token: this.$state.access_token,
			});
		},
		/** @returns {Promise<boolean>} whether the user is now logged in */
		tryLogin(search, storedAuth) {
			// api returns tokens through search params, so prioritize those for login
			let auth = this.parseSearchParams(search);

			// nothing in search params, try localstorage
			if (!this.isValidAuth(auth)) auth = this.parseLocalStorage(storedAuth);

			// both api and localstorage auth tried, user is definitely not logged in at this point
			if (!this.isValidAuth(auth)) return Promise.resolve(false);

			const lastLogin = this.isAuthExpired(auth) ? this.refreshLogin(auth) : Promise.resolve(auth);

			// for some reason this doesn't work with async/await
			return lastLogin.then((auth) => {
				this.$patch({
					access_token: auth.access_token,
					refresh_token: auth.refresh_token,
					expires_at: auth.expires_at,
				});
				return true;
			});
		},
	},
});
