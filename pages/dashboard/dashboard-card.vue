<template>
	<v-card flat class="dashboard-card">
		<v-card-title class="d-flex align-center pb-2">
			<span class="text-h5"> {{ title }} </span>
			<v-spacer />
			<v-btn icon v-if="href && clickable" :to="href" class="rounded-lg">
				<v-icon v-if="href" :disabled="!clickable" large> mdi-chevron-right </v-icon>
			</v-btn>
		</v-card-title>

		<slot />
	</v-card>
</template>

<script>
export default {
	name: "dashboard-card",
	props: {
		title: {
			required: false,
			type: String,
			default: "",
		},
		href: {
			required: false,
			type: String,
			default: undefined,
		},
		clickable: {
			required: false,
			type: Boolean,
			default: false,
		},
	},
};
</script>
