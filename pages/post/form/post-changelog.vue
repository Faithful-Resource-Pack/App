<template>
	<div :class="margin ? 'ml-5' : ''">
		<v-row dense v-if="typeof item === 'string'">
			<v-col cols="12" sm="11">
				<v-text-field dense clearable v-model="item" hide-details />
			</v-col>
			<v-col cols="12" sm="1">
				<v-btn icon :size="categoryHeight" @click="$emit('delete')">
					<v-icon color="red lighten-1">mdi-minus</v-icon>
				</v-btn>
			</v-col>
		</v-row>
		<template v-else-if="item.category !== undefined">
			<v-row dense>
				<v-col cols="12" sm="11">
					<v-text-field
						dense
						clearable
						hide-details
						v-model="item.category"
						:class="classList"
						:height="categoryHeight"
					/>
				</v-col>
				<v-col cols="12" sm="1">
					<v-btn icon :size="categoryHeight" @click="$emit('delete')">
						<v-icon color="red lighten-1">mdi-delete</v-icon>
					</v-btn>
				</v-col>
			</v-row>
			<post-changelog
				v-for="(el, i) in item.items"
				v-model="item.items[i]"
				@delete="remove(i, false)"
				:key="i"
				:level="level + 1"
				margin
			/>
			<v-btn class="ma-1" color="secondary" @click="addItem()">
				{{ $root.lang().posts.changelog.add_item }}
			</v-btn>
			<v-btn class="ma-1" color="secondary" @click="addCategory()">
				{{ $root.lang().posts.changelog.add_category }}
			</v-btn>
		</template>
		<template v-else-if="item.some((v) => typeof v === 'string')">
			<post-changelog
				v-for="(el, i) in item"
				v-model="item[i]"
				@delete="remove(i, true)"
				:key="i"
				:level="level + 1"
				margin
			/>
			<v-btn class="ma-1" color="secondary" @click="addItem()">
				{{ $root.lang().posts.changelog.add_item }}
			</v-btn>
			<v-btn class="ma-1" color="secondary" @click="addCategory()">
				{{ $root.lang().posts.changelog.add_category }}
			</v-btn>
		</template>
		<template v-else>
			<post-changelog
				v-for="(el, i) in item"
				v-model="item[i]"
				@delete="remove(i, true)"
				:key="i"
				:level="level"
				margin
			/>
			<v-btn class="ma-1" color="secondary" @click="addCategory(true)">
				{{ $root.lang().posts.changelog.add_category }}
			</v-btn>
		</template>
	</div>
</template>

<script>
export default {
	name: "post-changelog",
	props: {
		value: {
			type: [String, Object, Array],
			required: true,
		},
		level: {
			type: Number,
			required: false,
			default: 4,
		},
		margin: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	data() {
		return {
			item: undefined,
		};
	},
	methods: {
		addItem() {
			if (!this.item || !this.item.items) return;
			this.$set(this.item.items, this.item.items.length, "");
		},
		addCategory(setDirectly = false) {
			if (!this.item) return;
			if (setDirectly) {
				this.$set(this.item, this.item.length, {
					category: "",
					items: [],
				});
			} else {
				this.$set(this.item.items, this.item.items.length, {
					category: "",
					items: [],
				});
			}
		},
		remove(i, single = false) {
			if (single) this.item.splice(i, 1);
			else this.item.items.splice(i, 1);
		},
	},
	computed: {
		isNested() {
			return this.level > 5;
		},
		classList() {
			if (this.isNested) return "";
			return `text-h${this.level}`;
		},
		categoryHeight() {
			if (this.isNested) return "";
			return `${this.level * 5 + 30}px`;
		},
	},
	watch: {
		value: {
			handler(n) {
				this.item = n;
			},
			deep: true,
			immediate: true,
		},
		item: {
			handler(n) {
				this.$emit("input", n);
			},
			deep: true,
		},
	},
};
</script>
