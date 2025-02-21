<template>
	<v-list-item class="pl-0">
		<v-list-item-content>
			<v-list-item-title :class="textColor">
				<template v-if="texture.name">{{ texture.name }}</template>
				<i v-else>{{ $root.lang().database.nameless }}</i>
				• {{ summaryString }}
			</v-list-item-title>
			<v-list-item-subtitle>
				<span v-if="texture.tags.length">{{ texture.tags.join(", ") }}</span>
				<i v-else>{{ $root.lang().database.textures.modal.tagless }}</i>
			</v-list-item-subtitle>
		</v-list-item-content>
		<v-list-item-action>
			<v-icon color="red lighten-1" @click="$emit('delete')">mdi-trash-can</v-icon>
		</v-list-item-action>
	</v-list-item>
</template>

<script>
// much cleaner as separate component for encapsulated state
export default {
	name: "summary-item",
	props: {
		texture: {
			type: Object,
			required: true,
		},
		color: {
			type: String,
			required: false,
			default: "primary",
		},
	},
	computed: {
		textColor() {
			// convert background color class to text color class
			return this.color.split(" ").map((c) => (c.includes("-") ? c : `${c}--text`));
		},
		summaryString() {
			const texStrings = this.$root.lang().database.textures;
			// bit cleaner than using a ton of nested ternaries
			let strBuilder = `${this.texture.uses.length} `;
			strBuilder +=
				this.texture.uses.length === 1 ? texStrings.uses.singular : texStrings.uses.plural;
			const pathCount = this.texture.uses.reduce((acc, cur) => acc + cur.paths.length, 0);
			strBuilder += `, ${pathCount} `;
			strBuilder += pathCount === 1 ? texStrings.paths.singular : texStrings.paths.plural;
			return strBuilder;
		},
	},
};
</script>
