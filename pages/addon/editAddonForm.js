const addonForm = () => import("./addonForm.js");

export default {
	name: "edit-addon-form",
	components: {
		"addon-form": addonForm,
	},
	template: `
  <div class="container">
    <h4 class="text-h4 py-4">{{ $root.lang().addons.titles.edit }} <span id="addon-id">#{{this.id}}</span></h4>
    <addon-form
      class="pa-0"

      :addon-new="false"

      :loading="loading"
      :addon-data="addonData"

      :disabled-header-input="hidisabled"

      :screen-sources="screenSources"
      :screen-ids="screenIds"
      :header-source="headerSource"

      v-on:submit="handleSubmit"
      v-on:header="handleHeader"
      v-on:screenshot="handleScreenshot"
     />
    <v-dialog
      v-model="reasonDialog"
      persistent
      max-width="600px"
    >
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ this.$root.lang('addons.general.reason.title') }}</span>
      </v-card-title>
      <v-form lazy-validation v-model="validForm" ref="reasonForm">
        <v-card-text>
          <p>{{ this.$root.lang('addons.general.reason.text') }}</p>
            <v-text-field
              :label="this.$root.lang('addons.general.reason.title')"
              required
              :rules="reasonRules"
              v-model="reason"
              :counter="reasonCounter.max"
            />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="gray"
            text
            @click="() => handleReasonDialog(false)"
          >
            {{ $root.lang('global.btn.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            text
            @click="() => handleReasonDialog(true)"
          >
            {{ $root.lang('global.btn.submit') }}
          </v-btn>
        </v-card-actions>
      </v-form>
      </v-card>
     </v-dialog>
  </div>
  `,
	data: function () {
		return {
			hidisabled: false,
			reasonDialog: false,
			reasonData: undefined,
			reasonRules: [
				() =>
					!!(this.reason && this.reason.trim()) ||
					this.$root.lang("addons.general.reason.required"),
				() =>
					this.reason.trim().length < this.reasonCounter.min ||
					this.reason.trim().length > this.reasonCounter.max
						? this.$root
								.lang("addons.general.reason.bounds")
								.replace("%s", this.reasonCounter.min)
								.replace("%s", this.reasonCounter.max)
						: true,
			],
			reasonCounter: {
				min: 5,
				max: 150,
			},
			reason: "",
			validForm: false,
			addonData: undefined,
			headerSource: undefined,
			screenSources: [],
			screenIds: [],
		};
	},
	computed: {
		loading: function () {
			return this.addonData === undefined;
		},
		id: function () {
			return this.$route.params.id;
		},
	},
	methods: {
		handleReasonDialog(submitted) {
			const valid = this.$refs.reasonForm.validate();
			if (!valid) return;

			this.reasonDialog = false;
			if (submitted) {
				this.confirmSubmit(this.reasonData, false);
			} else {
				this.reason = "";
			}
		},
		handleSubmit: function (data, approve) {
			if (!approve) {
				this.reasonData = data;
				this.reasonDialog = true;
			} else {
				this.confirmSubmit(data, approve);
			}
		},
		confirmSubmit: function (data, approve) {
			if (approve) {
				data.reason = "Admin edit";
			} else {
				data.reason = this.reason.trim();
				this.reason = "";
			}
			let prom = axios
				.patch(this.$root.apiURL + "/addons/" + this.id, data, this.$root.apiOptions)
				.then(() => {
					this.$root.showSnackBar("Saved", "success");
				});

			if (approve === true) {
				prom = prom
					.then(() => {
						return axios.put(
							this.$root.apiURL + "/addons/" + this.id + "/review",
							{
								status: "approved",
								reason: "Admin edit",
							},
							this.$root.apiOptions,
						);
					})
					.then(() => {
						this.$root.showSnackBar("Approved", "success");
					});
			}

			prom.catch((err) => {
				this.$root.showSnackBar(err, "error");
			});
		},
		handleHeader: function (file, remove = false) {
			this.hidisabled = true;

			let promise;
			if (remove) {
				promise = axios.delete(
					this.$root.apiURL + "/addons/" + this.id + "/header",
					this.$root.apiOptions,
				);
			} else {
				const form = new FormData();
				form.set("file", file, file.name);
				promise = axios.post(
					this.$root.apiURL + "/addons/" + this.id + "/header",
					form,
					this.$root.apiOptions,
				);
			}

			promise
				.then(() => {
					this.getHeader();
					this.$root.showSnackBar(
						"Successfully " + (remove ? "removed" : "uploaded") + " header image",
						"success",
					);
				})
				.catch((err) => {
					console.error(err);
					this.$root.showSnackBar(err, "error");
				})
				.finally(() => {
					this.hidisabled = false;
				});
		},
		getHeader: function () {
			axios({
				method: "GET",
				url: this.$root.apiURL + "/addons/" + this.id + "/files/header",
				...this.$root.apiOptions,
			})
				.then((res) => {
					const url = res.data + "?t=" + new Date().getTime();
					this.headerSource = url;
				})
				.catch(() => {
					this.headerSource = undefined;
				});
		},
		handleScreenshot: async function (screenshots, index, remove = false, id) {
			if (Array.isArray(screenshots) && screenshots.length === 0) return;

			let promise;
			if (remove) {
				if (id !== undefined) {
					promise = axios.delete(
						this.$root.apiURL + "/addons/" + this.id + "/screenshots/" + id,
						this.$root.apiOptions,
					);
				} else {
					promise = axios.delete(
						this.$root.apiURL + "/addons/" + this.id + "/screenshots/" + index,
						this.$root.apiOptions,
					);
				}
			} else {
				// add all of them
				// fix to stabilize upload and make one request then another...
				let i = 0;
				let successful = true;
				let err;
				while (i < screenshots.length && successful) {
					const screen = screenshots[i];
					const form = new FormData();
					form.set("file", screen, screen.name);

					successful = await axios
						.post(
							this.$root.apiURL + "/addons/" + this.id + "/screenshots",
							form,
							this.$root.apiOptions,
						)
						.then(() => true)
						.catch((error) => {
							err = error;
							return false;
						});

					i++;
				}

				promise = successful ? Promise.resolve() : Promise.reject(err);
			}

			promise
				.then(() => {
					this.getScreens();
					this.$root.showSnackBar(
						"Successfully " + (remove ? "removed" : "uploaded") + " screenshots",
						"success",
					);
				})
				.catch((err) => {
					console.error(err);
					this.$root.showSnackBar(err, "error");
				});
		},
		getScreens: function () {
			axios
				.get(
					this.$root.apiURL +
						"/addons/" +
						(this.id || this.$route.params.id) +
						"/files/screenshots",
					this.$root.apiOptions,
				)
				.then((res) => {
					this.screenSources = res.data;
				});
			axios
				.get(
					this.$root.apiURL +
						"/addons/" +
						(this.id || this.$route.params.id) +
						"/files/screenshots-ids",
					this.$root.apiOptions,
				)
				.then((res) => {
					this.screenIds = res.data;
				});
		},
	},
	created: function () {
		this.getHeader();
		this.getScreens();
		Promise.all([
			axios.get(this.$root.apiURL + "/addons/" + this.$route.params.id, this.$root.apiOptions),
			axios.get(
				this.$root.apiURL + "/addons/" + this.$route.params.id + "/files/downloads",
				this.$root.apiOptions,
			),
		]).then((res) => {
			let addon_loaded = {
				...res[0].data,
				downloads: res[1].data,
			};
			delete addon_loaded.last_updated;
			delete addon_loaded.slug;
			delete addon_loaded.approval;
			delete addon_loaded.id;

			this.addonData = addon_loaded;
		});
	},
};
