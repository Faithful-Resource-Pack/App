<template>
	<v-list>
		<v-list-item v-for="addon in addons" :key="addon.id" class="px-0">
			<v-list-item-avatar style="border-radius: 4px" width="80" height="45">
				<v-img
					:src="`${$root.apiURL}/addons/${addon.id}/header?discord=${$root.user.access_token}`"
					:aspect-ratio="16 / 9"
				/>
			</v-list-item-avatar>
			<v-list-item-content>
				<v-list-item-title style="word-break: break-word">
					{{ addon.name }}
				</v-list-item-title>
				<v-list-item-subtitle>
					<v-badge dot inline :color="colors[addon.approval.status]" />
					{{ $root.lang().review.titles[addon.approval.status] }}
				</v-list-item-subtitle>
			</v-list-item-content>
			<v-list-item-action class="merged-actions">
				<v-btn
					:href="`https://faithfulpack.net/addons/${addon.slug}`"
					target="_blank"
					rel="noopener noreferrer"
					:disabled="addon.approval.status !== 'approved'"
					:title="$root.lang().addons.general.go_to_addon"
					icon
				>
					<v-icon color="blue">mdi-open-in-new</v-icon>
				</v-btn>
				<v-btn :to="`/addons/edit/${addon.id}`" :title="$root.lang().global.btn.edit" icon>
					<v-icon>mdi-pencil</v-icon>
				</v-btn>
			</v-list-item-action>
		</v-list-item>
	</v-list>
</template>

<script>
export default {
	name: "user-addon-list",
	props: {
		addons: {
			type: Array,
			required: false,
			default: () => [],
		},
	},
	data() {
		return {
			// there's got to be a better place to put this
			colors: {
				approved: "green",
				pending: "yellow",
				denied: "red",
				archived: "grey",
			},
		};
	},
};
</script>
