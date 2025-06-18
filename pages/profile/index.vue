<template>
	<v-container>
		<div class="text-h4 py-4">
			{{ $root.lang().profile.title }}
		</div>

		<div :class="['my-2 text-h5', { 'mx-n3': !$vuetify.breakpoint.mdAndUp }]">
			<v-list :rounded="$vuetify.breakpoint.mdAndUp" class="main-container">
				<v-list-item>
					<v-list-item-avatar>
						<v-img :src="$root.user.avatar" />
					</v-list-item-avatar>

					<v-list-item-content>
						<v-list-item-title>
							{{ $root.discordUser.discordName || $root.user.username }}
						</v-list-item-title>
						<v-list-item-subtitle style="font-size: 0.7rem; opacity: 0.8">
							{{ $root.user.id }}
						</v-list-item-subtitle>
						<v-list-item-subtitle>
							{{ ($root.user.roles || []).join(" • ") }}
						</v-list-item-subtitle>
					</v-list-item-content>
				</v-list-item>

				<!-- ================ GENERAL SETTINGS ================ -->
				<v-list-item>
					<v-row
						:style="{
							'margin-top': '20px',
							'align-items': $vuetify.breakpoint.mdAndUp ? 'flex-start' : 'center',
							'flex-direction': $vuetify.breakpoint.mdAndUp ? 'row' : 'column',
							'justify-content': 'space-between',
						}"
					>
						<v-col
							v-if="localUser.uuid && localUser.uuid.length == uuidMaxLength"
							class="col-2"
							:sm="$vuetify.breakpoint.mdAndUp ? 3 : 2"
							style="max-width: 250px"
						>
							<img
								alt="avatar"
								:style="{
									display: 'block',
									'margin-left': 'auto',
									'margin-right': $vuetify.breakpoint.mdAndUp ? 'inherit' : 'auto',
									height: '100%',
								}"
								:src="
									($vuetify.breakpoint.mdAndUp
										? 'https://vzge.me/full/256/'
										: 'https://vzge.me/head/128/') + localUser.uuid
								"
							/>
						</v-col>
						<v-col
							:class="
								'col-' + (localUser.uuid && localUser.uuid.length == uuidMaxLength) ? '10' : '12'
							"
							:sm="
								localUser.uuid && localUser.uuid.length == uuidMaxLength
									? $vuetify.breakpoint.mdAndUp
										? 9
										: 10
									: 12
							"
							style="max-width: 100%"
						>
							<v-form ref="form" lazy-validation>
								<div class="text-h6 mb-5">{{ $root.lang().profile.general.title }}</div>
								<v-row>
									<v-col>
										<v-text-field
											v-model="localUser.username"
											required
											:rules="usernameRules"
											:counter="usernameMaxLength"
											clearable
											:label="$root.lang().profile.general.username.label"
											:hint="$root.lang().profile.general.username.hint"
										/>
									</v-col>
								</v-row>
								<v-row>
									<v-col>
										<v-text-field
											v-model="localUser.uuid"
											placeholder="aaabbbcc-ddee-1122-3344-zzz555aadd33"
											:rules="uuidRules"
											:counter="uuidMaxLength"
											clearable
											:label="$root.lang().profile.general.uuid.label"
											:hint="$root.lang().profile.general.uuid.hint"
										/>
									</v-col>
								</v-row>
							</v-form>
						</v-col>
					</v-row>
				</v-list-item>

				<br />

				<!-- ================ SOCIAL SETTINGS ================ -->
				<v-list-item>
					<v-row class="mb-2">
						<v-col>
							<v-form lazy-validation>
								<div class="text-h6 mb-5">{{ $root.lang().profile.social.title }}</div>
								<v-row v-for="(socialMedia, i) in localUser.media" :key="socialMedia.key">
									<v-col cols="12" sm="8">
										<v-text-field
											v-model="socialMedia.link"
											clearable
											:placeholder="$root.lang().profile.social.placeholder"
											:label="$root.lang().profile.social.link_label"
											:rules="urlRules"
										/>
									</v-col>
									<v-col cols="11" sm="3">
										<v-select
											v-model="socialMedia.type"
											:items="mediaTypes"
											:label="$root.lang().profile.social.type_label"
											:rules="mediaTypeRules"
										/>
									</v-col>
									<v-col cols="1">
										<v-btn icon @click="removeSocialMedia(i)">
											<v-icon color="red darken-1">mdi-minus</v-icon>
										</v-btn>
									</v-col>
								</v-row>
								<v-btn block class="my-5" color="secondary" @click="addSocialMedia">
									{{ $root.lang().profile.social.add }}
									<v-icon right>mdi-plus</v-icon>
								</v-btn>
							</v-form>
						</v-col>
					</v-row>
				</v-list-item>

				<div class="d-flex justify-end ma-2">
					<v-btn text color="error darken-1" @click="openDeleteModal">
						{{ $root.lang().profile.delete.btn }}
					</v-btn>
					<v-btn text color="darken-1" :disabled="!canSubmit" @click="send">
						{{ $root.lang().profile.save_changes }}
					</v-btn>
				</div>
			</v-list>
		</div>
		<modal-form
			v-model="deleteModalOpened"
			danger
			:title="$root.lang().profile.delete.title"
			@submit="deleteAccount"
		>
			<p>{{ $root.lang().profile.delete.description }}</p>
			<v-alert type="warning" outlined dense>{{ $root.lang().profile.delete.warning }}</v-alert>
		</modal-form>
	</v-container>
