<template>
	<remove-confirm
		v-model="modalOpened"
		:title="$root.lang().database.titles.confirm_deletion"
		@close="$emit('close')"
		@confirm="deleteContribution"
	>
		<li>ID: {{ data.id }}</li>
		<li>Name: {{ data.name }}</li>
		<li>Pack: {{ data.pack }}</li>
		<li>Date: {{ data.date }} ({{ timestampToDate(data.date) }})</li>
		<li>
			Authors:
			<ul>
				<li v-for="author in formattedAuthors" :key="author">
					{{ author }}
				</li>
			</ul>
		</li>
	</remove-confirm>
</template>

<script>
import axios from "axios";
import moment from "moment";
import RemoveConfirm from "@components/remove-confirm.vue";

export default {
	name: "contribution-remove-confirm",
	components: {
		RemoveConfirm,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		data: {
			type: Object,
			required: false,
			// when initially loaded it has no value
			default: () => ({}),
		},
		contributors: {
			type: Array,
			required: true,
		},
	},
	data() {
		return {
			modalOpened: false,
		};
	},
	methods: {
		timestampToDate(t) {
			return moment(new Date(t)).format("ll");
		},
		deleteContribution() {
			axios
				.delete(`${this.$root.apiURL}/contributions/${this.data.id}`, this.$root.apiOptions)
				.then(() => {
					this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
					this.$emit("close", true);
				})
				.catch((err) => {
					this.$root.showSnackBar(err, "error");
					this.$emit("close", true);
				});
		},
	},
	computed: {
		formattedAuthors() {
			if (!this.data || !this.data.authors) return ["Unknown"];
			return this.data.authors.map(
				(author) => `${this.contributors.find((c) => c.id == author).username} (${author})`,
			);
		},
	},
	watch: {
		value(newValue) {
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			this.$emit("input", newValue);
		},
	},
};
</script>
