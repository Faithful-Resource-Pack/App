<template>
	<div>
		<v-row v-for="(download, i) in downloads" :key="download.key" dense>
			<template v-if="download.category !== undefined">
				<v-col cols="12" sm="3">
					<v-text-field
						v-model="download.category"
						:label="$root.lang().posts.download.category"
						hide-details
					/>
				</v-col>
				<v-col cols="12" sm="9">
					<v-row v-for="(item, j) in download.items" :key="item.key" dense>
						<v-col cols="12" sm="3">
							<v-text-field
								v-model="item.name"
								:label="$root.lang().posts.download.name"
								hide-details
							/>
						</v-col>
						<v-col cols="12" :sm="j === 0 ? 7 : 8">
							<v-text-field
								v-model="item.link"
								:label="$root.lang().posts.download.link"
								:placeholder="$root.lang().posts.download.link_placeholder"
								hide-details
							/>
						</v-col>
						<template v-if="j === 0">
							<v-col cols="12" sm="1">
								<v-btn icon color="lighten-1" @click="addItemToCategory(i)">
									<v-icon>mdi-plus</v-icon>
								</v-btn>
							</v-col>
							<v-col cols="12" sm="1">
								<v-btn icon color="red lighten-1" @click="removeItem(i)">
									<v-icon>mdi-delete</v-icon>
								</v-btn>
							</v-col>
						</template>
						<v-col v-else cols="12" sm="1">
							<v-btn icon color="red lighten-1" @click="removeItemInCategory(i, j)">
								<v-icon>mdi-minus</v-icon>
							</v-btn>
						</v-col>
					</v-row>
				</v-col>
			</template>
			<template v-else>
				<v-col cols="12" sm="3">
					<v-text-field v-model="download.name" :label="$root.lang().posts.download.name" />
				</v-col>
				<v-col cols="12" sm="9">
					<!-- extra nesting required to align the delete buttons with categories -->
					<v-row dense>
						<v-col cols="12" sm="11">
							<v-text-field
								v-model="download.link"
								:label="$root.lang().posts.download.link"
								:placeholder="$root.lang().posts.download.link_placeholder"
							/>
						</v-col>
						<v-col cols="12" sm="1">
							<v-btn icon color="red lighten-1" @click="removeItem(i)">
								<v-icon>mdi-minus</v-icon>
							</v-btn>
						</v-col>
					</v-row>
				</v-col>
			</template>
		</v-row>
		<v-row dense>
			<v-col>
				<v-btn block color="secondary" @click="addSingleItem">
					{{ $root.lang().posts.download.add_single_item }}
					<v-icon right>mdi-plus</v-icon>
				</v-btn>
			</v-col>
			<v-col>
				<v-btn block color="secondary" @click="addCategory">
					{{ $root.lang().posts.download.add_category }}
					<v-icon right>mdi-plus</v-icon>
				</v-btn>
			</v-col>
		</v-row>
	</div>
</template>

<script>
const emptySingleItem = () => ({ key: crypto.randomUUID(), name: "", link: "" });
const emptyCategory = () => ({
	key: crypto.randomUUID(),
	category: "",
	items: [emptySingleItem()],
});

export default {
	name: "download-tab",
	props: {
		value: {
			type: Array,
			required: true,
		},
	},
	data() {
		return {
			downloads: [],
		};
	},
	methods: {
		addSingleItem() {
			this.downloads.push(emptySingleItem());
		},
		addCategory() {
			this.downloads.push(emptyCategory());
		},
		addItemToCategory(i) {
			this.downloads[i].items.push(emptySingleItem());
		},
		removeItem(i) {
			this.downloads.splice(i, 1);
		},
		removeItemInCategory(i, j) {
			this.downloads[i].items.splice(j, 1);
			// remove category if there's no items in it
			if (!this.downloads[i].items.length) this.downloads.splice(i, 1);
		},
	},
	watch: {
		value: {
			handler(n) {
				this.downloads = n;
			},
			immediate: true,
		},
		downloads(n) {
			this.$emit("input", n);
		},
	},
};
</script>
