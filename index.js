import Vue from "vue";
import VueRouter from "vue-router";
import Vuetify from "vuetify";
import VueTippy, { TippyComponent } from "vue-tippy";
import { PrismEditor } from "vue-prism-editor";
import VueGraph from "vue-graph";
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

Vue.config.devtools = import.meta.env.MODE === "development";
Vue.use(Vuetify);
Vue.use(VueRouter);
Vue.use(VueGraph);
Vue.use(VueTippy);
Vue.use(VueCalendarHeatmap);
Vue.component("tippy", TippyComponent);
Vue.component("prism-editor", PrismEditor);

// pages used in navbar
import DashboardPage from "./pages/dashboard/main.vue";
import ProfilePage from "./pages/profile/main.vue";
import ContributorStatsPage from "./pages/contribution-stats/main.vue";
import GalleryPage from "./pages/gallery/main.vue";
import AddonSubmissionsPage from "./pages/addon/addon-submissions.vue";
import NewAddonPage from "./pages/addon/new-addon-form.vue";
import EditAddonPage from "./pages/addon/edit-addon-form.vue";
import ReviewAddonsPage from "./pages/review/main.vue";
import ReviewTranslationsPage from "./pages/translation/main.vue";
import PostListPage from "./pages/post/post-grid.vue";
import EditPostPage from "./pages/post/edit-post.vue";
import NewPostPage from "./pages/post/new-post.vue";
import ContributionPage from "./pages/contribution/main.vue";
import UsersPage from "./pages/users/main.vue";
import TexturePage from "./pages/texture/main.vue";
import PackPage from "./pages/pack/main.vue";
import SettingsPage from "./pages/settings/main.vue";
import MissingPage from "./pages/404/main.vue";

/**
 * PAGE STYLE DEFINITIONS
 */

window.colors = (
	await import("https://cdn.jsdelivr.net/npm/vuetify@2.6.4/lib/util/colors.min.js")
).default;

/** @param {string} color */
window.colorToHex = (color) => {
	const colorArr = color.trim().split(" ");

	try {
		colorArr[0] = colorArr[0].replace(/-./g, (x) => x[1].toUpperCase());
		if (colorArr.length > 1) colorArr[1] = colorArr[1].replace("-", "");
		return colors[colorArr[0]][colorArr.length > 1 ? colorArr[1] : "base"];
	} catch (error) {
		return "inherit";
	}
};

/** @param {Vue} page */
window.updatePageStyles = (page) => {
	if (!page.$el) return;
	page.$el.id ||= page.name;

	const pageId = page.$el.id;
	const hex = colorToHex(page.pageColor);

	page.pageStyles = `
	<style>
		html.theme--light,
		html.theme--light .colored,
		html.theme--light .colored *,
		html.theme--light .v-menu__content,
		html.theme--light .v-menu__content *,
		html.theme--light #${pageId},
		html.theme--light #${pageId} * {
			scrollbar-color: ${hex} #ffffffbb !important;
		}

		html.theme--dark,
		html.theme--dark .colored,
		html.theme--dark .colored *,
		html.theme--dark .v-menu__content,
		html.theme--dark .v-menu__content *,
		html.theme--dark #${pageId},
		html.theme--dark #${pageId} * {
			scrollbar-color: ${hex} #000000bb !important;
		}
	</style>`;
};

/**
 * ADDED METHODS
 */

Object.isObject = (item) => item && typeof item === "object" && !Array.isArray(item);

Object.merge = (target, ...sources) => {
	if (!sources.length) return target;
	const source = sources.shift();

	if (Object.isObject(target) && Object.isObject(source)) {
		for (const key in source) {
			if (Object.isObject(source[key])) {
				if (!target[key]) Object.assign(target, { [key]: {} });
				Object.merge(target[key], source[key]);
			} else Object.assign(target, { [key]: source[key] });
		}
	}

	return Object.merge(target, ...sources);
};

Object.equals = (x, y) => {
	// primitives
	if (x === y) return true;

	// if one is an object and one is an array they can't be equal
	if (!(Object.isObject(x) && Object.isObject(y)) && !(Array.isArray(x) && Array.isArray(y)))
		return false;

	// objects have to be same length
	if (Object.keys(x).length != Object.keys(y).length) return false;

	// if any property doesn't exist or isn't deep equal itself it can't be the same
	if (Object.values(x).some((prop) => !y.hasOwnProperty(prop) || !Object.equals(x[prop], y[prop])))
		return false;

	return true;
};

String.prototype.toTitleCase = function () {
	return this.split(/-|_| /g)
		.map((word) => word[0].toUpperCase() + word.slice(1))
		.join(" ");
};

