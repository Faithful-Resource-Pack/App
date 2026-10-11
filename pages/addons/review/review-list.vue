<template>
	<v-card class="main-container d-flex flex-column">
		<!-- if you don't wrap this in a div the vertical alignment gets messed up for some reason -->
		<div class="pa-4">
			<!-- remove the billion pixels of top padding and sticky position above list -->
			<v-text-field
				ref="reviewSearch"
				v-model="search"
				class="mt-n1 pt-0"
				style="position: sticky; top: 0; z-index: 3"
				:placeholder="$root.lang().review.labels.search"
				:color="activeColor"
				autofocus
				clearable
				hide-details
				prepend-inner-icon="mdi-magnify"
			/>
		</div>
		<v-list
			v-if="filteredItems.length"
			nav
			class="overflow-y-auto pa-0"
			style="background: transparent"
		>
			<!-- workaround to prevent the navigation list styles incorrectly applying -->
			<router-link v-for="(item, i) in filteredItems" :key="item.key" :to="addonURL(item.key)">
				<v-list-item
					tabindex="-1"
					two-line
					class="px-4"
					:class="classes[i]"
					@click="$emit('input', item.key)"
				>
					<v-list-item-content>
						<v-list-item-title>{{ item.primary }}</v-list-item-title>
						<v-list-item-subtitle>{{ item.secondary }}</v-list-item-subtitle>
					</v-list-item-content>
				</v-list-item>
			</router-link>
		</v-list>
		<div v-else class="d-flex flex-column align-center justify-center" style="height: 100%">
			<v-icon size="128px">mdi-alert-circle-outline</v-icon>
			<p class="text-h6 my-3">{{ $root.lang().global.no_results }}</p>
		</div>
	</v-card>
</template>

<script>
export default {
	name: "review-list",
	props: {
		// throws error on initial load when required since it takes a second to fetch results
		value: {
			type: String,
			required: false,
			default: undefined,
		},
		items: {
			type: Array, // { primary: string, secondary: string, key: number }[]
			required: true,
		},
		activeColor: {
			type: String,
			required: true,
		},
	},
	emits: ["input"],
	data() {
		return {
			search: null,
		};
	},
	methods: {
		addonURL(id) {
			return `/addons/review?status=${this.$route.query.status}&id=${id}`;
		},
	},
	computed: {
		classes() {
			return this.filteredItems.map(({ key }) =>
				key === this.value ? `${this.activeColor} selected` : "",
			);
		},
		filteredItems() {
			if (!this.search) return this.items;
			return this.items.filter((item) =>
				item.primary.toLowerCase().includes(this.search.toLowerCase()),
			);
		},
	},
	watch: {
		// focus and reset search
		"$route.query.status"() {
			this.search = null;
			this.$refs.reviewSearch?.focus();
		},
	},
};
</script>
