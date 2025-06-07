<template>
	<v-card flat class="dashboard-card">
		<v-card-title class="d-flex align-center pb-2">
			<span class="text-h5"> {{ title }} </span>
			<v-spacer />
			<v-btn v-if="to && clickable" icon :to="to" class="rounded-lg">
				<v-icon v-if="to" :disabled="!clickable" large> mdi-chevron-right </v-icon>
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
			type: String,
			required: false,
			default: "",
		},
		to: {
			type: String,
			required: false,
			default: undefined,
		},
		clickable: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
};
</script>
