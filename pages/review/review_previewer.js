const ReviewPreview = () => import('./review_preview.js')

export default {
    name: "review-previewer",
    components: {
        ReviewPreview
    },
    props: {
        addonId: {
            type: String,
            required: false,
            default: undefined
        },
        color: {
            type: String,
            required: false,
            default: 'black'
        }
    },
    template: `
<div>
    <template v-if="addonId === undefined">
        <div
            id="preview-here"
            class="rounded-xl d-flex align-center justify-center"
            :style="{border: '4px solid ' + color}"
        >
            <h2 class="h3">PREVIEW HERE</h2>
        </div>
    </template>
    <template v-else>
        <ReviewPreview :addonId="addonId" />
    </template>
</div>`
}