</template>

<script>
import axios from "axios";

import ModalForm from "@components/modal-form.vue";

const emptySocial = () => ({
	key: crypto.randomUUID(),
	type: "",
	link: "",
});

export default {
	name: "profile-page",
	components: {
		ModalForm,
	},
	data() {
		return {
			localUser: {},
			uuidMaxLength: 36,
			usernameMaxLength: 24,
			mediaTypes: settings.socials,
			validationObject: {},
			urlRules: [(u) => this.validate("social:exists", this.validURL(u), "URL must be valid.")],
			mediaTypeRules: [
				(u) =>
					this.validate(
						"social:exists",
						u && typeof u === "string" && u.trim().length > 0,
						"Social type is required.",
					),
				(u) =>
					this.validate("social:valid", this.mediaTypes.includes(u), "Social type must be valid."),
			],
			uuidRules: [
				(u) =>
					this.validate(
						"uuid:length",
						(u && u.length === this.uuidMaxLength) || !u,
						"UUID needs to be 36 characters long.",
					),
			],
			usernameRules: [
				(u) => this.validate("username:exists", !!u, "Username is required."),
				(u) =>
					this.validate(
						"username:content",
						u && typeof u === "string" && u.trim().length > 0,
						`Username cannot be empty`,
					),
				(u) =>
					this.validate(
						"username:length",
						u && u.length <= this.usernameMaxLength,
						`Username must be less than ${this.usernameMaxLength} characters.`,
					),
			],
			deleteModalOpened: false,
		};
	},
	methods: {
		validURL(str) {
			if (!str || typeof str !== "string") return false;
			return String.urlRegex.test(str);
		},
		addSocialMedia() {
			this.localUser.media ||= [];
			this.localUser.media.push(emptySocial());
		},
		removeSocialMedia(index) {
			this.localUser.media.splice(index, 1);
		},
		validate(scope, value, msg) {
			if (scope.startsWith("username:") || scope.startsWith("uuid:")) {
				// socials are validated separately since there's multiple of them
				this.$set(this.validationObject, scope, value);
			}

			if (value) return true;
			return msg.toString();
		},
		send() {
			if (!this.$root.isLoggedIn) return;

			// fix if new user
			const data = {
				uuid: this.localUser.uuid || "",
				username: this.localUser.username || "",
				media: this.cleanedMedia,
			};

			axios
				.post(`${this.$root.apiURL}/users/profile/`, data, this.$root.apiOptions)
				.then(() => {
					this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
				})
				.catch((error) => {
					console.error(error);
					this.$root.showSnackBar(error, "error");
				});
		},
		openDeleteModal() {
			this.deleteModalOpened = true;
		},
		deleteAccount() {
			axios
				.delete(`${this.$root.apiURL}/users/${this.$root.user.id}`, this.$root.apiOptions)
				.then(() => {
					this.$router.push({ path: "dashboard" });
					this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
					this.$root.logout();
				})
				.catch((error) => {
					console.error(error);
					this.$root.showSnackBar(error, "error");
				});
		},
		getUserInfo() {
			if (!this.$root.isLoggedIn) return;

			axios
				.get(`${this.$root.apiURL}/users/profile/`, this.$root.apiOptions)
				.then((res) => {
					this.localUser = res.data;

					// fix if new user or empty user
					this.localUser.uuid ||= "";
					this.localUser.username ||= "";
					this.localUser.media ||= [];
				})
				.catch((err) => {
					console.error(err);
					this.$root.showSnackBar(err, "error");
				});
		},
		update() {
			// prevents issues when deleting account
			this.$nextTick(() => this.getUserInfo());
		},
	},
	computed: {
		cleanedMedia() {
			return (this.localUser.media || [])
				.filter((m) => m.link && m.type)
				.map((m) => {
					delete m.key;
					return m;
				});
		},
		canSubmit() {
			// media handled separately since there's multiple
			if (
				(this.localUser.media || []).some((m) => {
					if (!this.validURL(m.link)) return true;
					if (!this.mediaTypes.includes(m.type)) return true;
					return false;
				})
			)
				return false;
			return Object.values(this.validationObject).every((v) => v === true);
		},
	},
	mounted() {
		this.$root.addAccessTokenListener(this.update);
	},
};
</script>
