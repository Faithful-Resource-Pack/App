const discordAuthStore = Pinia.defineStore('discordAuth', {
	state: () => ({
		access_token: undefined,
		refresh_token: undefined,
		expires_at: undefined,
		create_account: undefined,
	}),

	actions: {
		verifySearchParams: function(search) {
			const urlSearchParams = new URLSearchParams(search)
			const auth = Object.fromEntries(urlSearchParams.entries())

			// [present, auth]
			return ['access_token' in auth, {
				access_token: auth.access_token,
				refresh_token: auth.refresh_token,
				expires_at: this.expiryDurationToTime(auth.expires_in)
			}]
		},
		verifyLocalStorage: function(storedAuth) {
			if(storedAuth === null) return [false,undefined,undefined]

			let auth = undefined
			try {
				auth = JSON.parse(storedAuth)
			} catch (error) {
				console.log(storedAuth)
				return [false, undefined, undefined]
			}

			if (!auth.expires_at) return [false, undefined, undefined]

			const expires_at = new Date(auth.expires_at)
			if (new Date() > expires_at) return [true, true, undefined]

			// [present, outdated, auth]
			return [true, false, auth]
		},
		expiryDurationToTime: function(duration) {
			return new Date((new Date()).getTime() + (duration * 1000) - 60000)
		},
		refreshLogin: function(auth = undefined) {
			if(auth === undefined) auth = this.$state

			return fetch('/api/discord/refresh', {
				method: "POST",
				headers: {
				  "Content-Type": "application/json",
				},
				body: JSON.stringify({
					refresh_token: auth.refresh_token
				}),
			})
            .then(response => response.json())
			.then(json => {
				return {
					access_token: json.access_token,
					refresh_token: json.refresh_token,
					expires_at: this.expiryDurationToTime(json.expires_in)
				}
			})
		},
		logout: function() {
			this.$reset() // ! Very important to reset all stires
			this.$patch({
				access_token: this.$state.access_token
			})
		},

		begin: function(search, storedAuth) {
			let auth = undefined
			let present = false
			let expired = false

			const res = this.verifySearchParams(search)
			present = res[0]
			auth = res[1]
			const createAccount = present // create account if new auth from discord

			if(!present) {
				[present, expired, auth] = this.verifyLocalStorage(storedAuth)
			}

			if(!present) {
				return Promise.reject(new Error("No auth method provided"))
			}

			let lastLogin = expired ? this.refreshLogin(auth) : Promise.resolve(auth)

			return lastLogin.then((auth) => {
				this.$patch({
					access_token: auth.access_token,
					refresh_token: auth.refresh_token,
					expires_at: auth.expires_at,
					create_account: createAccount
				})
				// console.log(this.$state)
				return // void
			})
		}
	}
})

