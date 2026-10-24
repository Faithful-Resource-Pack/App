<template>
	<v-row class="my-2">
		<v-col cols="12" sm="6">
			<v-slider
				:value="value.columns"
				:title="$root.lang().gallery.max_items_per_row"
				step="1"
				min="1"
				:max="maxColumns"
				ticks="always"
				tick-size="3"
				thumb-label
				hide-details
				@input="update({ columns: $event })"
			>
				<!-- need to apply label colors so we manually add icons -->
				<template #prepend>
					<v-icon class="v-label">mdi-grid-large</v-icon>
				</template>
				<template #append>
					<v-icon class="v-label">mdi-grid</v-icon>
				</template>
			</v-slider>
		</v-col>
		<v-col v-if="stretchable" cols="12" sm="3">
			<v-switch
				:input-value="value.stretched"
				:label="$root.lang().gallery.stretched_switcher"
				hide-details
				@change="update({ stretched: !!$event })"
			/>
		</v-col>
		<v-col cols="12" :sm="stretchable ? 3 : 6">
			<v-switch
				:input-value="value.animated"
				:label="$root.lang().gallery.animated_switcher"
				hide-details
				@change="update({ animated: !!$event })"
			/>
		</v-col>
	</v-row>
</template>

<script>
// column slider and stretched/animated switches shared by every gallery-like page
export default {
	name: "gallery-display-options",
	props: {
		value: {
			type: Object,
			required: true,
		},
		maxColumns: {
			type: Number,
			required: false,
			default: 16,
		},
	},
	emits: ["input"],
	computed: {
		// hide the stretched switcher when the screen is smaller than the size when not stretched
		stretchable() {
			return this.$vuetify.breakpoint.lgAndUp;
		},
	},
	methods: {
		update(patch) {
			this.$emit("input", { ...this.value, ...patch });
		},
	},
	watch: {
		stretchable(n) {
			// turn off stretching if screen doesn't support it
			if (!n && this.value.stretched) this.update({ stretched: false });
		},
	},
};
</script>
