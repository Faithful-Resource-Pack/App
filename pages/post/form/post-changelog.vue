<template>
	<div :class="margin ? 'ml-5' : ''">
		<v-row dense v-if="typeof item === 'string'">
			<v-col cols="12" sm="11">
				<v-text-field
					dense
					clearable
					v-model="item"
					:placeholder="$root.lang().posts.changelog.form_levels.item"
					hide-details
				/>
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
						:placeholder="categoryPlaceholder"
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
				@delete="remove(i)"
				:key="i"
				:level="level + 1"
				margin
			/>
			<div class="ml-5">
				<v-btn class="ma-1" color="secondary" @click="addItem">
					{{ $root.lang().posts.changelog.add_item }}<v-icon right>mdi-plus</v-icon>
				</v-btn>
				<v-btn class="ma-1" color="secondary" @click="addCategory">
					{{ $root.lang().posts.changelog.add_category }}<v-icon right>mdi-plus</v-icon>
				</v-btn>
			</div>
		</template>
	</div>
</template>

<script>
export default {
	name: "post-changelog",
	props: {
		value: {
			type: [String, Object],
			required: true,
		},
		// what size title to use (default h4)
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
			this.$set(this.item.items, this.item.items.length, "");
		},
		addCategory() {
			this.$set(this.item.items, this.item.items.length, {
				category: "",
				items: [],
			});
		},
		remove(i) {
			this.item.items.splice(i, 1);
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
		categoryPlaceholder() {
			const levels = this.$root.lang().posts.changelog.form_levels;
			switch (this.level) {
				case 4:
					return levels.primary;
				case 5:
					return levels.secondary;
				default:
					return levels.item_category;
			}
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
