export default async function mixinForMixins(mixins) {
	mixins = await Promise.all(mixins);
	return (Base) => mixins.reduce((a, b) => b(a), Base);
}
