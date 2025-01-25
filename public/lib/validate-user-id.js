/** 
 * @param {unknown} userId
 * @returns {userId is UserId} */
export default function validateUserId(userId) {
  return typeof userId === 'string' && userId.length > 2;
}

/** @typedef {string & { __brand: 'UserId' }} UserId */