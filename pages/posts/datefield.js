export default {
	name: 'date-field',
	props: {
		format: {
			type: String,
			required: false,
			default: () => "DD-MM-YYYY"
		},
		value: {
			type: String,
			required: true
		},
		invalidMessage: {
			type: String,
			required: true
		}
	},
	template: `
	<v-text-field
		type="date"
		v-model="content"
		v-bind="$attrs"
		@change="handleInput"
	/>`,
	data() {
		return {
			content: this.value
		}
	},
	watch: {
		value: {
			handler: function () {
				const mom = moment(this.value, this.format)
				if (mom.isValid())
					this.content = mom.format("YYYY-MM-DD")
				else
					this.$emit('error', this.invalidMessage)
			},
			immediate: true
		}
	},
	methods: {
		handleInput(v) {
			let mom = moment(v, "YYYY-MM-DD")
			console.log(mom)
			if (mom.isValid()) {
				const outVal = mom.format(this.format)
				console.log(outVal)
				this.$emit('input', outVal)
			} else
				this.$emit('error', this.invalidMessage);
		}
	}
}