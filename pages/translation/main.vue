<template>
	<v-container>
		<div class="text-h4 py-4">
			<h4>{{ $root.lang().review.titles.translation }}</h4>
			<br />
			{{ $root.lang().review.translations.description }}
			<a href="https://translate.faithfulpack.net/">https://translate.faithfulpack.net/</a>
		</div>
	</v-container>
</template>

<script>
export default {
	name: "translations-page",
	created() {
		// redirect
		location.href = "https://translate.faithfulpack.net/";
	},
};
</script>
