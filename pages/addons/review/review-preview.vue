<template>
	<div class="review-preview d-flex flex-column">
		<template v-if="addon">
			<v-card class="main-container flex-grow-1 overflow-y-auto overflow-x-hidden">
				<addon-panel
					:addon="addon"
					:files="files"
					:authors="authors"
					@delete="$emit('review', addon.id, 'deleted')"
				/>
			</v-card>
			<v-card class="main-container mt-2">
				<addon-status
					:addon="addon"
					:authors="authors"
					@review="(status) => $emit('review', addon.id, status)"
				/>
			</v-card>
		</template>
		<v-card v-else class="main-container flex-grow-1">
			<ascii-error :subtitle="$root.lang().review.labels.no_selection" />
		</v-card>
	</div>
</template>

<script>
import axios from "axios";

import AddonPanel from "./addon-panel.vue";
import AddonStatus from "./addon-status.vue";
import AsciiError from "@components/ascii-error.vue";

export default {
	name: "review-preview",
	components: {
		AddonPanel,
		AddonStatus,
		AsciiError,
	},
	props: {
		addon: {
			type: Object,
			required: false,
			default: undefined,
		},
		authors: {
			type: Array,
			required: true,
		},
		status: {
			type: String,
			required: true,
		},
	},
	emits: ["review"],
	data() {
		return {
			files: [],
		};
	},
	methods: {
		getFiles(id) {
			this.files = [];
			axios.get(`${this.$root.apiURL}/addons/${id}/files`, this.$root.apiOptions).then((res) => {
				this.files = res.data;
			});
		},
	},
	watch: {
		addon: {
			handler(n) {
				if (Object.keys(n || {}).length) this.getFiles(n.id);
			},
			immediate: true,
		},
	},
};
</script>
