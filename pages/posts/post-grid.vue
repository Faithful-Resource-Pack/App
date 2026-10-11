<template>
	<v-container class="flex-grow-1">
		<v-row no-gutters class="my-2 py-0" align="center">
			<v-col cols="12" sm="6">
				<h1 class="text-h4 my-2 d-flex flex-row align-center">
					{{ $root.lang().posts.titles.list }}
					<v-progress-circular v-if="loading" indeterminate class="ml-5" />
					<template v-else-if="posts.length">({{ posts.length }})</template>
				</h1>
			</v-col>
			<v-col cols="12" sm="6">
				<v-btn block class="my-2" color="secondary" to="/posts/new">
					<v-icon left>mdi-plus</v-icon>
					{{ $root.lang().posts.titles.new }}
				</v-btn>
			</v-col>
		</v-row>

		<ascii-error
			v-if="!loading && !posts.length"
			:subtitle="error || $root.lang().global.no_results"
			:errorCode="errorCode"
		/>
		<card-grid v-else :items="posts" :loading="loading">
			<template #default="post">
				<!-- handles loading/error states automatically -->
				<emitting-image
					:src="
						post.header_img ||
						'https://database.faithfulpack.net/images/website/posts/placeholder.jpg'
					"
					:aspect-ratio="16 / 9"
					:alt="$root.lang().posts.general.header_img.label"
				/>
				<v-card-title class="d-block" style="word-break: break-word">
					{{ postTitle(post.title).title }}
					<v-btn
						v-if="post.published"
						right
						color="blue"
						:href="`https://faithfulpack.net${post.permalink}`"
						target="_blank"
						rel="noopener noreferrer"
						:title="$root.lang().posts.go_to_post"
						icon
						small
					>
						<v-icon small>mdi-open-in-new</v-icon>
					</v-btn>
				</v-card-title>
				<v-card-subtitle>{{ postTitle(post.title).subtitle }}</v-card-subtitle>
				<v-card-text class="d-flex align-start flex-grow-1">
					<v-badge dot inline :color="post.published ? 'green' : 'yellow'" />
					<!-- by default it grows to the full container -->
					<v-list-item dense style="flex: unset; min-height: 0" class="px-2">
						<v-list-item-content class="py-0">
							<v-list-item-title>{{ postDate(post) }}</v-list-item-title>
							<v-list-item-subtitle>{{ post.permalink }}</v-list-item-subtitle>
						</v-list-item-content>
					</v-list-item>
				</v-card-text>
				<v-card-actions class="justify-end">
					<v-btn text :to="`/posts/edit/${post.id}`">
						{{ $root.lang().global.btn.edit }}
					</v-btn>
					<v-btn color="red" text @click="deletePost(post)">
						{{ $root.lang().global.btn.delete }}
					</v-btn>
				</v-card-actions>
			</template>
		</card-grid>

		<post-remove-confirm v-model="removeOpen" :post="removeData" @close="getPosts" />
	</v-container>
</template>

<script>
import axios from "axios";
import PostRemoveConfirm from "./post-remove-confirm.vue";
import CardGrid from "@layouts/card-grid.vue";
import AsciiError from "@components/ascii-error.vue";
import EmittingImage from "@components/emitting-image.vue";

export default {
	name: "post-grid",
	components: {
		AsciiError,
		CardGrid,
		EmittingImage,
		PostRemoveConfirm,
	},
	data() {
		return {
			removeOpen: false,
			removeData: {},
			posts: [],
			loading: true,
			errorCode: undefined,
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
				.catch((err) => {
					console.error(err);
					this.errorCode = err.response?.status;
					this.error =
						err.response.data?.message ||
						err.response.statusText ||
						this.$root.lang().global.no_results;
				})
				.finally(() => {
					this.loading = false;
				});
		},
		postTitle(baseTitle) {
			const splitTitle = baseTitle.split(": ");
			const title = splitTitle.length === 1 ? baseTitle : splitTitle.slice(1).join(": ");
			const subtitle = splitTitle.length === 1 ? "" : splitTitle[0];
			return { title, subtitle };
		},
		postDate(post) {
			const string = this.$root.lang().posts.status[post.published ? "published" : "draft"];
			return string.replace("%s", this.$root.formatDate(post.date));
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
