/* global axios, Vue */

export default {
  name: "pack-page",
  template: `
		<v-container>
			<div class="text-h4 py-4">
				{{ $root.lang().database.titles.packs }}
			</div>
		</v-container>
	`,
};
