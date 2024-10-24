<template>
	<div class="container">
		<h4 class="text-h4 py-4">
			{{ $root.lang().posts.titles.edit }} <span id="addon-id">#{{ this.id }}</span>
		</h4>
		<post-form v-model="post" :loading="loading" />
	</div>
</template>

<script>
import axios from "axios";
import PostForm from "./form/main.vue";

export default {
	name: "edit-post",
	components: {
		PostForm,
	},
	data() {
		return {
			loading: true,
			post: {},
		};
	},
	computed: {
		id() {
			return this.$route.params.id;
		},
	},
	created() {
		axios
			.get(`${this.$root.apiURL}/posts/${this.id}`, this.$root.apiOptions)
			.then((res) => {
				this.post = res.data;
			})
			.catch((err) => {
				console.error(err);
				this.$root.showSnackBar(err, "error");
			})
			.finally(() => {
				this.loading = false;
			});
	},
};
</script>
