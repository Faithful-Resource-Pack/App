<template>
	<v-row justify="center" dense>
		<v-col
			v-for="(cat, cat_i) in categories"
			:key="cat.value"
			cols="12"
			md="6"
			:lg="12 / (categories.length || 1)"
		>
			<v-card
				:class="['py-2 px-4 d-flex align-center rounded-lg overflow-hidden', classes[cat_i]]"
				elevation="2"
				@click="() => $emit('input', cat.value)"
			>
				<v-badge inline dot left :color="cat.color" style="margin-left: -4px">
					<div class="subtitle-1" style="margin-left: 5px">{{ cat.label }}</div>
				</v-badge>
				<h4 class="h4 ml-auto" style="margin-left: 5px">{{ cat.count || "" }}</h4>
			</v-card>
		</v-col>
	</v-row>
</template>

<script>
export default {
	name: "review-categories",
	props: {
		value: {
			type: String,
			required: true,
		},
		categories: {
			type: Array, // { label: String, color: String }[]
			required: true,
		},
		activeColor: {
			type: String,
			required: true,
		},
	},
	computed: {
		classes() {
			return this.categories.map((c) =>
				c.value === this.value ? `${this.activeColor} selected` : "",
			);
		},
	},
};
</script>
