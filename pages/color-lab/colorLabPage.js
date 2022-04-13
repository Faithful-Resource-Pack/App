const colorLabToolbar = () => import('./colorLabToolbar.js')
const colorLabTile = () => import('./colorLabTile.js')

export default {
  name: 'color-lab-page',
  components: {
    colorLabToolbar,
    colorLabTile
  },
  template: `
<div id="color-lab-page">
  <color-lab-toolbar />
  <v-card id="color-lab-main" class="mx-2 rounded-0">
    <color-lab-tile
      v-for="(color, index) in colors"
      :key="color.color"
      :style="{ 'width': 1/colors.length*100 + '%' }"
      :color="color"
      :plus="index != colors.length - 1"
      :index="index"
      :buttons="activeButtons(index)"

      @left="leftColor"
      @right="rightColor"
      @lock="lockColor"
      @remove="removeColor"
      @add="addColor" />
  </v-card>
</div>
  `,
  data: function() {
    return {
      colors: []
    }
  },
  computed: {
    canDelete: function() {
      return this.colors.length > 2
    }
  },
  methods: {
    activeButtons(index) {
      const locked = this.colors[index].locked
      return {
        remove: locked || !this.canDelete, // disabled if locked or too few left
        left: locked || index == 0, // disabled if lock or first
        right: locked || index == this.colors.length - 1, // disabled if locked or last one
        locked: locked
      }
    },
    leftColor: function(index) {
      if(this.colors[index].locked) return
      const el = this.colors.splice(index, 1)[0]
      this.colors.splice(index - 1, 0, el)
    },
    rightColor: function(index) {
      if(this.colors[index].locked) return
      const el = this.colors.splice(index, 1)[0]
      this.colors.splice(index + 1, 0, el)
    },
    lockColor: function(index) {
      this.colors[index].locked = !this.colors[index].locked;
    },
    removeColor: function(index) {
      if(this.canDelete)
        this.colors.splice(index, 1)
    },
    addColor: function(index) {
      this.colors.splice(index, 0, this.createColorFromHex(this.generateRandomColor()))
    },
    addColorFromHex: function(hex) {
      this.colors.push(this.createColorFromHex(hex))
    },
    createColorFromHex: function(hex) {
      return {
        color: hex,
        locked: false
      }
    },
    generateRandomColor: function() {
      return '#'+(Math.random().toString(16)+'00000').slice(2,8)
    },
    generateDefaultPalette: function() {
      let random_hex
      for(let _ = 0; _ < 5; _++) {
        random_hex = this.generateRandomColor()
        this.addColorFromHex(random_hex)
      }
    },
    regeneratePalette: function() {
      let random_hex
      for(let i = 0; i < this.colors.length; ++i) {
        const col = this.colors[i]
        if(!col.locked) {
          random_hex = this.generateRandomColor()
          col.color = random_hex
        }
      }
    }
  },
  created: function() {
    const scripts = [
        "/resources/js/ntc.js"
    ]

    scripts.forEach(script => {
        let tag = document.head.querySelector(`[src="${ script }"`)
        if (!tag) {
            tag = document.createElement("script")
            tag.setAttribute("src", script)
            tag.setAttribute("type", 'text/javascript')
            document.head.appendChild(tag)
        }
    })
  },
  mounted: function() {
    this.generateDefaultPalette()

    document.onkeyup = (event) => {
      if (event.which == 32 || event.keyCode == 32 || event.key == 32) {
        this.regeneratePalette()
      }
    }
  }
}