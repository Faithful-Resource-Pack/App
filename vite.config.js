import vue from "@vitejs/plugin-vue2";
import { fileURLToPath } from "url";
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
			chunkSizeWarningLimit: 1000,
			rollupOptions: {
				output: {
					manualChunks: {
						vue_core: [
							"vue",
							"vue-router",
							"vue-calendar-heatmap",
							"vue-prism-editor",
							"vue-tippy",
						],
						// biggest dependencies get separate files
						vue_graph: ["vue-graph"],
						vuetify: ["vuetify"],
					},
				},
			},
		},
		resolve: {
			alias: {
				// stupid fix for vite/vue interop
				vue: "vue/dist/vue.esm.js",
				"@helpers": fileURLToPath(new URL("./helpers", import.meta.url)),
			},
		},
	};
});
