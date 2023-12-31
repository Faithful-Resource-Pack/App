/* global axios, d3, moment */
export default {
	name: "contributor-page",
	components: {},
	template: `
    <v-container>
      <div class="text-h4 py-4">
        {{ $root.lang().statistics.title }}
      </div>

      <div class="text-center mb-4">
        <div id="graph"></div>
      </div>

      <v-card>
        <v-container>
          <v-row class="text-center">
            <v-col>
              <h3>{{ texturesCount }}</h3>
              {{ $root.lang().statistics.label.textures }}
            </v-col>
            <v-col>
              <h3>{{ authorsCount }}</h3>
              {{ $root.lang().statistics.label.contributors }}
            </v-col>
            <v-col>
              <h3>{{ contributionsCount }}</h3>
              {{ $root.lang().statistics.label.contributions }}
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-container>`,
	data() {
		return {
			texturesCount: 0,
			authorsCount: 0,
			contributionsCount: 0,
			contrib: [],
		};
	},
	methods: {
		getData() {
			axios
				.get(`${this.$root.apiURL}/contributions/raw`)
				.then((res) => Object.values(res.data))
				.then((data) => {
					this.contributionsCount = data.length;

					const authors = data.map((el) => el.authors).flat();
					const textures = data.map((el) => el.texture);
					const packs = data.map((el) => el.pack);

					this.authorsCount = authors.filter((el, index) => authors.indexOf(el) === index).length;
					this.texturesCount = textures.filter(
						(el, index) => textures.indexOf(el) === index,
					).length;

					this.contrib = Object.values(
						data.reduce((ac, val) => {
							val.date = moment(new Date(val.date)).startOf("day").unix() * 1000;

							if (!(val.date in ac)) {
								// start for date
								ac[val.date] = {
									date: val.date,
									pack: {},
								};

								// start all res to 0
								packs.forEach((p) => {
									ac[val.date].pack[p] = 0;
								});
							}

							ac[val.date].pack[val.pack]++;

							return ac;
						}, {}),
					);

					this.contrib.sort((a, b) => a.date - b.date);
					this.buildGraph();
				})
				.catch(function (error) {
					this.$root.showSnackBar(err, "error");
				});
		},

		buildGraph() {
			const width = 800;
			const height = 500;
			const spacing = 80;
			const legendCellSize = 20;

			let data = this.contrib;

			// get all resolutions in provided
			const allPack = data.length === 0 ? [] : Object.keys(data[0].pack).reverse();

			// flat data (because stacked data is dumb)
			data = this.contrib.map((el) => {
				allPack.forEach((p) => {
					el[p] = el.pack[p];
				});
				delete el.pack;
				el.date = new Date(el.date);
				return el;
			});

			this.changeDates(data);

			// sort by date
			data.sort((a, b) => a.date - b.date);

			// first data are fucked
			data = data.slice(4);

			// January first of 2021 is the Firestorm import with unknown dates to filter it too
			data = data.filter((d, index) => index !== 4 && d.date !== new Date("2021-01-01").getTime());

			const xScale = d3
				.scaleBand()
				.domain(data.map((d) => d.date))
				.range([0, width - spacing])
				.padding(0.1);

			const yScale = d3.scaleLinear().range([height - spacing, 0]);

			// add center content inside svg
			const svg = d3
				.select(document.getElementById("graph"))
				.append("svg")
				.attr("width", width)
				.attr("height", height)
				.append("g")
				.attr("transform", "translate(" + spacing + "," + spacing / 4 + ")");

			// create default time format
			const timeFormat = d3.timeFormat("%b %d %Y");

			// add bottom axis
			const domain = xScale.domain();
			const totalTicks = 8;
			const diffVided = Math.round(domain.length / totalTicks);
			const values = domain.filter((el, index) => {
				return index === 0 || index === domain.length - 1 || index % diffVided === 0;
			});
			values.pop();
			const xAxis = d3.axisBottom(xScale).tickValues(values).tickFormat(timeFormat);

			svg
				.append("g")
				.attr("transform", "translate(0, " + (height - spacing) + ")")
				.call(xAxis)
				.selectAll("text")
				.style("text-anchor", "end")
				.attr("dx", "-.15em")
				.attr("dy", ".15em")
				.attr("transform", function () {
					return "rotate(-45)";
				});

			// create stack data from
			const stack = d3.stack().keys(allPack).order(d3.stackOrderNone).offset(d3.stackOffsetNone);

			const series = stack(data);

			console.log(series);

			const [max, secondMax] = data
				.map((d) => d.faithful_32x + d.faithful_64x)
				.reduce(
					(acc, cur) => {
						if (cur > acc[0]) {
							acc[1] = acc[0];
							acc[0] = cur;
						} else if (cur > acc[1]) {
							acc[1] = cur;
						}
						return acc;
					},
					[0, 0],
				);

			// scale y
			if (series.length) yScale.domain([0, secondMax]);

			// add left axis
			svg.append("g").call(d3.axisLeft(yScale));

			const colors = ["#cccccc", "#333333"];
			const groups = svg
				.selectAll("g.series")
				.data(series)
				.enter()
				.append("g")
				.attr("class", "series")
				.style("fill", (d, i) => colors[i % colors.length]);

			const div = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

			groups
				.selectAll("rect")
				.data((d) => d)
				.enter()
				.append("rect")
				.attr("x", (d) => xScale(d.data.date))
				.attr("width", xScale.bandwidth())
				.attr("y", (d) => yScale(d[1]))
				.attr("height", (d) => height - spacing - yScale(d[1] - d[0]))
				.on("mouseover", function (...args) {
					const [event, d] = args;
					div.transition().duration(200).style("opacity", 0.9);
					div
						.html(
							timeFormat(d.data.date) +
								"<br><b>" +
								reverseKeysTitle[reverseKeys[d[0] === 0 ? 0 : 1]] +
								"</b> contributions<br><span class='number'>" +
								(d[1] - d[0]) +
								"</span>",
						)
						.style("left", event.pageX + "px")
						.style("top", event.pageY + "px");
				})
				.on("mousemove", function (event) {
					div.style("left", event.pageX + "px").style("top", event.pageY + "px");
				})
				.on("mouseout", function () {
					div.transition().duration(500).style("opacity", 0);
				});

			const reverseColors = colors.reverse(); // To show categories in the same order as they are used
			const reverseKeys = allPack.reverse();

			const reverseKeysTitle = {
				faithful_32x: "faithful_32x",
				faithful_64x: "faithful_64x",
			};

			const legend = svg
				.append("g")
				.attr("transform-origin", "top right")
				.attr("transform", "translate(" + (width - 150) + ", 20)");

			// For each color, we add a square always at the same position on the X axis
			// and moved depending on the square size & the index of color used in the Y axis
			legend
				.selectAll()
				.data(reverseColors)
				.enter()
				.append("rect")
				.attr("height", legendCellSize + "px")
				.attr("width", legendCellSize + "px")
				.attr("x", -25)
				.attr("y", (d, i) => i * legendCellSize)
				.style("fill", (d) => d);

			// We do the same with labels but we add 10px of margin
			legend
				.selectAll()
				.data(reverseKeys.map((e) => reverseKeysTitle[e]))
				.enter()
				.append("text")
				.attr(
					"transform",
					(d, i) =>
						"translate(" +
						(legendCellSize - 20) +
						", " +
						(i * legendCellSize + (legendCellSize - 13) / 2) +
						")",
				)
				.attr("dy", legendCellSize / 1.6) // To center the text vertically to squares
				.style("font-size", "13px")
				.style("fill", "grey")
				.text((d) => d);
		},

		changeDates(data) {
			const dayArray = [];

			const lastDay = moment("2021-03-30");
			const day = moment("2020-08-01");

			const secondsPerMinute = 60;
			const secondsPerHour = 60 * secondsPerMinute;
			const secondsPerDay = 24 * secondsPerHour;
			const secondsPerMonth = 30.146 * secondsPerDay;
			const secondsPerYear = 365 * secondsPerDay;

			while (day.diff(lastDay) !== 0) {
				const stringDay = day.format("YYYY-DD-MM");
				const badDaySplit = stringDay.split("-").map((el) => parseInt(el));
				const time =
					(badDaySplit[0] - 1970) * secondsPerYear +
					(badDaySplit[1] - 1) * secondsPerMonth +
					badDaySplit[2] * secondsPerDay;
				dayArray.push({
					oriDate: new Date(day.unix() * 1000),
					ori: day.unix(),
					final: moment(stringDay).unix() || time,
				});
				day.add(1, "day");
			}

			const now = Date.now();
			data.forEach((d) => {
				if (d.date > now) {
					const m = moment(d.date).startOf("day").unix();
					const matches = dayArray.filter((el) => Math.abs(el.final - m) < secondsPerMonth);
					matches.sort((a, b) => Math.abs(a.final - m) - Math.abs(b.final - m));
					if (matches.length) {
						d.date = matches[0].oriDate;
					}
				}
			});
		},
	},
	created() {
		this.getData();
	},
};
