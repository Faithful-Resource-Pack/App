<template>
	<v-container>
		<div class="text-h4 py-4">
			{{ $root.lang().posts.titles.list }}
		</div>

		<v-progress-circular v-if="loading" indeterminate />
		<div v-else-if="posts.length === 0">
			{{ error || $root.lang().global.no_results }}
		</div>
		<div v-else class="my-2 text-h5">
			<v-row>
				<v-col
					:cols="$vuetify.breakpoint.mdAndUp ? 4 : $vuetify.breakpoint.smAndUp ? 6 : 12"
					v-for="post in posts"
					:key="post.id"
				>
					<v-card style="background-color: rgba(255, 255, 255, 0.05)">
						<v-img
							v-if="post.header_img"
							style="border-radius: 5px"
							:src="post.header_img"
							:aspect-ratio="16 / 9"
							@error="
								() => {
									failed[post.id] = true;
									$forceUpdate();
									return false;
								}
							"
						>
							<template #placeholder>
								<v-row
									class="fill-height ma-0"
									align="center"
									justify="center"
									style="background-color: rgba(255, 255, 255, 0.1)"
								>
									<v-icon v-if="failed[post.id]" x-large>mdi-image-off</v-icon>
									<v-progress-circular v-else indeterminate color="grey lighten-5" />
								</v-row>
							</template>
						</v-img>
						<v-img
							v-else
							src="https://database.faithfulpack.net/images/website/posts/placeholder.jpg"
						/>
						<v-card-title>{{ post.title }}</v-card-title>
						<v-card-subtitle>{{ post.permalink }}</v-card-subtitle>
						<v-card-text style="height: 60px">
							<v-badge dot inline :color="post.published ? 'green' : 'yellow'" />
							{{ $root.lang().posts.status[post.published ? "published" : "pending"] }}
							<v-btn
								v-if="post.published"
								color="blue"
								:href="`https://faithfulpack.net${post.permalink}`"
								target="_blank"
								icon
								small
							>
								<v-icon small>mdi-open-in-new</v-icon>
							</v-btn>
						</v-card-text>

						<v-card-actions style="justify-content: flex-end">
							<v-btn text :href="`/posts/edit/${post.id}`">
								{{ $root.lang().global.btn.edit }}
							</v-btn>
							<v-btn color="red" text @click="deletePost(post)">
								{{ $root.lang().global.btn.delete }}
							</v-btn>
						</v-card-actions>
					</v-card>
				</v-col>
			</v-row>
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

export default {
	name: "post-grid",
	components: {
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
