/**
 * Redirect to a new location in response to a put or post request
 * @param {string} location */
export function redirect(location) {
  return new Response(null, {
    status: 303,
    headers: {
      Location: location
    }
  });
}

/**
 * Redirect to the location specified in the input parameter as 'returnTo'
 * @param {{ get(key: 'returnTo'): unknown }} input Map or form data object with possible 'returnTo' key
 * @param {string} [defaultLocation] redirect to default location of returnTo is not specified */
export function returnTo(input, defaultLocation = '/') {
  const returnToEntry = input.get('returnTo');
  if (typeof returnToEntry === 'string') {
    defaultLocation = returnToEntry;
  }
  return redirect(defaultLocation);
}

/** @param {Error | string} [error] */
export function badInput(error = new Error('Incorrectly formatted request input')) {
  return errorResponse(error, 400);
}

/** @param {Error | string} [error] */
export function somethingWrong(error) {
  return errorResponse(error, 500);
}

/**
 * @param {Error | string} [error]
 * @param {number} [status] */
export function errorResponse(error = new Error('Something went wrong...'), status = 500) {
  if (typeof error === 'string') {
    error = new Error(error);
  }
  console.error(error);
  return new Response(error.message, { status });
}