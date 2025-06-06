<template>
	<v-card flat class="overflow-y-auto rounded-lg">
		<div v-if="items.length > 0">
			<v-list-item
				v-for="(item, i) in items"
				:key="item.key"
				two-line
				:class="classes[i]"
				@click="$emit('input', item.key)"
			>
				<v-list-item-content>
					<v-list-item-title>{{ item.primary }}</v-list-item-title>
					<v-list-item-subtitle>{{ item.secondary }}</v-list-item-subtitle>
				</v-list-item-content>
			</v-list-item>
		</div>
		<div v-else class="pa-2">
			{{ empty }}
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
			type: Array, // { primary: String, secondary: String, key: Number }[]
			required: true,
		},
		empty: {
			type: String,
			required: true,
		},
		activeColor: {
			type: String,
			required: true,
		},
	},
	computed: {
		classes() {
			return this.items.map(({ key }) =>
				key === this.value ? `${this.activeColor} selected` : "",
			);
		},
	},
};
</script>
