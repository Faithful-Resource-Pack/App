<template>
	<div class="container">
		<h4 class="text-h4 py-4">
			{{ $root.lang().posts.titles.new }}
		</h4>
		<post-form v-model="post" />
	</div>
</template>

<script>
import PostForm from "./form/main.vue";

export default {
	name: "new-post",
	components: {
		PostForm,
	},
	data() {
		return {
			post: {
				title: "",
				description: "",
				permalink: "",
				header_img: "",
				changelog: {},
				downloads: {},
			},
		};
	},
};
</script>
