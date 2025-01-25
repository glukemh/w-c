import validateUserId from "/lib/validate-user-id.js";
import userId from "/sw/state/user-id.js";
import { Route } from "/sw/lib/router.js";
import { returnTo, badInput, somethingWrong } from "/sw/lib/response.js";
import bodyResult from "/sw/lib/body-result.js";

export default new Route('POST', async (req) => {
  try {
    const result = await bodyResult(req);
    if (result instanceof Error) {
      return badInput(result);
    }
    const userIdEntry = result.get('userId');
    if (!validateUserId(userIdEntry)) {
      return badInput('Expecting userId to be a string');
    }
    userId.send(userIdEntry);
    return returnTo(result);
  } catch (e) {
    return somethingWrong(e);
  }
});