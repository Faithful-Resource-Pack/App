<template>
	<modal-form
		v-model="modalOpened"
		danger
		:title="$root.lang().database.titles.confirm_deletion"
		@close="$emit('close')"
		@submit="deletePost"
	>
		<p>
			{{
				$root
					.lang()
					.database.labels.ask_deletion.replace("%s", post.title)
					.replace("%d", post.permalink)
			}}
		</p>
	</modal-form>
</template>

<script>
import axios from "axios";
import ModalForm from "@components/modal-form.vue";

export default {
	name: "post-remove-confirm",
	components: {
		ModalForm,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		post: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			modalOpened: false,
		};
	},
	methods: {
		deletePost() {
			axios
				.delete(`${this.$root.apiURL}/posts/${this.post.id}`, this.$root.apiOptions)
				.then(() => {
					this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
					this.$emit("close");
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
			this.$emit("input", newValue);
		},
	},
};
</script>
