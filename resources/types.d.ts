// even though this project doesn't use typescript, this still adds intellisense in JS templates
// https://v2.vuejs.org/v2/guide/typescript.html#Augmenting-Types-for-Use-with-Plugins

import Vue from "vue";
import strings from "./strings/en_US.js";
import type { AxiosRequestConfig, AxiosResponse } from "axios";

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

	// inject methods being used
	interface Vue {
		apiURL: string;
		apiOptions: AxiosRequestConfig;
		user: DiscordUser;
		urlRegex: RegExp;
		isUserLogged: boolean;
		isAdmin: boolean;
		isDark: boolean;

		lang(): typeof strings;
		lang(key: string): string;
		jsonSnackBar(json?: string): any;
		showSnackBar(
			message: string | AxiosResponse,
			color?: string,
			timeout?: number,
			json?: any,
		): void;
		logout(): void;
		compiledMarkdown(rawText: string): string;
		addAccessTokenListener(listener: (token: string) => any): void;

		// there's more methods but none of them are used publicly
	}
}

// add global methods
declare global {
	const colors: Record<string, Record<string, string>>;
	function colorToHex(color: string): string;

	declare function updatePageStyles(cmp: Vue): void;
	declare const settings: Record<string, any>;
	declare const apiURL: string;

	interface Window {
		eventBus: Vue;

		// aliases
		colors: typeof colors;
		colorToHex: typeof colorToHex;
		updatePageStyles: typeof updatePageStyles;
		settings: typeof settings;
		apiURL: typeof apiURL;
	}

	interface String {
		toTitleCase(): string;
	}

	interface ObjectConstructor {
		isObject(arg: any): arg is Object;
		merge(target: Object, ...sources: Object[]): Object;
	}
}
