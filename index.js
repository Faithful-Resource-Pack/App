import Vue from "vue";
import VueRouter from "vue-router";
import Vuetify from "vuetify";
import VueCalendarHeatmap from "vue-calendar-heatmap";

import axios from "axios";
import moment from "moment";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { createPinia } from "pinia";

// dynamic import because vite, used for fallback translation
const { default: en_US } = await import("./resources/strings/en_US.js");

import { discordAuthStore } from "./stores/discordAuthStore.js";
import { discordUserStore } from "./stores/discordUserStore.js";
import { appUserStore } from "./stores/appUserStore.js";

// sidebar and routing stuff
import ALL_TABS from "@helpers/tabs.js";
import MissingPage from "./pages/404/main.vue";

Vue.config.devtools = import.meta.env.MODE === "development";
Vue.use(Vuetify);
Vue.use(VueRouter);
// package can't import individual components for some reason (even though it's used in ONE PLACE)
Vue.use(VueCalendarHeatmap);

const pinia = createPinia();
Vue.use(pinia);

// add injected methods to entire webapp
import "@helpers/utilityMethods.js";

/**
 * PWA REGISTRATION
 */

if ("serviceWorker" in navigator) {
	navigator.serviceWorker.register("/service-worker.js").catch((err) => {
		console.error("Failed to register PWA Service Worker:", err);
	});
}

/**
 * LANGUAGES
 */

// https://www.techonthenet.com/js/language_tags.php
const AVAILABLE_LANGS = Object.entries(import.meta.glob("/resources/strings/*.js")).map(
	([path, _init]) => {
		const name = path.split("/").pop().split(".")[0];
		return {
			id: name.includes("en") ? "en" : name.slice(-2).toLowerCase(),
			// import is a keyword, this was the next closest thing I could think of lol
			init: () => _init().then((res) => res.default),
			bcp47: name.replace("_", "-"),
			file: path,
			iso3166: name.split("_")[1].toLowerCase(),
		};
	},
);

// language objects are lazy loaded only when requested
const LOADED_LANGS = {
	en: en_US,
};

const LANG_KEY = "lang";
const LANG_DEFAULT = "en";
const _get_lang = () => {
	const storedLang = localStorage.getItem(LANG_KEY);
	if (!storedLang) return LANG_DEFAULT;
	return AVAILABLE_LANGS.some((e) => storedLang === e.id) ? storedLang : LANG_DEFAULT;
};

/**
 * ROUTING
 */

const AUTH_STORAGE_KEY = "auth";
const MENU_KEY = "menu_key";
const MENU_DEFAULT = false;

/** @type {import("vue-router").RouteConfig[]} */
const missingRoute = { path: "*", name: "404", component: MissingPage };

const router = new VueRouter({
	mode: "history",
});

router.beforeEach((to, _from, next) => {
	Vue.nextTick(() => {
		if (to.name) document.title = `${to.name} - Faithful Web Application`;
		else document.title = "Faithful Web Application";
	});
	// redirect to dashboard if base url
	if (to.fullPath === "/") {
		next("/dashboard");
		return;
	}
	// replace hash router (legacy urls) with history router
	if (["/#", "/?#"].some((v) => to.fullPath.startsWith(v))) {
		const path = to.fullPath.replace("/#", "").replace("/?#", "");
		next(path);
		return;
	}

	next();
});

// add all public routes
ALL_TABS.filter((t) => t.roles === undefined)
	.flatMap((t) => t.subtabs)
	.filter((s) => s.public)
	.flatMap((s) => s.routes)
	.forEach((r) => router.addRoute(r));

// add missing route last (prevents some weird fallback shenanigans)
router.addRoute(missingRoute);

window.apiURL = import.meta.env.VITE_API_URL;
// fix trailing slash
if (apiURL.endsWith("/")) window.apiURL = window.apiURL.slice(0, -1);

// set as global
window.settings = await axios
	.get(`${window.apiURL}/settings/raw`)
	.then((res) => res.data)
	.catch((err) => {
		console.error(err);
		// don't completely break the webapp if settings can't be fetched
		return {};
	});

/**
 * VUE INITIALIZATION
 */

