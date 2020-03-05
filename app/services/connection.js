import { DEFAULT_PORT } from './cache'
import Logger from 'react-native-file-log'

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
    Logger.log('WILL PING:' + url)

    const res = await fetch(`http://${url}/healthz`)

    const body = await res.json()

    Logger.log('Fetch Body:' + JSON.stringify(body))

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
    Logger.log(`Connection.pingURL: ${e.message}`)

    return {
      success: false,
    }
  }
}
