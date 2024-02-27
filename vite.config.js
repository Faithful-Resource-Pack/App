import vue from "@vitejs/plugin-vue2";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	return {
		plugins: [vue()],
		// custom port instead of 5173 always
		preview: {
			port: env.PORT,
		},
		server: {
			port: env.PORT,
		},
		optimizeDeps: {
			esbuildOptions: {
				target: "esnext",
			},
		},
		build: {
			target: "esnext",
		},
		resolve: {
			alias: {
				vue: "vue/dist/vue.esm.js",
			},
		},
		define: {
			apiURL: JSON.stringify(env.API_URL),
			DEV: JSON.stringify(env.DEV),
			env: {
				DISCORD_USER_URL: JSON.stringify(env["DISCORD_USER_URL"] || undefined),
			},
		},
	};
});
