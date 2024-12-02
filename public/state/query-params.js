export function searchParams() {
	return new URLSearchParams(location.search);
}

/** @param {(params: URLSearchParams) => URLSearchParams} update */
export function updateParams(update) {
	location.search = update(searchParams()).toString();
}
