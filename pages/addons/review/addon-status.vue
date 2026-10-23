<template>
	<v-card-text class="d-flex flex-column align-center justify-space-between flex-sm-row ga-4">
		<div class="align-self-start align-self-sm-center">
			<span class="uppercase text--primary">
				{{ title.replace("%s", username) }}
			</span>
			<p v-if="status !== 'approved'" class="text--secondary text-pre-line mb-0">
				<template v-if="reason">{{ reason }}</template>
				<i v-else>{{ $root.lang().review.addon.labels.no_reason }}</i>
			</p>
		</div>
		<!-- switch to columns if the reason is too long to fit nicely on the left -->
		<div
			class="d-flex flex-wrap flex-sm-nowrap justify-end align-self-end align-self-sm-center ga-2"
			:class="{ 'flex-sm-column': longReason }"
		>
			<v-btn
				v-for="button in buttons"
				:key="button.status"
				text
				:color="button.color"
				:disabled="status === button.status"
				@click="$emit('review', button.status)"
			>
				<v-icon left>{{ button.icon }}</v-icon>
				{{ $root.lang().global.btn[button.label] }}
			</v-btn>
		</div>
	</v-card-text>
</template>

<script>
export default {
	name: "addon-status",
	props: {
		addon: {
			type: Object,
			required: true,
		},
		authors: {
			type: Array,
			required: true,
		},
	},
	emits: ["review"],
	data() {
		return {
			buttons: [
				{
					label: "approve",
					status: "approved",
					color: "green",
					icon: "mdi-check",
				},
				{
					label: "deny",
					status: "denied",
					color: "red",
					icon: "mdi-cancel",
				},
				{
					label: "archive",
					status: "archived",
					// default white/black for archive button (gray has bad text contrast)
					color: undefined,
					icon: "mdi-archive",
				},
			],
		};
	},
	computed: {
		status() {
			return this.addon.approval?.status;
		},
		reason() {
			return this.addon.approval?.reason;
		},
		username() {
			// straight up doesn't exist
			if (!this.addon.approval || !this.addon.approval.author) return "Herobrine";
			const author = this.authors.find((c) => c.id === this.addon.approval.author);
			if (author.username) return author.username;
			return `${this.$root.lang().database.anonymous} (${this.addon.approval.author})`;
		},
		title() {
			switch (this.status) {
				case "pending":
					return this.$root.lang().review.addon.labels.update_reason;
				case "approved":
					return this.$root.lang().review.addon.labels.approved_by;
				case "denied":
					return this.$root.lang().review.addon.labels.denied_by;
				case "archived":
					return this.$root.lang().review.addon.labels.archived_by;
			}
			return this.$root.lang().review.addon.labels.unknown_status.replace("%s", this.status);
		},
		longReason() {
			if (this.status === "approved") return false;
			return this.reason?.length > 150;
		},
	},
};
</script>
