/**
 * Generate a range from a series of endpoints
 * @param {[number, number][]} ranges
 * @returns {number[]}
 */
export default function generateRange(ranges) {
	// flatMap is the "one to many" array method, which is needed for a range
	const res = ranges.flatMap((range) => {
		if (range.length === 1) return range[0];
		const start = Math.min(range[1], range[0]);
		const length = Math.abs(range[1] - range[0]) + 1;
		return Array.from({ length }, (_, n) => n + start);
	});

	// remove duplicates
	return Array.from(new Set(res)).sort((a, b) => (a === b ? 0 : a < b ? -1 : 1));
}
