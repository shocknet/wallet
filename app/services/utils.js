/**
 * @format
 */

// Record<string, string|number|boolean> could have been used for params but
// typescript complains on param bodies with optional parameters.

/**
 * @param {string} url
 * @param {Record<string, any>} params
 * @returns {string}
 */
export const getQueryParams = (url, params = {}) => {
  let finalURL = url

  Object.entries(params).forEach(([param, value], i) => {
    if (i === 0) {
      finalURL += '?'
    } else {
      finalURL += '&'
    }

    if (typeof value === 'boolean') {
      if (true === value) {
        finalURL += param
      }
    } else if (typeof value === 'string') {
      if (value.length === 0) {
        throw new TypeError(
          'Expected an string query parameter value to have a length',
        )
      }

      finalURL += `${param}=${value}`
    } else if (typeof value === 'number') {
      finalURL += `${param}=${value.toString()}`
    } else {
      throw new TypeError('Unknown type for query paramater')
    }
  })

  return finalURL
}

/**
 * @param {string} pub
 * @returns {string}
 */
export const defaultName = pub => 'anon' + pub.slice(0, 8)
