
/**
 * Room can only contain specific characters.
 * @param {unknown} room
 * @returns {room is Room} */
export default function validateRoom(room) {
  return typeof room === 'string' && room.length > 0 && !/[^a-zA-Z0-9-']/.test(room);
}

/** @typedef {string & { __brand: 'Room' }} Room */