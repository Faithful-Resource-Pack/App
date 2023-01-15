const FullscreenPreview = () => import('../addon/fullscreen-preview.js')
const ImagePreviewer = () => import('../addon/image-previewer.js')

export default {
    name: "review-preview",
    components: {
      FullscreenPreview,
      ImagePreviewer
    },
    props: {
        addonId: {
            type: String,
            required: false,
            default: undefined
        },
    },
    template: `
<div id="review-preview" class="d-flex flex-column">
    <v-card flat style="height: 100%;" class="rounded-lg pa-2 overflow-x-hidden">
        <fullscreen-preview
        ref="preview"
        :src="imagePreview"
        />
        <template v-if="addonInPanelLoading === true">
            <p>{{ $root.lang().global.loading }}</p>
        </template>
        <template v-else>
            <div class="pb-2 d-flex align-center">
                <div>
                    <h2 class="h6" style="line-height: 24px">{{addonInPanel.name}} <span class="text--secondary font-weight-regular">{{ '#' + addonInPanel.id }}</span></h2>
                    <div class="text--secondary subtitle-2 mt-1" style="line-height: 14px;">{{([...addonInPanel.options.tags]||[]).sort().join(' | ')}}</div>
                </div>
                <v-btn
                    id="edit-btn"
                    icon class="ml-auto"
                    :href="'/#/addons/edit/' + addonInPanel.id"
                >
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
            </div>
            <v-row id="review-general">
                <v-col cols="12" sm="7" style="position: relative;">
                    <v-img 
                        @click.stop="(e) => { $refs.preview.open(); imagePreview = addonInPanelHeaderURL }"
                        :src="addonInPanelHeaderURL" 
                        :aspect-ratio="16/9" 
                        style="border-radius: 5px;" 
                        alt="Header not found!"
                        class="image-fullscreen-thumb"
                        >
                        <template v-slot:placeholder>
                            <v-row
                            class="fill-height ma-0"
                            align="center"
                            justify="center"
                            style="background-color: rgba(255,255,255, 0.1);"
                            >
                                <v-progress-circular
                                    v-if="addonInPanelHeaderURL != null"
                                    indeterminate
                                    color="grey lighten-5"
                                />
                                <v-icon v-else x-large>mdi-image-off</v-icon>
                            </v-row>
                        </template>
                    </v-img>
                    
                    <v-card class="ma-2" rounded style="display: inline-block; position: absolute; right: 10px; top: 10px;">
                        <v-icon small class="ma-1" @click.stop="(e) => { $refs.preview.open(); imagePreview = addonInPanelHeaderURL }">
                            mdi-fullscreen
                        </v-icon>
                    </v-card>
                </v-col><v-col cols="12" sm="5">
                    <v-list-item-title v-text="$root.lang().review.addon.titles.authors" class="uppercased" />
                    <div class="text--secondary" style="margin-bottom: 10px;" >
                        {{ addonInPanel.authors.map(id => getUsername(id)).join(", ") }}
                    </div>

                    <v-list-item-title v-text="$root.lang().review.addon.titles.links" class="uppercased"/>
                    <div class="text--secondary" style="margin-bottom: 10px;">
                    <ul v-for="file in addonInPanel.files.filter(f => f.use === 'download')">
                        <li>{{ file.name }} - 
                            <a :href="file.source" class="text--secondary">{{ $root.lang().review.addon.labels.link }}
                                <v-icon small color="light-blue">mdi-open-in-new</v-icon>
                            </a>
                        </li>
                    </ul>
                    </div> 
                    
                    <v-list-item-title v-text="$root.lang().review.addon.titles.options" class="uppercased"/>
                    <div>
                        <!-- <v-icon small v-text="addonInPanel.options.comments ? 'mdi-checkbox-marked-outline' : 'mdi-checkbox-blank-outline'"/> {{ $root.lang().review.addon.labels.comments }} -->
                        <!-- <br> -->
                        <v-icon small v-text="addonInPanel.options.optifine ? 'mdi-checkbox-marked-outline' : 'mdi-checkbox-blank-outline'"/> {{ $root.lang().review.addon.labels.optifine }}
                    </div>
                </v-col>
            </v-row>

            <template v-if="addonSources.length > 0">
                <v-list-item-title v-text="$root.lang().addons.images.title" class="uppercased my-2"/>
                <ImagePreviewer :sources="addonSources" :deletable="false" />
            </template>

            <v-list-item-title v-text="$root.lang().review.addon.titles.description" class="uppercased py-2"/>
            <v-container class="markdown" :style="{ 'background-color': 'rgba(0,0,0, ' + String($root.isDark ? 0.2 : 0.05) + ')' }" v-html="$root.compiledMarkdown(addonInPanel.description)" />

        </template>
    </v-card>
    <div v-if="addonInPanel.approval.status === 'pending'" class="mt-2 rounded-lg pa-2">
        <v-list-item-title v-text="$root.lang().addons.general.reason.title" class="uppercased pb-1"/>
        <div>
            {{ addonInPanel.approval.reason }}
        </div>
    </div>
    <div v-if="addonInPanelLoading === false" id="review-actions" class="mt-2 rounded-lg pa-2">
        <div class="d-flex align-center">
            <div class="mr-auto">
                <div v-if="addonInPanel.approval.status === 'approved'">
                    {{ $root.lang().review.addon.labels.approved_by + ' ' + getUsername(addonInPanel.approval.author) }}
                </div>
                <div v-if="addonInPanel.approval.status === 'denied' || addonInPanel.approval.status === 'archived'">
                    <div>{{ $root.lang().review.addon.labels.denied_by + ' ' + getUsername(addonInPanel.approval.author) + ':' }}</div>
                    <div class="text--secondary">{{ addonInPanel.approval.reason }}</div>
                </div>
            </div>
            <v-btn
                text
                color="teal"
                :disabled="status == 'approved'"
                @click="reviewAddon(addonId, 'approved')"
            >
            {{ $root.lang().global.btn.approve }}
            </v-btn><v-btn
                text
                color="red"
                :disabled="status == 'denied'"
                @click="openDenyPopup(addonInPanel)"
            >
            {{ $root.lang().global.btn.deny }}
            </v-btn><v-btn
                text
                color="gray"
                :disabled="status == 'archived'"
                @click="openDenyPopup(addonInPanel, 'archive')"
            >
            {{ $root.lang().global.btn.archive }}
            </v-btn>
        </div>
    </div>
</div>`,
  data() {
    return {
      imagePreview: "",
      dialogAddon: {},
      dialogOpen: false,

      addonInPanelLoading: true,
      addonInPanel: {},
      addonURL: undefined,
      addonInPanelHeaderURL: undefined,
      contributors: []
    }
  },
  computed: {
    addonSources: function() {
        return (this.addonInPanel.files || [])
            .filter(f => f.use === 'carousel' || f.use === 'screenshot')
            .map(f => f.source)
    },
    status: function() {
        return this.addonInPanel && this.addonInPanel.approval ? this.addonInPanel.approval.status : undefined
    }
  },
  watch: {
    addonId: {
        handler: function(n) {
            if(n === undefined) return
            this.getAddon(n)
        },
        immediate: true
    }
  },
  methods: {
    getAddon: function (id) {
      this.addonInPanelLoading = true

      // allSettled if no header res
      Promise.allSettled([
        axios.get(`${this.$root.apiURL}/addons/${id}/all`, this.$root.apiOptions),
        axios.get(`${this.$root.apiURL}/addons/${id}/files/header`, this.$root.apiOptions),
      ])
      .then(([res, header_res]) => {
        
        // void value if already here (closing tab)
        if (this.addonInPanel.id === res.value.data.id) {
          this.addonInPanel = {}
          this.addonInPanelLoading = true
          return
        }

        this.addonInPanel = res.value.data
        this.addonInPanelLoading = false
        
        if(header_res.value)
          this.addonInPanelHeaderURL = header_res.value.data + '?t=' + new Date().getTime()
        else
        this.addonInPanelHeaderURL = null
      })
    },
    openDialog: function () {
      this.dialogAddon = this.addonInPanel
      this.dialogOpen = true
    },
    closeDialog: function () {
      this.dialogOpen = false
      this.dialogAddon = {}
      this.update()
    },
    getUsername: function (id) {
      if (id === null || id === undefined) return 'Herobrine'
      return this.contributors.filter(c => c.id === id)[0].username || 'Unknown User'
    },
    openDenyPopup: function(...args) {
        this.$root.$emit('openDenyPopup', args)
    },
    reviewAddon: function(...args) {
      this.$root.$emit('reviewAddon', args)
    }
  },
  created: function() {
    axios
      .get(`${this.$root.apiURL}/users/names`)
      .then(res => {
        this.contributors = res.data
      })
      .catch(err => {
        console.error(err)
        this.$root.showSnackBar(err, 'error')
      })
  }
}