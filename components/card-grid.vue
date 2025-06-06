<template>
	<v-row>
		<v-col
			v-for="item in items"
			:key="item[track]"
			:cols="$vuetify.breakpoint.mdAndUp ? 4 : $vuetify.breakpoint.smAndUp ? 6 : 12"
			style="align-items: stretch; display: flex"
		>
			<v-card
				style="
					background-color: rgba(255, 255, 255, 0.05);
					width: 100%;
					display: flex;
					flex-direction: column;
				"
			>
				<v-img
					style="border-radius: 5px"
					:src="getImage(item)"
					:aspect-ratio="16 / 9"
					@error="
						() => {
							failed[item[track]] = true;
							$forceUpdate();
							return false;
						}
					"
				>
					<template #placeholder>
						<v-row
							class="fill-height ma-0"
							align="center"
							justify="center"
							style="background-color: rgba(255, 255, 255, 0.1)"
						>
							<v-icon v-if="failed[item[track]]" x-large>mdi-image-off</v-icon>
							<v-progress-circular v-else indeterminate color="grey lighten-5" />
						</v-row>
					</template>
				</v-img>
				<!-- use scoped slots for more customizable layouts -->
				<slot name="title" v-bind="item" />
				<v-card-text style="flex-grow: 1">
					<slot name="text" v-bind="item" />
				</v-card-text>
				<v-card-actions style="justify-content: flex-end">
					<slot name="btns" v-bind="item" />
				</v-card-actions>
			</v-card>
		</v-col>
	</v-row>
</template>

<script>
export default {
	name: "card-grid",
	props: {
		items: {
			type: Array,
			required: true,
		},
		// key is reserved
		track: {
			type: String,
			required: false,
			default: "id",
		},
		getImage: {
			type: Function,
			required: true,
		},
	},
	data() {
		return {
			failed: {},
		};
	},
};
</script>
