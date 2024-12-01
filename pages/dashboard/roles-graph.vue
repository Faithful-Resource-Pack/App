<template>
	<v-row class="roles-graph mt-0" dense>
		<v-col class="flex-sm-shrink-0 flex-grow-0" cols="12" sm="6" id="roles-graph-cell">
			<v-skeleton-loader v-if="loading || !renderComponent" id="graph-loader" type="image" />
			<graph-treemap
				v-if="renderComponent"
				:theme="theme"
				:width="width"
				:height="height"
				:paddingTop="1"
				:paddingBottom="1"
				:paddingLeft="1"
				:paddingRight="1"
				:showText="false"
				:titleDepth="0"
				:colors="shade"
				:values="values"
			>
				<tooltip position="top" />
			</graph-treemap>
		</v-col>
		<v-col cols="12" sm="6">
			<v-row dense>
				<template v-if="loading">
					<v-col
						v-for="i in 14"
						:key="`list-contributor-skeleton-${i}`"
						cols="12"
						sm="6"
						class="d-flex align-stretch"
					>
						<div
							class="p rounded-lg pa-2 mb-0 flex-grow-1 d-flex align-center"
							style="min-height: 38px"
						>
							<v-skeleton-loader type="text" class="" width="75%" />
						</div>
					</v-col>
				</template>
				<template v-else>
					<v-col
						v-for="(value, key, index) in types"
						:key="`list-contributor-${key}`"
						cols="12"
						sm="6"
						class="d-flex align-stretch"
					>
						<p class="rounded-lg pa-2 mb-0 flex-grow-1">
							<span
								class="mr-1 rounded d-inline-block"
								:style="{ 'background-color': shade[index], height: '10px', width: '10px' }"
							/>
							<span class="font-weight-medium text--primary">{{ value }}</span> {{ key }}
						</p>
					</v-col>
				</template>
			</v-row>
		</v-col>
	</v-row>
</template>

<script>
import GraphTreemap from "vue-graph/src/components/treemap.js";
import Tooltip from "vue-graph/src/widgets/tooltip.js";

export default {
	name: "roles-graph",
	components: {
		GraphTreemap,
		Tooltip,
	},
	props: {
		series: {
			required: true,
			type: Array,
		},
		labels: {
			required: true,
			type: Array,
		},
		loading: {
			required: true,
			type: Boolean,
		},
		colors: {
			required: true,
			type: Array,
		},
	},
	data() {
		return {
			ratio: 5 / 3,
			height: 314,
			renderComponent: false,
		};
	},
	computed: {
		width() {
			return this.height * this.ratio;
		},
		theme() {
			return this.$root.isDark ? "dark" : "classic";
		},
		types() {
			return this.labels.reduce((acc, cur, i) => {
				acc[cur] = this.series[i];
				return acc;
			}, {});
		},
		values() {
			return this.series
				.map((e, i) => {
					return [this.labels[i], e];
				})
				.sort((a, b) => b[1] - a[1])
				.map((e, i) => [i, ...e]);
		},
		shade() {
			const start = this.GColor(this.colors[this.colors.length - 1]);
			const end = this.GColor(this.colors[0]);

			return this.createColorRange(start, end, this.labels.length).map((c) => this.toRGB(c));
		},
	},
	methods: {
		GColor(r, g, b) {
			if (r !== undefined && g === undefined && b === undefined) {
				g = Number.parseInt(r.slice(3, 5), 16);
				b = Number.parseInt(r.slice(5, 7), 16);
				r = Number.parseInt(r.slice(1, 3), 16);
			}
			r = typeof r === "undefined" ? 0 : r;
			g = typeof g === "undefined" ? 0 : g;
			b = typeof b === "undefined" ? 0 : b;
			return { r: r, g: g, b: b };
		},
		toRGB(gColor) {
			return `rgb(${gColor.r}, ${gColor.g}, ${gColor.b})`;
		},
		forceRerender() {
			// Remove component from the DOM
			this.renderComponent = false;

			this.$nextTick(() => {
				// Add the component back in
				this.renderComponent = true;
			});
		},
		createColorRange(c1, c2, n = 255) {
			const colorList = [];
			let tmpColor;
			let variance;
			for (let i = 0; i < n; i++) {
				tmpColor = this.GColor();
				// i E [[0;n[[
				// i * 255 E [[0; 255*n [[
				// i * 255 / n [[0 ; 255 [[
				variance = (i * 255) / n;
				tmpColor.g = c1.g + (variance * (c2.g - c1.g)) / 255;
				tmpColor.b = c1.b + (variance * (c2.b - c1.b)) / 255;
				tmpColor.r = c1.r + (variance * (c2.r - c1.r)) / 255;
				colorList.push(tmpColor);
			}
			return colorList;
		},
	},
	created() {
		if (this.series.length !== this.labels.length)
			throw new Error("Failed to parse series and labels");
	},
	watch: {
		theme() {
			this.forceRerender();
		},
		loading(n) {
			if (n === false) this.renderComponent = true;
		},
	},
};
</script>
