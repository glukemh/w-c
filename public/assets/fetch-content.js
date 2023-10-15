import { df } from "./node-utils.js";
export default async function fetchContent(handle) {
	const res = await fetch(`/assets/${handle}.html`);
	if (!res.ok)
		throw new Error(`fetchTemplate: ${res.status} ${res.statusText}`);
	return df(await res.text());
}