const app = new Vue({
	el: "#app",
	data() {
		return {
			discordUser: discordUserStore(),
			discordAuth: discordAuthStore(),
			appUser: appUserStore(),
			badgeData: {},
			// incremented to force the lang() function to update (more granular than $forceUpdate)
			refreshLang: 0,
			selectedLang: _get_lang(),
			loadedLangs: LOADED_LANGS,
			availableLangs: AVAILABLE_LANGS,
			window: {
				width: window.innerWidth,
				height: window.innerHeight,
			},
			tabs: ALL_TABS.map((tab) => {
				tab.subtabs = tab.subtabs.map((s) => {
					s.to = s.routes[0].path;
					return s;
				});
				return tab;
			}),
			snackbar: {
				show: false,
				message: "",
				submessage: "",
				color: "#222",
				timeout: 4000,
				json: undefined,
			},
			drawerOpen: localStorage.getItem(MENU_KEY)
				? localStorage.getItem(MENU_KEY) === "true"
				: MENU_DEFAULT,
			theme: undefined,
			themes: {
				dark: "mdi-weather-night",
				system: "mdi-desktop-tower-monitor",
				light: "mdi-white-balance-sunny",
			},
			authListeners: [],
		};
	},
	methods: {
		/** log reactive object */
		log(...objs) {
			const cleaned = JSON.parse(JSON.stringify(objs));
			console.log(cleaned);
		},
		langToBCP47(lang) {
			return this.availableLangs.find((l) => l.id === lang)?.bcp47;
		},
		async loadLanguage(langName) {
			const langObj = this.availableLangs.find((l) => l.id === langName);
			if (!langObj) return;

			moment.locale(langObj.bcp47);

			// already cached, no need to load
			if (this.loadedLangs[langObj.id]) return;

			const strings = await langObj.init().catch((e) => {
				this.showSnackBar(e.toString(), "error");
			});
			this.loadedLangs[langObj.id] = Object.merge({}, en_US, strings || {});

			// wait until the data changes have pushed to refresh the lang function
			this.$nextTick(() => this.refreshLang++);
		},
		async loadBadge(cb, key) {
			if (!this.isAdmin) return;
			// use await to prevent sync callbacks not having a then() method
			const value = await cb(this);
			this.$set(this.badgeData, key, value);
			// since it's recursive you don't need setInterval
			return setTimeout(() => this.loadBadge(cb, key), 30000);
		},
		jsonSnackBar(json = undefined) {
			return {
				showSnackBar: (...allArgs) => {
					if (allArgs.length < 2) allArgs.push("#222");
					if (allArgs.length < 3) allArgs.push(4000);
					allArgs.push(json);

					return this.showSnackBar(...allArgs);
				},
			};
		},
		showSnackBar(message, color = "#222", timeout = 4000, json = undefined) {
			this.snackbar.submessage = "";
			if (typeof message === "string") {
				const newline = message.indexOf("\n");
				if (newline !== -1) {
					this.snackbar.message = `${message.substring(0, newline)}:`;
					this.snackbar.submessage = message.substring(newline + 1);
				} else {
					this.snackbar.message = message;
				}
			} else {
				this.snackbar.message = message?.message;

				if (message.response && message.response.data) {
					const submessage = message.response.data.error || message.response.data.message;
					this.snackbar.message += ":";
					this.snackbar.submessage = submessage;
				}
			}

			this.snackbar.json = json;
			this.snackbar.color = color;
			this.snackbar.timeout = timeout;
			this.snackbar.show = true;
		},
		logout() {
			this.discordAuth.logout();
		},
		/** For debugging in sub-components */
		checkPermissions() {
			console.log(this.$route);
			console.log(this.$router.options.routes);
		},
		compiledMarkdown(rawText) {
			if (!rawText) return "";
			return DOMPurify.sanitize(marked(rawText));
		},
		addToken(data) {
			data.token = this.user.access_token;
			return data;
		},
		emitConnected() {
			this.authListeners.forEach((cb) => cb(this.user.access_token));
		},
		addAccessTokenListener(listener) {
			this.authListeners.push(listener);
			if (this.isLoggedIn) listener(this.user.access_token);
		},
		onMediaChange(isDark) {
			// only if system theme
			if (this.theme === "system") {
				this.$vuetify.theme.dark = isDark;

				// nice snackbar sentence
				const notify = this.lang().global.snackbar_system_theme;
				this.showSnackBar(
					notify.sentence.replace("%s", isDark ? notify.themes.dark : notify.themes.light),
					"success",
					2000,
				);
			}
		},
	},
	computed: {
		user() {
			return {
				access_token: this.discordAuth.access_token,
				avatar: this.discordUser.discordAvatar,
				banner: this.discordUser.discordBanner,
				id: this.appUser.appUserId,
				username: this.appUser.appUsername || this.discordUser.discordName,
				roles: this.appUser.appUserRoles || [],
			};
		},
		apiURL() {
			if (
				Vue.config.devtools &&
				window.apiURL &&
				window.apiURL.includes("localhost") &&
				location.host !== "localhost"
			)
				return window.apiURL.replace("localhost", location.host.split(":")[0]);
			return window.apiURL;
		},
		apiOptions() {
			// can be adjusted with new auth values as needed
			return {
				headers: { discord: this.user.access_token },
			};
		},
		/**
		 * Check user perms & add (or not) tabs & routes following user perms
		 * @returns all tabs to be added in the html
		 */
		availableTabs() {
			// if there's no whitelisted roles assume it's available for everyone
			return this.tabs
				.filter((tab) => !tab.roles || tab.roles.some((role) => this.userRoles.includes(role)))
				.map((tab) => {
					tab.labelText = this.lang().global.tabs[tab.label]?.title;
					tab.subtabs = tab.subtabs.map((subtab) => {
						subtab.labelText = this.lang().global.tabs[tab.label]?.subtabs[subtab.label];
						return subtab;
					});
					return tab;
				});
		},
		/**
		 * Tell if the user is logged in
		 */
		isLoggedIn() {
			return this.user && this.user.id && this.user.id !== undefined;
		},
		/**
		 * Tell if the user has administrator permissions (manager/dev)
		 */
		isAdmin() {
			// if not logged in
			if (!this.isLoggedIn) return false;

			// if user not loaded
			if (!this.user) return false;

			// check roles
			return this.user.roles.includes("Administrator");
		},
		/**
		 * Get user's roles in real time
		 * @returns user discord roles
		 */
		userRoles() {
			return this.user.roles;
		},
		langBCP47() {
			return this.langToBCP47(this.selectedLang);
		},
		lang() {
			// add refreshLang to the vue effect subscription by mentioning it
			this.refreshLang;

			// use computed value since we can cache the strings
			const allStrings = this.loadedLangs[this.selectedLang] || Object.values(this.loadedLangs)[0];
			return (path, raw = false) => {
				// no path, return all strings
				if (!path) return allStrings;

				// traverse object using path string
				const selectedData = path.split(".").reduce((acc, cur) => acc?.[cur], allStrings);

				// warns user if string not found
				if (selectedData === undefined)
					console.warn(`Cannot find ${raw ? "data" : "string"} for "${path}"`);

				// if raw we can use whatever's there (for partial paths)
				if (raw) return selectedData;

				// Force return type to prevent undefined breaking string methods
				return String(selectedData);
			};
		},
		isDark() {
			return this.$vuetify.theme.dark;
		},
		shortUsername() {
			const username = this.user.username;
			if (username.length < 15) return username;
			return `${username.slice(0, 15)}…`;
		},
		bannerStyles() {
			// MUST be done through css, using an image element does strange things with the padding
			const DEFAULT_IMAGE =
				"https://database.faithfulpack.net/images/branding/backgrounds/main_background.png?w=320";
			return {
				backgroundImage: `url(${this.user.banner || DEFAULT_IMAGE})`,
				backgroundPosition: "center",
				backgroundSize: "cover",
			};
		},
		monochromeLogo() {
			const filename = this.isDark ? "white" : "black";
			return `https://database.faithfulpack.net/images/branding/logos/transparent/hd/${filename}.png`;
		},
	},
	watch: {
		selectedLang: {
			handler(newValue) {
				localStorage.setItem(LANG_KEY, newValue);
				// load new language if it exists
				if (!Object.keys(this.loadedLangs).includes(newValue)) return this.loadLanguage(newValue);

				moment.locale(this.langBCP47);

				// forces this.lang to update
				this.refreshLang++;
			},
			immediate: true,
		},
		theme: {
			handler(n) {
				const availableThemes = Object.keys(this.themes);
				if (n === undefined) {
					let theme = localStorage.getItem("THEME");

					// input validation
					if (!this.themes[theme]) theme = availableThemes[0];

					this.theme = theme;
					return;
				}
				if (!this.themes[n]) {
					this.theme = availableThemes[0];
					return;
				}

				localStorage.setItem("THEME", String(n));
				const isDark =
					n !== "light" &&
					(n === "dark" || window.matchMedia("(prefers-color-scheme: dark)").matches);
				this.$vuetify.theme.dark = isDark;
			},
			immediate: true,
		},
		// alias for $vuetify.theme.dark
		isDark: {
			handler(n) {
				const arr = ["theme--light", "theme--dark"];
				if (n) arr.reverse();

				// handle css
				const html = document.querySelector("html");

				html.classList.add(arr[0]);
				html.classList.remove(arr[1]);
			},
			immediate: true,
		},
		drawerOpen(n) {
			// don't set preference on small screens (pointless)
			if (this.$vuetify.breakpoint.mobile) return;
			localStorage.setItem(MENU_KEY, String(n));
		},
		isLoggedIn(n) {
			if (!n) return;

			// add all routes with no role
			ALL_TABS.filter((t) => t.roles === undefined)
				.flatMap((t) => t.subtabs)
				// public routes are already added at this point
				.filter((s) => !s.public)
				.flatMap((s) => s.routes)
				.forEach((r) => router.addRoute(r));

			// add missing route last (prevents some weird fallback shenanigans)
			router.addRoute(missingRoute);
		},
		userRoles(n, o) {
			if (o === undefined || o.length === undefined) return;
			if (n.length === undefined) return;
			// only update routes based on your roles fetched (role list is longer)
			// leave if new role list is shorter or equal
			if (n.length <= o.length) return;

			// add all routes with matching roles
			const subtabs = ALL_TABS.filter((t) => {
				if (t.roles === undefined) return false;
				return t.roles.some((role) => n.includes(role));
			})
				.flatMap((t) => t.subtabs)
				.filter((s) => !s.public);

			subtabs.forEach((s) => {
				if (s.badge) this.loadBadge(s.badge, s.label);
			});

			subtabs.flatMap((s) => s.routes).forEach((r) => router.addRoute(r));

			// add missing route last (prevents some weird fallback shenanigans)
			router.addRoute(missingRoute);
		},
	},
	created() {
		moment.locale(this.langToBCP47(_get_lang()));

		this.discordAuth.apiURL = window.apiURL;
		this.discordAuth
			.tryLogin(location.search, localStorage.getItem(AUTH_STORAGE_KEY))
			.then(() => {
				// remove query parameters after login
				if (new URLSearchParams(location.search).has("access_token")) {
					location.search = "";
				}
			})
			.catch((err) => this.showSnackBar(err, "error", 3000));

		this.discordUser.watchDiscordAuth(this.discordAuth, (err) =>
			this.showSnackBar(err, "error", 3000),
		);
		this.appUser.watchDiscordAuth(this.discordAuth, this.apiURL, (err) =>
			this.showSnackBar(err, "error", 3000),
		);

		this.discordAuth.$subscribe(() => {
			if (this.discordAuth.access_token === undefined) {
				// remove
				localStorage.removeItem(AUTH_STORAGE_KEY);
				this.emitConnected();
			} else {
				if (Vue.config.devtools) console.log(`Discord Token: ${this.discordAuth.access_token}`);
				// persist
				localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.discordAuth.$state));
				setTimeout(
					() => this.discordAuth.refreshLogin(),
					new Date(this.discordAuth.expires_at).getTime() - new Date().getTime(),
				);
			}
		});
	},
	mounted() {
		// watch color schemes for light and dark
		window.matchMedia("(prefers-color-scheme: dark)").onchange = (ev) => {
			if (ev.matches) this.onMediaChange(true);
		};
		window.matchMedia("(prefers-color-scheme: light)").onchange = (ev) => {
			if (ev.matches) this.onMediaChange(false);
		};
		window.addEventListener("resize", () => {
			this.window.width = window.innerWidth;
			this.window.height = window.innerHeight;
		});
	},
	// plugins
	router,
	vuetify: new Vuetify({
		theme: {
			dark: true,
			themes: {
				dark: {
					primary: "#76C945",
					accent: "#5e3631",
					success: "#22a831",
				},
				light: {
					primary: "#76C945",
					accent: "#af0b51",
					success: "#22a831",
				},
			},
		},
	}),
});

if (Vue.config.devtools) window.app = app;
