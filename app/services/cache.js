/**
 * @format
 */

import { AsyncStorage } from 'react-native'
import Http from 'axios'

import { AUTH } from '../navigators/Root'

import * as Navigation from './navigation'
import * as Utils from './utils'
/**
 * @typedef {object} AuthData
 * @prop {string} alias
 * @prop {string} publicKey
 * @prop {string} token
 */

export const DEFAULT_PORT = 9835

/**
 * @typedef {object} StoredAuthData
 * @prop {AuthData} authData
 * @prop {string} nodeIP The node ip for which the auth data is valid.
 */

const NODE_URL = 'NODE_URL'
const STORED_AUTH_DATA = 'STORED_AUTH_DATA'
const AUTHENTICATED_NODE = 'AUTHENTICATED_NODE'

export const NO_CACHED_NODE_IP = 'NO_CACHED_NODE_IP'

/**
 * @typedef {(sad: StoredAuthData|null) => void} StoredAuthDataListener
 */

/**
 * @type {Array<StoredAuthDataListener>}
 */
const storedAuthDataListeners = []

const notifySADListeners = () => {
  getStoredAuthData().then(sad => {
    storedAuthDataListeners.forEach(l => {
      l(sad)
    })
  })
}

/**
 *
 * @param {StoredAuthDataListener} listener
 * @returns {() => void}
 */
export const onSADChange = listener => {
  if (storedAuthDataListeners.includes(listener)) {
    throw new Error('Tried to subscribe twice')
  }

  getStoredAuthData()
    .then(sad => {
      if (storedAuthDataListeners.includes(listener)) {
        listener(sad)
      }
    })
    .catch(e => {
      console.warn(e)
    })

  return () => {
    const idx = storedAuthDataListeners.indexOf(listener)

    if (idx < 0) {
      throw new Error('tried to unsubscribe twice')
    }

    storedAuthDataListeners.splice(idx, 1)
  }
}

/**
 * @returns {Promise<string|null>}
 */
export const getNodeURL = () => AsyncStorage.getItem(NODE_URL)

/**
 * @param {string|null} urlOrIP Pass either a url (x.x.x.x:xxxx) or an ip
 * (x.x.x.x).
 * @returns {Promise<void>}
 */
export const writeNodeURLOrIP = async urlOrIP => {
  if (urlOrIP === null) {
    Http.defaults.baseURL = undefined
    AsyncStorage.removeItem(NODE_URL)
    writeStoredAuthData(null)
    return
  }

  let ip = urlOrIP
  let port = DEFAULT_PORT.toString()

  const hasPort = urlOrIP.indexOf(':') > -1

  if (hasPort) {
    ;[ip, port] = urlOrIP.split(':')
  }

  if (
    port.length < 4 ||
    !port.split('').every(c => '0123456789'.split('').includes(c))
  ) {
    throw new TypeError('writeNodeURLOrIP() -> invalid port supplied')
  }

  if (!Utils.isValidIP(ip)) {
    throw new TypeError('writeNodeURLOrIP() -> invalid IP supplied')
  }

  const storedAD = await getStoredAuthData()

  if (storedAD !== null && storedAD.nodeIP !== ip) {
    await writeStoredAuthData(null)
  }

  Http.defaults.baseURL = `http://${ip}:${port}`

  await AsyncStorage.setItem(NODE_URL, `${ip}:${port}`)
}

/**
 * @returns {Promise<StoredAuthData|null>}
 */
export const getStoredAuthData = () =>
  AsyncStorage.getItem(STORED_AUTH_DATA).then(sad => {
    if (sad === null) {
      return null
    }
    return JSON.parse(sad)
  })

/**
 * @param {AuthData|null} authData
 * @throws {Error} If trying to store authdata without a cached node ip being
 * present.
 * @returns {Promise<void>}
 */
export const writeStoredAuthData = async authData => {
  if (authData === null) {
    Navigation.navigate(AUTH)
    return AsyncStorage.removeItem(STORED_AUTH_DATA)
  }

  const nodeURL = await getNodeURL()

  if (nodeURL === null) {
    throw new Error('writeStoredAuthData() -> nodeIP is not cached')
  }

  /** @type {StoredAuthData} */
  const sad = {
    authData,
    nodeIP: nodeURL.split(':')[0],
  }

  await Promise.all([
    AsyncStorage.setItem(STORED_AUTH_DATA, JSON.stringify(sad)),
    AsyncStorage.setItem(AUTHENTICATED_NODE, nodeURL),
  ])

  notifySADListeners()
}

/**
 * Returns the token.
 * @throws {TypeError} NO_CACHED_NODE_IP - If node ip is not present in cache.
 * @returns {Promise<string|null>}
 */
export const getToken = async () => {
  const nodeURL = await getNodeURL()

  if (typeof nodeURL !== 'string') {
    throw new TypeError(NO_CACHED_NODE_IP)
  }

  const authData = await getStoredAuthData()

  if (authData === null) {
    throw new TypeError('No stored auth data')
  }

  if (authData.authData === null) {
    throw new TypeError('No stored auth data')
  }

  return authData.authData.token
}

/**
 * @returns {Promise<{ nodeURL: string , token: string|null }>}
 */
export const getNodeURLTokenPair = async () => ({
  // CAST: If nodeURL is null, getToken() will throw.
  nodeURL: /** @type {string} */ (await getNodeURL()),
  token: await getToken(),
})
