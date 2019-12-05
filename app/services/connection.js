import { DEFAULT_PORT } from './cache'

/**
 * Chckes that a given node ip is up and that it corresponds to a shockapi
 * server.
 * @param {string} urlOrIp
 * @returns {Promise<boolean>}
 */
export const pingURL = async urlOrIp => {
  let url = urlOrIp
  if (url.indexOf(':') === -1) {
    url += ':' + DEFAULT_PORT
  }
  try {
    /**
     * @type {ReturnType<typeof fetch>}
     */
    const resP = Promise.race([
      fetch(`http://${url}/healthz`),
      new Promise((_, rej) => {
        setTimeout(() => {
          rej(new Error('Could not reach the server.'))
        }, 5000)
      }),
    ])

    const res = await resP

    if (res.ok) {
      const body = await res.json()

      return typeof body.APIStatus === 'object'
    }

    return false
  } catch (e) {
    console.warn(`Connection.pingURL: ${e.message}`)
    return false
  }
}
