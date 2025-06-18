<template>
	<modal-form v-model="modalOpened" :title="modalTitle" @close="$emit('close')" @submit="send">
		<v-row>
			<v-col v-if="formData.uuid" class="col-2" :sm="$vuetify.breakpoint.mdAndUp ? 3 : 2">
				<img alt="avatar" style="width: 100%; max-width: 250" :src="avatarSrc" />
			</v-col>
			<v-col
				:class="`col-${formData.uuid ? '10' : '12'}`"
				:sm="formData.uuid ? ($vuetify.breakpoint.mdAndUp ? 9 : 10) : 12"
			>
				<v-form ref="form" lazy-validation>
					<v-text-field
						v-model="formData.id"
						:color="color"
						required
						:readonly="add == false"
						:label="$root.lang().database.users.modal.id"
					/>
					<v-text-field
						v-model="formData.username"
						:color="color"
						required
						clearable
						:label="$root.lang().database.users.modal.username"
					/>
					<v-select
						v-model="formData.roles"
						:color="color"
						:item-color="color"
						required
						multiple
						small-chips
						deletable-chips
						:items="roles"
						:label="$root.lang().database.users.modal.roles"
					/>
					<v-text-field
						v-model="formData.uuid"
						:color="color"
						clearable
						:label="$root.lang().database.users.modal.uuid"
					/>
					<v-checkbox
						v-model="formData.anonymous"
						:color="color"
						required
						clearable
						:label="$root.lang().database.users.modal.anonymous"
					/>
					<p v-if="formData.anonymous">{{ $root.lang().database.users.modal.anonymous_hint }}</p>
				</v-form>
			</v-col>
		</v-row>
	</modal-form>
</template>

<script>
import axios from "axios";

import ModalForm from "@components/modal-form.vue";

export default {
	name: "user-modal",
	components: {
		ModalForm,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		add: {
			type: Boolean,
			required: false,
			default: false,
		},
		data: {
			type: Object,
			required: false,
			default: () => ({}),
		},
		roles: {
			type: Array,
			required: true,
		},
		color: {
			type: String,
			required: false,
			default: "primary",
		},
	},
	data() {
		return {
			modalOpened: false,
			formData: {
				username: "",
				roles: [],
				uuid: "",
				anonymous: false,
				id: "",
			},
			default: {
				username: "",
				roles: [],
				uuid: "",
				anonymous: false,
			},
		};
	},
	computed: {
		modalTitle() {
			return this.add
				? this.$root.lang().database.users.modal.add_user
				: this.$root.lang().database.users.modal.change_user;
		},
		avatarSrc() {
			const baseURL = this.$vuetify.breakpoint.mdAndUp
				? "https://vzge.me/full/256/"
				: "https://vzge.me/head/128/";
			return baseURL + this.formData.uuid;
		},
	},
	methods: {
		send() {
			const data = this.formData;
			const id = data.id;

			delete data.id; // excess property and therefore is not allowed
			delete data.media; // excess property and therefore is not allowed

			Object.keys(data).forEach((k) => (data[k] = data[k] === null ? this.default[k] : data[k]));

			axios
				.post(`${this.$root.apiURL}/users/${id}`, data, this.$root.apiOptions)
				.then(() => {
					this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
					this.$emit("close", true);
				})
				.catch((error) => {
					console.error(error);
					this.$root.showSnackBar(err, "error");
				});
		},
	},
	watch: {
		value(newValue) {
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			this.$nextTick(() => {
				if (this.add)
					this.formData = {
						username: "",
						roles: [],
						uuid: "",
						anonymous: false,
						id: "",
					};
				else
					Object.keys(this.data).forEach((key) => {
						this.formData[key] = this.data[key];
					});
			});
			this.$emit("input", newValue);
		},
	},
};
</script>
