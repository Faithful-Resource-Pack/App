<template>
	<modal-form
		v-model="modalOpened"
		:title="$root.lang().database.titles.change_mc_version"
		@close="$emit('close')"
		@submit="send"
	>
		<v-form ref="form">
			<v-row>
				<v-col class="col-12" sm="12">
					<p>{{ $root.lang().database.hints.example_scenario }}</p>
					<v-alert type="warning" class="px-2" outlined dense>
						{{ $root.lang().database.hints.example_scenario_warn }}
					</v-alert>
				</v-col>
			</v-row>
			<v-row>
				<v-col class="col-12" sm="12">
					<v-form ref="form">
						<v-text-field
							:color="color"
							required
							v-model="form.old"
							:label="$root.lang().database.labels.current_mc_version"
						/>
						<v-text-field
							:color="color"
							required
							v-model="form.new"
							:label="$root.lang().database.labels.new_mc_version"
						/>
					</v-form>
				</v-col>
			</v-row>
		</v-form>
	</modal-form>
</template>

<script>
import ModalForm from "@components/modal-form.vue";
import axios from "axios";

export default {
	name: "modify-version-modal",
	components: {
		ModalForm,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		color: {
			type: String,
			required: false,
			default: "primary",
		},
	},
	data() {
		return {
			modalOpened: false,
			form: {
				old: settings.versions.java[0],
				new: settings.versions.java[0],
			},
		};
	},
	methods: {
		send() {
			const data = JSON.parse(JSON.stringify(this.form));
			data.token = this.$root.user.access_token;

			const old_version = this.form.old;
			const new_version = this.form.new;
			axios
				.put(
					`${this.$root.apiURL}/paths/versions/modify/${old_version}/${new_version}`,
					null,
					this.$root.apiOptions,
				)
				.then(() => {
					this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
					this.$emit("close", true);
				})
				.catch((err) => {
					console.error(err);
					this.$root.showSnackBar(err, "error");
				});
		},
	},
	watch: {
		value(newValue) {
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			this.$nextTick(() => this.$refs.form.reset());
			this.$emit("input", newValue);
		},
	},
};
</script>
