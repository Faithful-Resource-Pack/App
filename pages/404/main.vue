<template>
	<div id="background-404" class="white--text text-center">
		<h4 class="text-h4 pt-10">{{ $root.lang().missing_page.title }}</h4>
		<p class="text-body-1 mb-0 mt-7">{{ $root.lang().missing_page.description }}</p>
		<p class="text-body-1 mt-0">
			<!-- horrible hack for hrefs -->
			<span v-for="(str, i) in $root.lang().missing_page.main_page.split('%')" :key="str">
				<router-link v-if="i % 2 !== 0" to="/dashboard">
					{{ str }}
				</router-link>
				<span v-else>{{ str }}</span>
			</span>
		</p>
	</div>
</template>

<script>
export default {
	name: "missing-page",
};
</script>
