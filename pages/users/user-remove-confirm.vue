<template>
	<modal-form
		v-model="modalOpened"
		danger
		:title="$root.lang().database.confirm_deletion"
		@close="$emit('close')"
		@submit="deleteUser"
	>
		<p>{{ description }}</p>
		<v-alert type="warning" outlined dense>{{ $root.lang().profile.delete.warning }}</v-alert>
		<template v-if="transferredAddons.length || deletedAddons.length">
			<h2 class="title">{{ addonDeleteTitle }}</h2>
			<template v-if="deletedAddons.length">
				<p class="mb-0 mt-3">{{ $root.lang().profile.delete.addons.deleted }}:</p>
				<ul>
					<li v-for="addon in deletedAddons" :key="addon.id">{{ addon.name }}</li>
				</ul>
			</template>
			<template v-if="transferredAddons.length">
				<p class="mb-0 mt-3">{{ $root.lang().profile.delete.addons.transferred }}:</p>
				<ul>
					<li v-for="addon in transferredAddons" :key="addon.id">{{ addon.name }}</li>
				</ul>
			</template>
		</template>
	</modal-form>
</template>

<script>
import axios from "axios";
import ModalForm from "@components/modal-form.vue";

export default {
	name: "user-remove-confirm",
	components: {
		ModalForm,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		data: {
			type: Object,
			required: true,
		},
		profile: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	data() {
		return {
			modalOpened: false,
			transferredAddons: [],
			deletedAddons: [],
		};
	},
	methods: {
		deleteUser() {
			axios
				// apiOptions works for self-deletion as well
				.delete(`${this.$root.apiURL}/users/${this.data.id}`, this.$root.apiOptions)
				.then(() => {
					this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
					this.$emit("close", true);
				})
				.catch((error) => {
					console.error(error);
					this.$root.showSnackBar(err, "error");
					this.$emit("close", true);
				});
		},
	},
	computed: {
		description() {
			if (this.profile) return this.$root.lang().profile.delete.description;
			return this.$root
				.lang()
				.database.ask_deletion.replace("%s", this.data.username)
				.replace("%d", this.data.id);
		},
		addonDeleteTitle() {
			return this.$root
				.lang()
				.profile.delete.addons.title.replace(
					"%d",
					this.transferredAddons.length + this.deletedAddons.length,
				);
		},
	},
	watch: {
		value(newValue) {
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			this.$emit("input", newValue);
		},
	},
	created() {
		axios
			.get(`${this.$root.apiURL}/users/${this.data.id}/addons`, this.$root.apiOptions)
			.then((res) => {
				this.transferredAddons = res.data.filter((a) => a.authors.length > 1);
				this.deletedAddons = res.data.filter((a) => a.authors.length === 1);
			});
	},
};
</script>
