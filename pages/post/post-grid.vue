<template>
	<v-container>
		<div class="text-h4 py-4">
			{{ $root.lang().posts.titles.list }}
			<v-progress-circular v-if="loading" indeterminate />
		</div>
		<div v-if="!loading && posts.length === 0">
			{{ error || $root.lang().global.no_results }}
		</div>
		<div v-else class="my-2 text-h5">
			<card-grid :items="posts" :getImage="(post) => post.header_img">
				<template #title="{ title, permalink }">
					<v-card-title style="word-break: break-word">{{ title }}</v-card-title>
					<v-card-subtitle>{{ permalink }}</v-card-subtitle>
				</template>
				<template #text="{ published, permalink }">
					<v-badge dot inline :color="published ? 'green' : 'yellow'" />
					{{ $root.lang().posts.status[published ? "published" : "pending"] }}
					<v-btn
						v-if="published"
						color="blue"
						:href="`https://faithfulpack.net${permalink}`"
						target="_blank"
						icon
						small
					>
						<v-icon small>mdi-open-in-new</v-icon>
					</v-btn>
				</template>
				<template #btns="post">
					<v-btn text :to="`/posts/edit/${post.id}`">
						{{ $root.lang().global.btn.edit }}
					</v-btn>
					<v-btn color="red" text @click="deletePost(post)">
						{{ $root.lang().global.btn.delete }}
					</v-btn>
				</template>
			</card-grid>
		</div>

		<post-remove-confirm
			v-model="removeOpen"
			:post="removeData"
			@close="
				() => {
					removeOpen = false;
					getPosts();
				}
			"
		/>
	</v-container>
</template>

<script>
import axios from "axios";
import PostRemoveConfirm from "./post-remove-confirm.vue";
import CardGrid from "@components/card-grid.vue";

export default {
	name: "post-grid",
	components: {
		CardGrid,
		PostRemoveConfirm,
	},
	data() {
		return {
			removeOpen: false,
			removeData: {},
			posts: [],
			loading: true,
			error: undefined,
			failed: {},
		};
	},
	methods: {
		getPosts() {
			axios
				.get(`${this.$root.apiURL}/posts/raw`, this.$root.apiOptions)
				.then((res) => {
					this.posts = Object.values(res.data).sort((a, b) => new Date(b.date) - new Date(a.date));
				})
				.catch((e) => {
					console.error(e);
					this.error = `${e.statusCode}: ${e.response.value}`;
				})
				.finally(() => {
					this.loading = false;
				});
		},
		deletePost(post) {
			this.removeOpen = true;
			this.removeData = post;
		},
	},
	created() {
		this.getPosts();
	},
};
</script>
