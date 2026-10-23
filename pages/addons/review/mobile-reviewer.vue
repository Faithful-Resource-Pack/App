<template>
	<!-- vuetify 2 doesn't support using values and v-model so we have to do it manually -->
	<v-expansion-panels v-model="selectedIndex" accordion>
		<v-expansion-panel
			v-for="{ primary, secondary, key } in items"
			:key="key"
			:ref="`panel-${key}`"
			class="review-expansion-panel"
			rounded
			@change="onSelect(key)"
		>
			<v-expansion-panel-header expand-icon="mdi-menu-down">
				<v-list-item class="flex-column align-start px-0" style="min-height: 0px">
					<v-list-item-title class="align-self-start">{{ primary }}</v-list-item-title>
					<v-list-item-subtitle>{{ secondary }}</v-list-item-subtitle>
				</v-list-item>
			</v-expansion-panel-header>
			<v-expansion-panel-content>
				<v-divider class="my-4" />
				<addon-panel
					v-if="addon"
					class="ma-n4"
					:addon="addon"
					:files="files"
					:authors="authors"
					@delete="$emit('review', addon.id, 'deleted')"
				/>
				<v-divider class="my-4" />
				<addon-status
					v-if="addon"
					class="ma-n4"
					:addon="addon"
					:authors="authors"
					@review="(status) => $emit('review', addon.id, status)"
				/>
			</v-expansion-panel-content>
		</v-expansion-panel>
	</v-expansion-panels>
</template>

<script>
import axios from "axios";

import AddonPanel from "./addon-panel.vue";
import AddonStatus from "./addon-status.vue";

export default {
	name: "mobile-reviewer",
	components: {
		AddonPanel,
		AddonStatus,
	},
	props: {
		addon: {
			type: Object,
			required: false,
			default: undefined,
		},
		items: {
			type: Array, // { primary: string, secondary: string, key: number }[]
			required: true,
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
			selectedIndex: undefined,
			files: [],
		};
	},
	methods: {
		onSelect(id) {
			// closed panel, remove param and return early
			if (this.$route.query.id === id)
				return this.$router.push({ query: { ...this.$route.query, id: undefined } });

			// opened panel so switch param and get files
			this.$router.push({ query: { ...this.$route.query, id } });
			this.getFiles(id);
		},
		getFiles(id) {
			this.files = [];
			axios.get(`${this.$root.apiURL}/addons/${id}/files`, this.$root.apiOptions).then((res) => {
				this.files = res.data;
			});
		},
		scrollPanel(id) {
			this.$refs[`panel-${id}`][0].$el.scrollIntoView({ behavior: "smooth", block: "center" });
		},
	},
	watch: {
		items: {
			handler(items) {
				const selectedId = this.$route.query.id;
				const selectedIndex = items.findIndex((a) => a.key === selectedId);

				if (selectedId === undefined || selectedIndex === -1) return;

				// programmatically open panel using vuetify v-model and fetch files
				this.selectedIndex = selectedIndex;
				this.getFiles(selectedId);
				setTimeout(() => this.scrollPanel(selectedId), 200);
			},
			deep: true,
			immediate: true,
		},
		"$route.query.id"(n) {
			// wait until opening animation is finished (looks better)
			if (n !== undefined) setTimeout(() => this.scrollPanel(n), 200);
		},
	},
};
</script>