String.urlRegex = new RegExp(
	"^(https?:\\/\\/)?" + // protocol
		"((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
		"((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
		"(\\:\\d+)?(\\/[-a-z\\d%_.~+@]*)*" + // port and path
		"(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
		"(\\#[-a-z\\d_]*)?$", // fragment locator
	"i",
);

/**
 * LANGUAGES
 */

// https://www.techonthenet.com/js/language_tags.php
/** @type {Record<string, () => Promise<Record<string,unknown>>} */
const LANGUAGES_MODULES_MAP = import.meta.glob("/resources/strings/*.js");
const LANGUAGES = Object.entries(LANGUAGES_MODULES_MAP).map(([e, action]) => {
	const name = e.split("/").pop().split(".")[0];
	return {
		lang: name.includes("en") ? "en" : name.slice(-2).toLowerCase(),
		action,
		bcp47: name.replace("_", "-"),
		file: e,
		iso3166: name.split("_")[1].toLowerCase(),
	};
});

const LANGS = {
	en: en_US,
};

const LANG_KEY = "lang";
const LANG_DEFAULT = "en";
const _get_lang = () => {
	const storedLang = localStorage.getItem(LANG_KEY);
	if (storedLang === null)
		// no key
		return LANG_DEFAULT;
	if (LANGUAGES.some((e) => storedLang === e.lang))
		// if trusted input value
		return storedLang;
	return LANG_DEFAULT;
};

const _set_lang = (val) => localStorage.setItem(LANG_KEY, val);

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

// `to` field in subtab will be the first route path
const ALL_TABS = [
	{
		label: "general",
		subtabs: [
			{
				enabled: true,
				icon: "mdi-view-dashboard",
				label: "dashboard",
				unlogged: true,
				// no name for dashboard (default page)
				routes: [{ path: "/dashboard", component: DashboardPage }],
			},
			{
				enabled: true,
				icon: "mdi-account",
				label: "profile",
				routes: [{ path: "/profile", component: ProfilePage, name: "Profile" }],
			},
			{
				enabled: true,
				icon: "mdi-chart-timeline-variant",
				label: "statistics",
				unlogged: true,
				routes: [
					{ path: "/contribution-stats", component: ContributorStatsPage, name: "Statistics" },
				],
			},
			{
				enabled: true,
				icon: "mdi-image-multiple",
				label: "gallery",
				unlogged: true,
				routes: [
					{
						path: "/gallery",
						redirect: "/gallery/java/faithful_32x/latest/all/",
					},
					{
						path: "/gallery/:edition/:pack/:version/:tag/:search*",
						component: GalleryPage,
						name: "Gallery",
					},
				],
			},
		],
	},
	{
		label: "addons",
		subtabs: [
			{
				enabled: true,
				icon: "mdi-folder-multiple",
				label: "submissions",
				routes: [
					{
						path: "/addons/submissions",
						component: AddonSubmissionsPage,
						name: "Add-on Submissions",
					},
				],
			},
			{
				enabled: true,
				icon: "mdi-upload",
				label: "upload",
				routes: [
					{ path: "/addons/new", component: NewAddonPage, name: "New Add-on" },
					{ path: "/addons/edit/:id", component: EditAddonPage, name: "Edit Add-on" },
				],
			},
		],
	},
	{
		label: "review",
		subtabs: [
			{
				enabled: true,
				icon: "mdi-puzzle",
				label: "addons",
				badge: "/addons/pending",
				routes: [{ path: "/review/addons", component: ReviewAddonsPage, name: "Add-on Review" }],
			},
			{
				enabled: true,
				icon: "mdi-translate",
				label: "translations",
				routes: [
					{
						path: "/review/translations",
						component: ReviewTranslationsPage,
						name: "Translations",
						beforeEnter() {
							location.href = "https://translate.faithfulpack.net/";
						},
					},
				],
			},
		],
		roles: ["Administrator"],
	},
	{
		label: "posts",
		subtabs: [
			{
				enabled: true,
				icon: "mdi-format-list-bulleted-square",
				label: "list",
				routes: [
					{
						path: "/posts/list",
						component: PostListPage,
						name: "All posts",
					},
				],
			},
			{
				enabled: true,
				icon: "mdi-post",
				label: "create",
				routes: [
					{
						path: "/posts/new",
						component: NewPostPage,
						name: "New post",
					},
					{
						path: "/posts/edit/:id",
						component: EditPostPage,
						name: "Edit post",
					},
				],
			},
		],
		roles: ["Administrator"],
	},
	{
		label: "database",
		subtabs: [
			{
				enabled: true,
				icon: "mdi-file-multiple",
				label: "contributions",
				routes: [{ path: "/contributions", component: ContributionPage, name: "Contributions" }],
			},
			{
				enabled: true,
				icon: "mdi-account-multiple",
				label: "users",
				routes: [
					{ path: "/users", redirect: "/users/all" },
					{ path: "/users/:role?/:name*", component: UsersPage, name: "Users" },
				],
			},
			{
				enabled: true,
				icon: "mdi-texture",
				label: "textures",
				routes: [
					{ path: "/textures", redirect: "/textures/all" },
					{ path: "/textures/:tag?/:name*", component: TexturePage, name: "Textures" },
				],
			},
			{
				enabled: true,
				icon: "mdi-cube",
				label: "packs",
				routes: [
					{ path: "/packs", redirect: "/packs/all" },
					{ path: "/packs/:tag?/", component: PackPage, name: "Packs" },
				],
			},
			{
				enabled: true,
				icon: "mdi-cog",
				label: "settings",
				routes: [{ path: "/settings", component: SettingsPage, name: "Settings" }],
			},
		],
		roles: ["Developer", "Administrator"],
	},
];

