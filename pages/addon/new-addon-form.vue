<template>
	<div class="container">
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div class="styles" v-html="pageStyles" />
		<h4 class="text-h4 py-4">{{ $root.lang().addons.titles.submit }}</h4>
		<addon-form
			addon-new
			:screen-sources="screenSources"
			:screen-ids="screenshotIds"
			@submit="handleSubmit"
			@header="handleHeader"
			@screenshot="handleScreenshot"
		/>
	</div>
</template>

<script>
import axios from "axios";

import AddonForm from "./addon-form.vue";

import { generatePageStyles } from "@helpers/colors.js";

export default {
	name: "new-addon-form",
	components: {
		AddonForm,
	},
	data() {
		return {
			pageColor: "yellow darken-3",
			pageStyles: "",
			header: undefined,
			screenshots: [],
			screenshotIds: [],
			screenshotId: 0,
		};
	},
	computed: {
		screenSources() {
			return this.screenshots.map((file) => URL.createObjectURL(file));
		},
	},
	methods: {
		handleSubmit(data) {
			// 1. Upload
			let id;
			axios
				.post(`${this.$root.apiURL}/addons`, data, this.$root.apiOptions)
				.then(async (response) => {
					const addon = response.data;
					id = addon.id;

					const promises = [];
					// 2. Upload header and screenshots
					let form;
					if (this.header || this.screenshots.length) form = new FormData();

					if (this.header) {
						form.set("file", this.header, this.header.name);
						promises.push(
							axios.post(`${this.$root.apiURL}/addons/${id}/header`, form, this.$root.apiOptions),
						);
					}
					if (this.screenshots.length) {
						// add all of them
						// fix to stabilize upload and make one request then another...
						let i = 0;
						let successful = true;
						let err;
						let screenshots = this.screenshots;
						while (i < screenshots.length && successful) {
							const screen = screenshots[i];
							const form = new FormData();
							form.set("file", screen, screen.name);

							successful = await axios
								.post(`${this.$root.apiURL}/addons/${id}/screenshots`, form, this.$root.apiOptions)
								.then(() => true)
								.catch((error) => {
									err = error;
									return false;
								});

							i++;
						}

						promises.push(successful ? Promise.resolve() : Promise.reject(err));
					}

					return Promise.all(promises);
				})
				.then(() => {
					this.$root.showSnackBar("Saved", "success");
					this.$router.push("/addons/submissions");
				})
				.catch((err) => {
					console.error(err);
					this.$root.showSnackBar(err, "error");

					// delete what is left of addon
					// if we have id then we at least successfully created the file
					if (id)
						axios
							.delete(`${this.$root.apiURL}/addons/${id}`, this.$root.apiOptions)
							.catch((err) => this.$root.showSnackBar(err, "error"));
				});
		},
		handleHeader(file, remove = false) {
			this.header = remove ? undefined : file;
		},
		handleScreenshot(screenshots, index, remove = false, id = undefined) {
			if (remove) {
				if (id !== undefined) {
					index = this.screenshotIds.indexOf(id);
				}

				if (index < 0) return;

				this.screenshots.splice(index, 1);
				this.screenshotIds.splice(index, 1);
				//? force variable update as slice method does only internal stuff
				this.$set(this, "screenshots", this.screenshots);
				this.$set(this, "screenshotIds", this.screenshotIds);

				//? that will force computed screenSources to be recomputed
			} else {
				const files = Array.isArray(screenshots) ? screenshots : [screenshots];
				const number = files.length;

				// First add screenshots
				this.screenshots = [...this.screenshots, ...files];
				// Then add the same amount of ids
				this.screenshotIds = [
					...this.screenshotIds,
					...Array.from({ length: number }).map((_, i) => this.screenshotId + i),
				];

				this.screenshotId += number; // increase top id
			}
		},
	},
	mounted() {
		this.pageStyles = generatePageStyles(this, this.pageColor);
	}
};
</script>
