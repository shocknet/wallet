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

/**
 * @param {string} ip
 * @returns {boolean}
 */
export const isValidIP = ip => {
  const sections = ip.split('.')

  if (sections.length !== 4) return false

  return sections.every(
    s => Number.isInteger(Number(s)) && s.length <= 3 && s.length > 0,
  )
}

/**
 * @param {string} url
 * @returns {boolean}
 */
export const isValidURL = url => {
  const [ip, port] = url.split(':')

  if (!port) {
    return isValidIP(ip)
  }

  return isValidIP(ip) && port.length <= 5
}
