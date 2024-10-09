<template>
	<div>
		<v-row v-for="(download, i) in downloads" :key="download.key">
			<template v-if="download.category !== undefined">
				<v-col cols="12" sm="3">
					<v-text-field v-model="download.category" :label="$root.lang().posts.download.category" />
				</v-col>
				<v-col cols="12" sm="9">
					<v-row v-for="(item, j) in download.items" :key="item.key">
						<v-col cols="12" sm="3">
							<v-text-field v-model="item.name" :label="$root.lang().posts.download.name" />
						</v-col>
						<v-col cols="12" :sm="j === 0 ? 7 : 8">
							<v-text-field
								v-model="item.link"
								:label="$root.lang().posts.download.link"
								:placeholder="$root.lang().posts.download.link_placeholder"
							/>
						</v-col>
						<template v-if="j === 0">
							<v-col cols="12" sm="1">
								<v-btn icon @click="addItemToGroup(i)" color="lighten-1">
									<v-icon>mdi-plus</v-icon>
								</v-btn>
							</v-col>
							<v-col cols="12" sm="1">
								<v-btn icon @click="removeItem(i)" color="red lighten-1">
									<v-icon>mdi-delete</v-icon>
								</v-btn>
							</v-col>
						</template>
						<v-col v-else cols="12" sm="1">
							<v-btn icon @click="removeItemInGroup(i, j)" color="red lighten-1">
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
				<v-col cols="12" sm="8">
					<v-text-field
						v-model="download.link"
						:label="$root.lang().posts.download.link"
						:placeholder="$root.lang().posts.download.link_placeholder"
					/>
				</v-col>
				<v-col cols="12" sm="1">
					<v-btn icon @click="removeItem(i)" color="red lighten-1">
						<v-icon>mdi-minus</v-icon>
					</v-btn>
				</v-col>
			</template>
		</v-row>
		<v-row>
			<v-col>
				<v-btn block color="secondary" @click="addSingleItem">
					{{ $root.lang().posts.download.add_single_item }}
					<v-icon right>mdi-plus</v-icon>
				</v-btn>
			</v-col>
			<v-col>
				<v-btn block color="secondary" @click="addGroup">
					{{ $root.lang().posts.download.add_group }}
					<v-icon right>mdi-plus</v-icon>
				</v-btn>
			</v-col>
		</v-row>
	</div>
</template>

<script>
const emptySingleItem = () => ({ key: crypto.randomUUID(), name: "", link: "" });
const emptyGroup = () => ({ key: crypto.randomUUID(), category: "", items: [emptySingleItem()] });

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
		addGroup() {
			this.downloads.push(emptyGroup());
		},
		addItemToGroup(i) {
			this.downloads[i].items.push(emptySingleItem());
		},
		removeItem(i) {
			this.downloads.splice(i, 1);
		},
		removeItemInGroup(i, j) {
			this.downloads[i].items.splice(j, 1);
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
