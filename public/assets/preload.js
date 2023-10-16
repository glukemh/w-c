export default function preload(href, as) {
	if (document.head.querySelector(`link[rel="preload"][href="${href}"]`))
		return;
	const link = document.createElement("link");
	link.rel = "preload";
	link.href = href;
	link.as = as;
	document.head.append(link);
}
