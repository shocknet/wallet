// Record<string, string|number|boolean> could have been used for params but
// typescript complains on param bodies with optional parameters.
/**
 * @param url
 * @param params
 */
export const getQueryParams = (
  url: string,
  params: Record<string, any> = {},
): string => {
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
 * @param pub
 */
export const defaultName = (pub: string): string => 'anon' + pub.slice(0, 8)

/**
 * @param ip
 */
export const isValidIP = (ip: string): boolean => {
  const sections = ip.split('.')

  if (sections.length !== 4) return false

  return sections.every(
    s => Number.isInteger(Number(s)) && s.length <= 3 && s.length > 0,
  )
}

/**
 * @param url
 */
export const isValidURL = (url: string): boolean => {
  const [ip, port] = url.split(':')

  if (!port) {
    return isValidIP(ip)
  }

  return isValidIP(ip) && port.length <= 5
}

export const SET_LAST_SEEN_APP_INTERVAL = 15000

/**
 * @param lastSeen
 */
export const isOnline = (lastSeen: number): boolean =>
  Date.now() - lastSeen < SET_LAST_SEEN_APP_INTERVAL * 2
