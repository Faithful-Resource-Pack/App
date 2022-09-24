export default {
    methods: {
        /**
         * Loads all search params
         * @returns {URLSearchParams}
         */
        search_load: function() {
            const query_str = location.hash.split('?')[1] || '';
            return new URLSearchParams(query_str);
        },
        /**
         * Gets a specific param
         * @param {string} name Search param name
         * @returns {String|null} param value
         */
        search_get: function(name) {
            return this.load().get(name)
        },
        /**
         * Updates search param with new 
         * @param {string} name Search param name
         * @param {any} value given value
         */
        search_set: function(name, value) {
            const str_val = String(value);

            const loaded = this.search_load();
            loaded.set(name, str_val);
            let query_str = '?' + loaded.toString();

            let hash = location.hash;
            if(hash.indexOf('?') !== -1) hash = hash.substring(0, hash.indexOf('?'));
            hash += query_str;

            location.hash = hash;
        }
    }
}