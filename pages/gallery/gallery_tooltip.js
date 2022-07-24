const Chain = function (val) {
  return {
    value: val,
    chain: function (predicate) {
      if (this.value !== undefined) return Chain(predicate(this.value))
      return this
    }
  }
}

export default {
  name: 'texture-tooltip',
  props: {
    texture: {
      type: Object,
      required: true
    },
    mojang: {
      type: Boolean,
      required: true
    },
    contributions: {
      type: Array,
      required: true
    },
    resolution: {
      type: String,
      required: true,
    },
    discordIDtoName: {
      type: Function,
      required: true
    }
  },
  template: `
<div class="tooltip"><div class="texture-tooltip">
    <div class="texture-info-container">
        <h1 align="left" class="encased">
            {{ texture.textureID + '&nbsp;&dash;&nbsp;' + texture.name }}
        </h1>
        <ul align="left" class="encased">
          <li v-if="mojang"><i class="icon-mojang-red"></i> Mojang Studios</li>
          <li v-else-if="last_contribution !== undefined">
            <p><i :class="icon"></i> {{ last_contribution_names }}</p>
            <p><i class="icon-time"></i> {{ timestampToDate(last_contribution.date) }}</p>
          </li>
          <li v-else>
            {{ $root.lang('gallery.error_message.contribution_not_found') }}
          </li>
        </ul>
    </div>
    <div class="texture-tags-container">
        <span class="encased" v-for="tag in texture.tags">
            {{ '#' + tag }}
        </span>
    </div>
</div></div>`,
  computed: {
    last_contribution: function () {
      let contribs = Chain(this.contributions)
        .chain(contribs => contribs[this.resolution === '32x' ? 'faithful_32x' : 'faithful_64x'])
        .chain(res_contribs => res_contribs[this.texture.textureID]).value;

      // get best timestamp contrib
      return contribs.reduce((a, b) => (a = a.date > b.date ? a : b), contribs[0]);
    },
    last_contribution_names: function () {
      if (this.last_contribution === undefined) return "";
      return this.last_contribution.contributors.map(d => {
        return this.discordIDtoName(d).replace(/\s/g, '&nbsp;')
      }).join(', ');
    },
    icon: function () {
      return 'icon-people' + (this.last_contribution.contributors.length === 1 ? '' : 's');
    }
  },
  methods: {
    timestampToDate(t) {
      const a = new Date(t);
      return moment(a).format("ll");
    },
  }
}
