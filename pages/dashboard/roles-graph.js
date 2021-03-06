export default {
  name: 'roles-graph',
  props: {
    series: {
      required: true,
      type: Array
    },
    labels: {
      required: true,
      type: Array
    },
    colors: {
      required: true,
      type: Array
    }
  },
  template: `
<v-row class="roles-graph mt-0" dense>
  <v-col class="flex-sm-shrink-0 flex-grow-0" cols="12" sm="6">
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
      :values="values">
      <tooltip :position="'top'"></tooltip>
    </graph-treemap>
  </v-col>
  <v-col cols="12" sm="6">
    <v-row dense>
      <v-col v-for="(value, index) in values" :key="value[1]" cols="12" sm="6" class="d-flex align-stretch">
        <p class="rounded-lg pa-2 mb-0 flex-grow-1">
          <span class="mr-1 rounded d-inline-block" :style="{'background-color': shade[index], height: '10px', width: '10px'}"></span>
          <span class="font-weight-medium text--primary">{{ value[2] }}</span> {{ value[1] }}
        </p>
      </v-col>
    </v-row>
  </v-col>
</v-row>
`,
  data: function() {
    return {
      ratio: 5/3,
      height: 314,
      renderComponent: true
    }
  },
  computed: {
    width: function() {
      return this.height*this.ratio
    },
    theme: function() {
      return this.$root.isDark ? "dark" : "classic"
    },
    values: function() {
      return this.series.map((e, i) => {
        return [this.labels[i], e]
      }).sort((a, b) => b[1] - a[1])
      .map((e, i) => [i, ...e])
    },
    shade: function() {
      let start = this.GColor(this.colors[this.colors.length - 1])
      let end = this.GColor(this.colors[0])

      return this.createColorRange(
        start,
        end,
        this.labels.length
      ).map(c => this.toRGB(c))
    }
  },
  methods: {
    GColor: function(r,g,b) {
      if(r !== undefined && g === undefined && b === undefined) {
        g = Number.parseInt(r.slice(3, 5), 16)
        b = Number.parseInt(r.slice(5, 7), 16)
        r = Number.parseInt(r.slice(1, 3), 16)
      }
      r = (typeof r === 'undefined')?0:r;
      g = (typeof g === 'undefined')?0:g;
      b = (typeof b === 'undefined')?0:b;
      return {r:r, g:g, b:b};
    },
    toRGB(gcolor) {
      return `rgb(${gcolor.r}, ${gcolor.g}, ${gcolor.b})`
    },
    forceRerender() {
      // Remove my-component from the DOM
      this.renderComponent = false;

      this.$nextTick(() => {
        // Add the component back in
        this.renderComponent = true;
      })
    },
    createColorRange: function(c1, c2, n=255) {
      var colorList = [], tmpColor, variance;
      for (var i=0; i<n; i++) {
          tmpColor = this.GColor();
          // i E [[0;n[[
          // i * 255 E [[0; 255*n [[
          // i * 255 / n [[0 ; 255 [[
          variance = i*255/n;
          tmpColor.g = c1.g + ((variance*(c2.g-c1.g))/255);
          tmpColor.b = c1.b + ((variance*(c2.b-c1.b))/255);
          tmpColor.r = c1.r + ((variance*(c2.r-c1.r))/255);
          colorList.push(tmpColor);
      }
      return colorList;
    }
  },
  created: function() {
    if(this.series.length !== this.labels.length) {
      throw new Error('Failed to parse series and labels')
    }
  },
  watch: {
    theme: function() {
      this.forceRerender()
    }
  }
}