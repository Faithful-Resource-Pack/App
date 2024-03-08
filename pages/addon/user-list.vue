<template>
	<v-autocomplete
		multiple
		chips
		v-model="val"
		item-text="username"
		item-value="id"
		:items="users"
		:loading="users.length == 0"
		:label="label"
		:hint="hint"
	>
		<!-- Custom chips: Items list selected part -->
		<template v-slot:selection="data">
			<v-chip
				@click:close="remove(data.item.id)"
				close
				v-bind="data.attrs"
				:key="data.item.id"
				:input-value="data.selected"
				:disabled="data.disabled"
			>
				<v-avatar
					left
					:class="{
						accent: data.item.uuid === undefined,
						'text--white': true,
					}"
				>
					<template v-if="data.item.uuid != undefined">
						<v-img
							eager
							:src="'https://visage.surgeplay.com/face/24/' + (data.item.uuid || 'X-Alex')"
							:alt="(data.item.username || '' + data.item.id).slice(0, 1)"
						/>
					</template>
					<template v-else>
						{{ (data.item.username || "" + data.item.id).slice(0, 1) }}
					</template>
				</v-avatar>
				{{ data.item.username || data.item.id }}
			</v-chip>
		</template>

		<!-- Custom Chips: Item list part -->
		<template v-slot:item="data">
			<template
				v-if="data.item && data.item.constructor && data.item.constructor.name === 'String'"
			>
				<v-list-item-content>{{ data.item }}</v-list-item-content>
			</template>
			<template v-else>
				<v-list-item-content>
					<v-list-item-title>{{
						data.item.username || $root.lang().database.labels.anonymous + ` (${data.item.id})`
					}}</v-list-item-title>
				</v-list-item-content>
				<v-list-item-avatar :style="{ background: data.item.uuid ? 'transparent' : '#4e4e4e' }">
					<template v-if="data.item.uuid">
						<v-img
							eager
							:src="'https://visage.surgeplay.com/head/48/' + (data.item.uuid || 'X-Alex')"
						/>
					</template>
					<div v-else>{{ (data.item.username || "" + data.item.id).slice(0, 1) }}</div>
				</v-list-item-avatar>
			</template>
		</template>
	</v-autocomplete>
</template>

<script>
import axios from "axios";

export default {
	name: "user-list",
	props: {
		label: {
			type: String,
			required: true,
		},
		hint: {
			type: String,
			required: true,
		},
		value: {
			required: true,
		},
	},
	data() {
		return {
			val: [],
			users: [],
		};
	},
	methods: {
		remove(id) {
			const index = this.val.indexOf(id);
			if (index >= 0) this.val.splice(index, 1);
		},
		getUsersIDs() {
			axios
				.get(`${this.$root.apiURL}/users/names`)
				.then((res) => {
					this.users = res.data.sort((a, b) => {
						if (!a.username && !b.username) return 0;
						if (!a.username && b.username) return 1;
						if (a.username && !b.username) return -1;

						return a.username > b.username ? 1 : b.username > a.username ? -1 : 0;
					});
				})
				.catch((err) => {
					console.trace(err);
				});
		},
	},
	watch: {
		val(n) {
			this.$emit("input", n);
		},
		value: {
			handler(n) {
				this.val = n;
			},
			immediate: true,
		},
	},
	mounted() {
		this.getUsersIDs();
	},
};
</script>
