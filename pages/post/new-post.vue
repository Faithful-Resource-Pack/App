<template>
	<div class="container">
		<h4 class="text-h4 py-4">
			{{ $root.lang().posts.titles.new }}
		</h4>
		<post-form v-model="post" add />
	</div>
</template>

<script>
import PostForm from "./form/index.vue";

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
				discontinued: false,
				changelog: {},
				downloads: {},
			},
		};
	},
};
</script>
