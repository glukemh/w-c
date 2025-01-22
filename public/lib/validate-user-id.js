/** 
 * @param {string} str
 * @returns {str is UserId} */
export default function validateUserId(str) {
  return str.length > 2;
}

/** @typedef {string & { __brand: 'UserId' }} UserId */