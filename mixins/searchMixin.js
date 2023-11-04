export default {
	methods: {
		/**
		 * Loads all search params
		 * @returns {URLSearchParams}
		 */
		search_load: function () {
			const query_str = location.hash.split("?")[1] || "";
			return new URLSearchParams(query_str);
		},
		/**
		 * Gets a specific param
		 * @param {string} name Search param name
		 * @returns {String|null} param value
		 */
		search_get: function (name) {
			return this.load().get(name);
		},
		/**
		 * Updates search param with new
		 * @param {string} name Search param name
		 * @param {any} value given value
		 */
		search_set: function (name, value) {
			const str_val = String(value);

			const loaded = this.search_load();
			loaded.set(name, str_val);

			this._search_update(loaded);
		},
		search_delete: function (name) {
			const loaded = this.search_load();

			loaded.delete(name);

			this._search_update(loaded);
		},
		/**
		 * update hash search
		 * @param {URLSearchParams} search_params updated params
		 */
		_search_update: function (search_params) {
			let query_str = "?" + search_params.toString();

			let hash = location.hash;
			if (hash.indexOf("?") !== -1) hash = hash.substring(0, hash.indexOf("?"));
			hash += query_str;

			location.hash = hash;
		},
	},
};
