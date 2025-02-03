/** @returns {Generator<IdFormat, IdFormat>} */
export function* uniqueIds() {
  const rand = /** @type {`.${bigint}`} */(Math.random().toString().slice(1));
  let i = 0n;
  while (true) {
    yield `${i++}${rand}`;
  }
}

export default function uniqueId() {
  return uniqueIds().next().value;
}

/** @typedef {`${bigint}.${bigint}`} IdFormat */