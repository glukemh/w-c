/** @param {string} url */
export function redirect(url) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: url
    }
  });
}