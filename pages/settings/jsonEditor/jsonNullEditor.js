const jsonEditor = () => import("./jsonObjectEditor.js");
const jsonAddEditor = () => import("./jsonAddEditor.js");

var deepEqual = function (x, y) {
	if (x === y) {
		return true;
	} else if (typeof x == "object" && x != null && typeof y == "object" && y != null) {
		if (Object.keys(x).length != Object.keys(y).length) return false;

		for (var prop in x) {
			if (y.hasOwnProperty(prop)) {
				if (!deepEqual(x[prop], y[prop])) return false;
			} else return false;
		}

		return true;
	} else return false;
};

export default {
	name: "json-null-editor",
	template: `
<div>
  <i>null</i>
</div>`,
	props: {
		value: {
			required: true,
		},
		parent: {
			required: false,
			default: undefined,
		},
	},
};
