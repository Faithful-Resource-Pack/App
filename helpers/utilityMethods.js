Object.isObject = (item) => item && typeof item === "object" && !Array.isArray(item);

Object.merge = (target, ...sources) => {
	if (!sources.length) return target;
	const source = sources.shift();

	if (Object.isObject(target) && Object.isObject(source)) {
		for (const key in source) {
			if (Object.isObject(source[key])) {
				if (!target[key]) Object.assign(target, { [key]: {} });
				Object.merge(target[key], source[key]);
			} else Object.assign(target, { [key]: source[key] });
		}
	}

	return Object.merge(target, ...sources);
};

Object.equals = (x, y) => {
	// primitives
	if (x === y) return true;

	// if one is an object and one is an array they can't be equal
	if (!(Object.isObject(x) && Object.isObject(y)) && !(Array.isArray(x) && Array.isArray(y)))
		return false;

	// objects have to be same length
	if (Object.keys(x).length != Object.keys(y).length) return false;

	// if any property doesn't exist or isn't deep equal itself it can't be the same
	if (Object.values(x).some((prop) => !y.hasOwnProperty(prop) || !Object.equals(x[prop], y[prop])))
		return false;

	return true;
};

String.prototype.toTitleCase = function () {
	return this.split(/-|_| /g)
		.map((word) => word[0].toUpperCase() + word.slice(1))
		.join(" ");
};

String.urlRegex = new RegExp(
	"^(https?:\\/\\/)?" + // protocol
		"((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
		"((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
		"(\\:\\d+)?(\\/[-a-z\\d%_.~+@]*)*" + // port and path
		"(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
		"(\\#[-a-z\\d_]*)?$", // fragment locator
	"i",
);
