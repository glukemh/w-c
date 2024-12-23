/**
 * @param {Request | Response} reqOrRes
 * @returns {Promise<[unknown, Error | null]>}*/
export default async function bodyResult(reqOrRes) {
  const contentType = reqOrRes.headers.get('Content-Type');
  let result;
  /** @type {Error | null} */
  let error = null;
  try {
    switch (contentType) {
      case 'application/json':
        result = await reqOrRes.json();
        break;
      case 'form-data':
        result = await reqOrRes.formData();
        break;
      default:
        result = await reqOrRes.text();
    }
  } catch (e) {
    error = e;
  } finally {
    return [result, error];
  }

}