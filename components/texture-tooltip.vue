<template>
	<div class="gallery-tooltip">
		<div class="gallery-tooltip-texture">
			<span class="gallery-tooltip-id">{{ label }}</span>
			<h1 class="encased">{{ title }}</h1>
			<div class="encased">
				<slot />
			</div>
		</div>
		<div class="gallery-tooltip-tags">
			<span v-for="tag in tags" :key="tag" class="encased">
				{{ tag }}
			</span>
		</div>
	</div>
</template>

<script>
/**
 * Tooltip shown over the textures of a gallery grid, the body goes in the default slot
 */
export default {
	name: "texture-tooltip",
	props: {
		// small badge on the top left corner
		label: {
			type: String,
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		tags: {
			type: Array,
			required: false,
			default: () => [],
		},
	},
};
</script>

<style lang="scss">
.tippy-backdrop {
	background: transparent;
}

// since it gets mounted outside the vuetify part we need to reapply some styles
.gallery-tooltip {
	font-family: "Roboto", sans-serif;
}

.gallery-tooltip i {
	// tooltip icons really hate being white for some reason
	color: white !important;
}

.gallery-tooltip-texture {
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: left;
	position: relative;
}

// in the flow (and not absolute) so a long id widens the tooltip instead of overflowing it
.gallery-tooltip-id {
	position: relative;
	z-index: 1;
	align-self: flex-start;
	white-space: nowrap;
	margin-bottom: -11px;
	font-weight: bold;
	padding: 0 6px;

	font-size: 14px;
	height: 22px;
	line-height: 22px;
	border-radius: 3px;
	margin-left: -3px;
	margin-top: -11px;
}
.gallery-tooltip-texture h1 {
	padding-top: 8px;
	text-align: center;
	word-break: break-all;
}

.gallery-tooltip-tags {
	width: 100%;
	display: flex;
	flex-direction: row;
	justify-content: left;
}

.gallery-tooltip-texture > ul {
	list-style: none;
}

.gallery-tooltip-id,
.encased {
	background-color: #272727;
	box-shadow: 2px 2px 8px 2px rgba(0, 0, 0, 0.4);
}

.tippy-popper,
.tippy-popper * {
	overflow: visible !important;
}

.encased {
	padding: 0.2rem 0.4rem;
	margin-bottom: 3px;
	margin-right: 3px;
	border-radius: 3px;
}
.gallery-tooltip-texture h1.encased {
	border-top-left-radius: 6px;
	border-top-right-radius: 6px;
}
.gallery-tooltip-texture ul.encased {
	border-bottom-right-radius: 6px;
}
.gallery-tooltip-tags .encased:first-child {
	border-bottom-left-radius: 6px;
}
.gallery-tooltip-tags .encased:last-child {
	border-bottom-right-radius: 6px;
}
</style>