// add all tabs routes unlogged
ALL_TABS.filter((t) => t.roles === undefined)
	.map((t) => t.subtabs)
	.flat(1)
	.filter((s) => s.unlogged)
	.map((s) => s.routes)
	.flat(1)
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

const pinia = createPinia();
Vue.use(pinia);

/**
 * VUE INITIALIZATION
 */

const app = new Vue({
	router,
	el: "#app",
	data() {
		return {
			refreshKey: 0,
			discordUser: discordUserStore(),
			discordAuth: discordAuthStore(),
			appUser: appUserStore(),
			badges: {},
			colors,
			dark: undefined,
			vapiURL: window.apiURL,
			selectedLang: _get_lang(),
			langs: LANGS,
			// declared in main.js using node
			languages: LANGUAGES,
			window: {
				width: window.innerWidth,
				height: window.innerHeight,
			},
			tabs: ALL_TABS.map((tab) => ({
				...tab,
				subtabs: tab.subtabs.map((s) => {
					s.to = s.routes[0].path;
					return s;
				}),
			})),
			bg: "transparent",
			snackbar: {
				show: false,
				message: "",
				submessage: "",
				color: "#222",
				timeout: 4000,
				json: undefined,
			},
			drawer: localStorage.getItem(MENU_KEY)
				? localStorage.getItem(MENU_KEY) === "true"
				: MENU_DEFAULT,
			theme: undefined,
			themes: {
				dark: "mdi-weather-night",
				system: "mdi-desktop-tower-monitor",
				light: "mdi-white-balance-sunny",
			},
			atl: [],
		};
	},
	watch: {
		selectedLang: {
			handler(newValue, oldValue) {
				_set_lang(newValue);
				if (Object.keys(this.langs).includes(newValue)) {
					if (Object.keys(this.langs).includes(oldValue)) {
						moment.locale(this.langBCP47);

						// the next line would force this.lang to update
						this.refreshKey++;
					}
				} else {
					this.loadLanguage(newValue);
				}
			},
			immediate: true,
		},
		dark: {
			handler(n, o) {
				if (o == undefined) {
					const isDark = window.localStorage.getItem("DARK_THEME");
					this.dark = isDark === null ? true : isDark === "true";
					this.$vuetify.theme.dark = this.dark;
				} else {
					if (n === false || n === true) {
						this.$vuetify.theme.dark = n;
						window.localStorage.setItem("DARK_THEME", String(n));
					}
				}
			},
			immediate: true,
		},
		theme: {
			handler(n) {
				const availableThemes = Object.keys(this.themes);
				if (n == undefined) {
					let theme = window.localStorage.getItem("THEME");

					if (!availableThemes.includes(theme)) theme = availableThemes[0];

					this.theme = theme;
					return;
				}
				if (!availableThemes.includes(n)) {
					this.theme = availableThemes[0];
					return;
				}

				window.localStorage.setItem("THEME", String(n));
				const isDark =
					n != "light" &&
					(n == "dark" || window.matchMedia("(prefers-color-scheme: dark)").matches);
				this.$vuetify.theme.dark = isDark;
			},
			immediate: true,
		},
		isDark: {
			handler(n) {
				const arr = ["theme--light", "theme--dark"];
				if (n) arr.reverse();

				const html = document.querySelector("html");

				html.classList.add(arr[0]);
				html.classList.remove(arr[1]);
			},
			immediate: true,
		},
		drawer(n) {
			localStorage.setItem(MENU_KEY, String(n));
		},
		isUserLogged(n) {
			if (!n) return;

			// add all routes with no role
			ALL_TABS.filter((t) => t.roles === undefined)
				.map((t) => t.subtabs)
				.flat(1)
				.filter((s) => !s.unlogged)
				.map((s) => s.routes)
				.flat(1)
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
				.map((t) => t.subtabs)
				.flat(1)
				.filter((s) => !s.unlogged);

			subtabs.forEach((s) => {
				if (s.badge) this.loadBadge(s.badge);
			});

			subtabs
				.map((s) => s.routes)
				.flat(1)
				.forEach((r) => router.addRoute(r));

			// add missing route last (prevents some weird fallback shenanigans)
			router.addRoute(missingRoute);
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
				this.vapiURL &&
				this.vapiURL.includes("localhost") &&
				location.host !== "localhost"
			)
				return this.vapiURL.replace("localhost", location.host.split(":")[0]);
			return this.vapiURL;
		},
		apiOptions() {
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
		isDesktop() {
			return this.$vuetify.breakpoint.lgAndUp;
		},
		/**
		 * Tell if the user is logged
		 * @returns true if the user is logged
		 */
		isUserLogged() {
			return this.user && this.user.id && this.user.id !== undefined;
		},
		/**
		 * Tell if the user is an admin
		 * @returns true if user has admin role
		 */
		isAdmin() {
			// if not logged in
			if (!this.isUserLogged) return false;

			// if user not loaded
			if (!this.user) return false;

			// check roles
			return this.user.roles.includes("Administrator");
		},
		/**
		 * Get in real time the roles of a user
		 * @returns user discord roles
		 */
		userRoles() {
			return this.user.roles;
		},
		langBCP47() {
			return this.langToBCP47(this.selectedLang);
		},
		lang() {
			// just mentioning refreshKey
			this.refreshKey;

			// rest of the function that actually does the calculations and returns a value
			return (path, raw = false) => {
				let response = this.langs[this.selectedLang];

				// fallback to default when loading new language
				if (response === undefined) response = this.langs[Object.keys(this.langs)[0]];

				// if you didn't request a path then 0
				if (path === undefined) return response;

				const split = path.split(".");

				while (response !== undefined && split.length > 0) response = response[split.shift()];

				// warns user if string not found
				if (response === undefined)
					console.warn(`Cannot find ${raw ? "data" : "string"} for "${path}"`);

				// if raw we can use the object directly after
				if (raw) return response;

				// Shall send string to be chained with other string operations
				return String(response); // enforce string to ensure string methods used after
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
			// this MUST be done through css, using an image does some really strange things with the padding
			const DEFAULT_IMAGE =
				"https://database.faithfulpack.net/images/branding/backgrounds/forest.png?w=320";
			return {
				backgroundImage: `url(${this.user.banner || DEFAULT_IMAGE})`,
				backgroundPosition: "center",
				backgroundSize: "cover",
			};
		},
	},
	methods: {
		/** log reactive object */
		log(...objs) {
			const cleaned = JSON.parse(JSON.stringify(objs));
			console.log(cleaned);
		},
		langToBCP47(lang) {
			return LANGUAGES.find((l) => l.lang === lang)?.bcp47;
		},
		loadLanguage(language) {
			const lang = this.languages.find((l) => l.lang === language);
			if (!lang) return;

			moment.locale(lang.bcp47);

			if (this.langs[lang.lang]) {
				return; // everything will update
			}

			lang
				.action()
				.then((r) => {
					r = r.default;
					this.langs[lang.lang] = Object.merge({}, en_US, r);
					// we need to wait for this.langs to be updated
					this.$nextTick(() => {
						// the next line would force this.lang to update
						this.refreshKey++;
					});
				})
				.catch((e) => {
					this.showSnackBar(e.toString(), "error");
				});
		},
		loadBadge(url) {
			axios.get(this.apiURL + url, this.apiOptions).then((r) => {
				const res = r.data;
				let val;
				if (Array.isArray(res) && res.length) val = res.length;
				else if (res.length) val = res.length;
				else val = 0;

				this.$set(this.badges, url, val);
			});

			if (this.isAdmin) {
				setTimeout(() => {
					this.loadBadge(url);
				}, 15000);
			}
		},
		jsonSnackBar(json = undefined) {
			const that = this;
			return {
				showSnackBar() {
					const allArgs = [...arguments];
					if (allArgs.length < 2) allArgs.push("#222");
					if (allArgs.length < 3) allArgs.push(4000);
					allArgs.push(json);

					return that.showSnackBar(...allArgs);
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
			this.atl.forEach((lis) => lis(this.user.access_token));
		},
		addAccessTokenListener(listener) {
			this.atl.push(listener);
			if (this.isUserLogged) listener(this.user.access_token);
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
	beforeCreate() {
		pinia._a = this;
	},
	created() {
		moment.locale(this.langToBCP47(_get_lang()));

		this.discordAuth.apiURL = window.apiURL;
		this.discordAuth
			.tryLogin(location.search, localStorage.getItem(AUTH_STORAGE_KEY))
			.then((_isLogged) => {
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
				window.localStorage.removeItem(AUTH_STORAGE_KEY);
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
