import vue from "@vitejs/plugin-vue2";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	/** @type{import('vite').UserConfig}*/
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
				// stupid fix for vite/vue interop
				vue: "vue/dist/vue.esm.js",
			},
		},
	};
});
