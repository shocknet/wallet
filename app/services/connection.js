import { DEFAULT_PORT } from './cache'

/**
 * @typedef {object} PingResponse
 * @prop {boolean} success
 */

/**
 * Checks that a given node ip is up and that it corresponds to a ShockAPI
 * server.
 * @param {string} urlOrIp
 * @throws {Error}
 * @returns {Promise<PingResponse>}
 */
export const pingURL = async urlOrIp => {
  try {
    let url = urlOrIp
    if (url.indexOf(':') === -1) {
      url += ':' + DEFAULT_PORT
    }
    /**
     * @type {ReturnType<typeof fetch>}
     */
    console.warn('WILL PING:' + url)

    const res = await fetch(`http://${url}/healthz`)

    const body = await res.json()

    console.warn('Fetch Body:' + JSON.stringify(body))

    if (!res.ok) {
      throw new Error(body.errorMessage || body.message || `Unknown Err`)
    }

    if (typeof body !== 'object') {
      throw new Error(`typeof body !== 'object'`)
    }

    if (typeof body.APIStatus !== 'object') {
      throw new Error(`typeof body.APIStatus !== 'object'`)
    }

    return {
      success: true,
    }
  } catch (e) {
    console.warn(`Connection.pingURL: ${e.message}`)

    return {
      success: false,
    }
  }
}
