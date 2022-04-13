/* global axios, d3, moment */
export default {
  name: 'contributor-page',
  components: {
  },
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
              <h3>{{ totalTextures }}</h3>
              {{ $root.lang().statistics.label.textures }}
            </v-col>
            <v-col>
              <h3>{{ totalContributors }}</h3>
              {{ $root.lang().statistics.label.contributors }}
            </v-col>
            <v-col>
              <h3>{{ totalContributions }}</h3>
              {{ $root.lang().statistics.label.contributions }}
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-container>`,
  data() {
    return {
      totalTextures: 0,
      totalContributors: 0,
      totalContributions: 0,
      contrib: []
    }
  },
  methods: {
    getData: function () {
      axios.get('/contributions/stats')
        .then((response) => {
          const data = response.data

          this.totalTextures = data.totalTextures
          this.totalContributors = data.totalContributors
          this.totalContributions = data.totalContributions

          this.contrib = data.contrib

          this.buildGraph()
        })
        .catch(function (error) {
          console.error(error)
          this.$root.showSnackBar(String(error), "error")
        })
    },

    buildGraph: function () {
      const width = 800; const height = 500; const spacing = 80; const legendCellSize = 20

      let data = this.contrib

      // get all resolutions in provided
      const allRes = data.length === 0 ? [] : Object.keys(data[0].res).reverse()

      // flat data (because stacked data is dumb)
      data = this.contrib.map((el) => {
        allRes.forEach(res => {
          el[res] = el.res[res]
        })
        delete el.res
        el.date = new Date(el.date)
        return el
      })

      this.changeDates(data)

      // sort by date
      data.sort((a, b) => a.date - b.date)

      // first data are fucked
      data = data.slice(4)

      // Juanry first of 2021 is the Firestorm import with unknown dates to filter it too
      data = data.filter((d, index) => index !== 4 && d.date !== new Date('2021-01-01').getTime())

      const xScale = d3
        .scaleBand()
        .domain(data.map(d => d.date))
        .range([0, width - spacing])
        .padding(0.1)

      const yScale = d3
        .scaleLinear()
        .range([height - spacing, 0])

      // add center content inside svg
      const svg = d3.select(document.getElementById('graph')).append('svg')
        .attr('width', width).attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + spacing + ',' + spacing / 4 + ')')

      // create default time format
      const timeFormat = d3.timeFormat('%b %d %Y')

      // add botom axis
      const domain = xScale.domain()
      const totalTicks = 8
      const diffVided = Math.round(domain.length / totalTicks)
      const values = domain.filter((el, index) => { return index === 0 || index === domain.length - 1 || index % diffVided === 0 })
      values.pop()
      const xAxis = d3.axisBottom(xScale)
        .tickValues(values)
        .tickFormat(timeFormat)

      svg.append('g')
        .attr('transform', 'translate(0, ' + (height - spacing) + ')')
        .call(xAxis)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.15em')
        .attr('dy', '.15em')
        .attr('transform', function () {
          return 'rotate(-45)'
        })

      // create stack data from
      const stack = d3.stack()
        .keys(allRes)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone)

      const series = stack(data)

      console.log(series)

      const [max, secondMax] = data.map(d => d.c32 + d.c64).reduce((acc, cur) => {
        if(cur > acc[0]) {
          acc[1] = acc[0]
          acc[0] = cur
        } else if(cur > acc[1]) {
          acc[1] = cur
        }
        return acc
      }, [0,0])

      // scale y
      if (series.length) yScale.domain([0, secondMax])

      // add left axis
      svg.append('g')
        .call(d3.axisLeft(yScale))

      const colors = settings.colors.graph
      const groups = svg.selectAll('g.series')
        .data(series)
        .enter()
        .append('g')
        .attr('class', 'series')
        .style('fill', (d, i) => colors[i % colors.length])

      const div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

      groups.selectAll('rect')
        .data(d => d)
        .enter()
        .append('rect')
        .attr('x', d => xScale(d.data.date))
        .attr('width', xScale.bandwidth())
        .attr('y', d => yScale(d[1]))
        .attr('height', d => height - spacing - yScale(d[1] - d[0]))
        .on("mouseover", function (...args) {
          const [event, d] = args
          div.transition()
            .duration(200)
            .style("opacity", .9)
          div.html(timeFormat(d.data.date) + "<br><b>" + reverseKeysTitle[reverseKeys[d[0] === 0 ? 0 : 1]] + "</b> contributions<br><span class='number'>" + (d[1] - d[0]) + '</span>')
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY) + "px")
        })
        .on("mousemove", function (event) {
          div
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY) + "px")
        })
        .on("mouseout", function () {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        });

      const reverseColors = colors.reverse() // Pour présenter les catégories dans le même sens qu'elles sont utilisées
      const reverseKeys = allRes.reverse()

      const reverseKeysTitle = {
        'c32': 'faithful_32x',
        'c64': 'faithful_64x'
      }

      const legend = svg.append('g')
        .attr('transform-origin', 'top right')
        .attr('transform', 'translate(' + (width - 150) + ', 20)')

      // Pour chaque couleur, on ajoute un carré toujours positionné au même endroit sur l'axe X et décalé en fonction de la
      // taille du carré et de l'indice de la couleur traitée sur l'axe Y
      legend.selectAll()
        .data(reverseColors)
        .enter().append('rect')
        .attr('height', legendCellSize + 'px')
        .attr('width', legendCellSize + 'px')
        .attr('x', -25)
        .attr('y', (d, i) => i * legendCellSize)
        .style('fill', d => d)

      // On procéde de la même façon sur les libellés avec un positionement sur l'axe X de la taille des carrés
      // à laquelle on rajoute 10 px de marge
      legend.selectAll()
        .data(reverseKeys.map(e => reverseKeysTitle[e]))
        .enter().append('text')
        .attr('transform', (d, i) => 'translate(' + (legendCellSize - 20) + ', ' + ((i * legendCellSize) + (legendCellSize - 13) / 2) + ')')
        .attr('dy', legendCellSize / 1.6) // Pour centrer le texte par rapport aux carrés
        .style('font-size', '13px')
        .style('fill', 'grey')
        .text(d => d)
    },

    changeDates: function (data) {
      const dayArray = []

      const lastDay = moment('2021-03-30')
      const day = moment('2020-08-01')

      const secondsPerMinute = 60
      const secondsPerHour = 60 * secondsPerMinute
      const secondsPerDay = 24 * secondsPerHour
      const secondsPerMonth = 30.146 * secondsPerDay
      const secondsPerYear = 365 * secondsPerDay

      while (day.diff(lastDay) !== 0) {
        const stringDay = day.format('YYYY-DD-MM')
        const badDaySplit = stringDay.split('-').map(el => parseInt(el))
        const time = (badDaySplit[0] - 1970) * secondsPerYear + (badDaySplit[1] - 1) * secondsPerMonth + badDaySplit[2] * secondsPerDay
        dayArray.push({
          oriDate: new Date(day.unix() * 1000),
          ori: day.unix(),
          final: moment(stringDay).unix() || time
        })
        day.add(1, 'day')
      }

      const now = Date.now()
      data.forEach(d => {
        if (d.date > now) {
          const m = moment(d.date).startOf('day').unix()
          const matches = dayArray.filter(el => Math.abs(el.final - m) < secondsPerMonth)
          matches.sort((a, b) => Math.abs(a.final - m) - Math.abs(b.final - m))
          if (matches.length) {
            d.date = matches[0].oriDate
          }
        }
      })
    }
  },
  created: function() {
    this.getData()
  }
}
