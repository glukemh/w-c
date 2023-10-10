export default async function contentFragment(handle) {
	const res = await fetch(`/assets/${handle}.html`);
	if (!res.ok)
		throw new Error(`fetchTemplate: ${res.status} ${res.statusText}`);
	const text = await res.text();
	const template = document.createElement("template");
	template.innerHTML = text;
	return template.content;
}
