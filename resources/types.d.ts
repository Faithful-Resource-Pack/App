// even though this project doesn't use typescript, this still adds intellisense in JS templates
// https://v2.vuejs.org/v2/guide/typescript.html#Augmenting-Types-for-Use-with-Plugins

import Vue from "vue";
import strings from "./strings/en_US.js";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type { RouteConfig } from "vue-router";

// Vue has the constructor type in types/vue.d.ts
declare module "vue/types/vue" {
	interface DiscordUser {
		access_token: string;
		avatar: string;
		banner: string;
		id: string;
		username: string;
		roles: string[];
	}

	type SnackBarCallback = (
		message: string | AxiosResponse,
		color?: string, // can be vuetify color also
		timeout?: number,
	) => void;

	// inject methods being used
	interface Vue {
		readonly selectedLang: string;
		readonly apiURL: string;
		readonly apiOptions: AxiosRequestConfig;
		readonly user: DiscordUser;
		readonly isLoggedIn: boolean;
		readonly isAdmin: boolean;
		readonly isDark: boolean;

		// log reactive vue object without all the ugly stuff
		log(...objs: any[]): void;
		lang(): Readonly<typeof strings>;
		lang(key: string): string;
		jsonSnackBar(json?: string): { showSnackBar: SnackBarCallback };
		showSnackBar: SnackBarCallback;
		logout(): void;
		compileMarkdown(rawText: string): string;
		addAccessTokenListener(listener: (token: string) => any): void;
		reloadSettings(): Promise<void>;

		// there's more methods but none of them are used publicly
	}
}

// add global methods
declare global {
	declare const settings: Record<string, any>;
	declare const apiURL: string;

	interface Window {
		readonly settings: typeof settings;
		readonly apiURL: typeof apiURL;
	}

	interface Array {
		/** Convert an array into a formatted string list */
		listify(): string;
	}

	interface String {
		/** Converts all words in a string to title case. */
		toTitleCase(): string;
	}

	interface StringConstructor {
		readonly urlRegex: RegExp;
	}

	interface ObjectConstructor {
		isObject(arg: any): arg is Object;
		/** Deep merge two objects (used for lang) */
		merge(target: Object, ...sources: Object[]): Object;
		/** Check if two objects are exactly equal */
		equals(x: Object, y: Object): boolean;
	}
}

interface SidebarTab {
	label: string;
	subtabs: SidebarSubtab[];
	// defaults to all public
	roles?: string[];
}

interface SidebarSubtab {
	// untranslated key (not actually used in UI)
	label: string;
	icon: string;
	// not included when false
	public?: true;
	disabled?: true;
	routes: RouteConfig[];
	// takes a vue instance and returns what to display in the badge
	// not done with `this` binding so arrow functions can be used
	badge?: (app: Vue) => any;
}
