const discordAuthStore = Pinia.defineStore("discordAuth", {
  state: () => ({
    apiURL: undefined,
    access_token: undefined,
    refresh_token: undefined,
    expires_at: undefined,
  }),

  getters: {
    discordAuthURL: function() {
      return `${this.$state.apiURL}/auth/discord/webapp`
    },
    discordRefreshURL: function() {
      return `${this.$state.apiURL}/auth/discord/refresh`
    },
  },

  actions: {
    verifySearchParams(search) {
      const urlSearchParams = new URLSearchParams(search);
      const auth = Object.fromEntries(urlSearchParams.entries());

      // [present, auth]
      return [
        "access_token" in auth,
        {
          access_token: auth.access_token,
          refresh_token: auth.refresh_token,
          expires_at: this.expiryDurationToTime(auth.expires_in),
        },
      ];
    },
    verifyLocalStorage(storedAuth) {
      if (storedAuth === null) return [false, undefined, undefined];

      let auth = undefined;
      try {
        auth = JSON.parse(storedAuth);
      } catch (error) {
        console.log(storedAuth);
        return [false, undefined, undefined];
      }

      if (!auth.expires_at) return [false, undefined, undefined];

      const expires_at = new Date(auth.expires_at);
      if (new Date() > expires_at) return [true, true, undefined];

      // [present, outdated, auth]
      return [true, false, auth];
    },
    expiryDurationToTime(duration) {
      return new Date(new Date().getTime() + duration * 1000 - 60000);
    },
    refreshLogin(auth = undefined) {
      if (auth === undefined) auth = this.$state;

      return fetch(this.$state.apiURL + "/auth/discord/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: auth.refresh_token,
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          return {
            access_token: json.access_token,
            refresh_token: json.refresh_token,
            expires_at: this.expiryDurationToTime(json.expires_in),
          };
        });
    },
    logout() {
      const apiURL = this.$state.apiURL;
      this.$reset(); // ! Very important to reset all stores
      this.$patch({
        apiURL,
        access_token: this.$state.access_token,
      });
    },

    begin(search, storedAuth) {
      const res = this.verifySearchParams(search);
      let has_auth_query_params = res[0];
      let auth = res[1];
      let expired = false;

      if (!has_auth_query_params) {
        [has_auth_query_params, expired, auth] = this.verifyLocalStorage(storedAuth);
      }

      if (!has_auth_query_params) {
        return Promise.reject(new Error("No auth method provided"));
      }

      let lastLogin = expired ? this.refreshLogin(auth) : Promise.resolve(auth);

      return lastLogin.then((auth) => {
        this.$patch({
          access_token: auth.access_token,
          refresh_token: auth.refresh_token,
          expires_at: auth.expires_at,
        });
        // console.log(this.$state)
        return; // void
      });
    },
  },
});
