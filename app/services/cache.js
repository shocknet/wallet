/**
 * @format
 */

import AsyncStorage from '@react-native-community/async-storage'
import Http from 'axios'
import fromPairs from 'lodash/fromPairs'

import { AUTH } from '../routes'

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

const ALIAS = 'ALIAS'
const NODE_URL = 'NODE_URL'
const STORED_AUTH_DATA = 'STORED_AUTH_DATA'
const AUTHENTICATED_NODE = 'AUTHENTICATED_NODE'

export const NO_CACHED_NODE_IP = 'NO_CACHED_NODE_IP'

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
export const getStoredAuthData = async () => {
  const _sad = await AsyncStorage.getItem(STORED_AUTH_DATA)

  if (_sad === null) {
    return null
  }

  /**
   * @type {StoredAuthData}
   */
  const sad = JSON.parse(_sad)

  const currNodeURL = await getNodeURL()
  if (currNodeURL === null) {
    AsyncStorage.removeItem(STORED_AUTH_DATA)
    return null
  }
  const [currNodeIP] = currNodeURL.split(':')

  if (sad.nodeIP !== currNodeIP) {
    await AsyncStorage.removeItem(STORED_AUTH_DATA)
    return null
  }

  return {
    ...sad,
    authData: {
      ...sad.authData,
      alias: /** @type {string} */ (await getCachedAlias()),
    },
  }
}

/**
 * @param {string|null} alias
 * @returns {Promise<void>}
 */
export const writeCachedAlias = alias => {
  if (alias === null) {
    return AsyncStorage.removeItem(ALIAS)
  }
  return AsyncStorage.setItem(ALIAS, alias)
}

/**
 * @returns {Promise<string|null>}
 */
export const getCachedAlias = () => AsyncStorage.getItem(ALIAS)

/** @type {Set<() => void>} */
const authListeners = new Set()

/**
 * @param {() => void} cb
 */
export const onAuth = cb => authListeners.add(cb)

/**
 * @param {AuthData|null} authData
 * @throws {Error} If trying to store authdata without a cached node ip being
 * present.
 * @returns {Promise<void>}
 */
export const writeStoredAuthData = async authData => {
  if (authData === null) {
    Navigation.navigate(AUTH)
    return AsyncStorage.removeItem(STORED_AUTH_DATA).then(() => {
      authListeners.forEach(l => l())
    })
  }

  if (typeof authData.alias !== 'string') {
    throw new TypeError(
      "Cache.writeStoredAuthData -> typeof authData.alias !== 'string'",
    )
  }

  if (typeof authData.publicKey !== 'string') {
    throw new TypeError(
      "Cache.writeStoredAuthData -> typeof authData.publicKey !== 'string'",
    )
  }

  if (typeof authData.token !== 'string') {
    throw new TypeError(
      "Cache.writeStoredAuthData -> typeof authData.token !== 'string'",
    )
  }

  if (authData.alias.length === 0) {
    throw new TypeError(
      'Cache.writeStoredAuthData -> authData.alias.length === 0',
    )
  }

  if (authData.publicKey.length === 0) {
    throw new TypeError(
      'Cache.writeStoredAuthData -> authData.publicKey.length === 0',
    )
  }

  if (authData.token.length === 0) {
    throw new TypeError(
      'Cache.writeStoredAuthData -> authData.token.length === 0',
    )
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
    writeCachedAlias(authData.alias),
    AsyncStorage.setItem(STORED_AUTH_DATA, JSON.stringify(sad)),
    AsyncStorage.setItem(AUTHENTICATED_NODE, nodeURL),
  ]).then(() => {
    authListeners.forEach(l => l())
  })
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

/**
 * @typedef {Record<string, number|undefined>} LastReadMsgs
 */

const CHAT_TIMESTAMP = 'CHAT_TIMESTAMP:'

/**
 * @type {((lastReadMsgs: LastReadMsgs) => void)[]}
 */
const lastReadMsgsListeners = []

/**
 * @returns {Promise<LastReadMsgs>}
 */
export const getAllLastReadMsgs = async () => {
  const keys = (await AsyncStorage.getAllKeys()).filter(
    k => k.indexOf(CHAT_TIMESTAMP) === 0,
  )

  const pairs = await AsyncStorage.multiGet(keys)

  const formattedPairs = pairs.map(
    ([k, v]) => /** @type {[ string , number]} */ ([
      k.slice(CHAT_TIMESTAMP.length),
      Number(v),
    ]),
  )

  return fromPairs(formattedPairs)
}

const notifyLastReadListeners = async () => {
  const lastReads = await getAllLastReadMsgs()

  lastReadMsgsListeners.forEach(l => {
    l(lastReads)
  })
}

/**
 * @param {(lastReadMsgs: LastReadMsgs) => void} listener
 */
export const onLastReadMsgs = listener => {
  if (lastReadMsgsListeners.indexOf(listener) > -1) {
    throw new Error('tried to subscribe twice')
  }

  lastReadMsgsListeners.push(listener)

  setImmediate(() => {
    // check listener is still subbed in case unsub is called before next tick
    if (!lastReadMsgsListeners.includes(listener)) {
      return
    }

    getAllLastReadMsgs().then(data => {
      listener(data)
    })
  })

  return () => {
    const idx = lastReadMsgsListeners.indexOf(listener)

    if (idx < 0) {
      throw new Error('tried to unsubscribe twice')
    }

    lastReadMsgsListeners.splice(idx, 1)
  }
}

/**
 * Keep track of the timestamp of the last read message for a given chat.
 * @param {string} recipientPub
 * @param {number} timestamp
 */
export const writeLastReadMsg = (recipientPub, timestamp) => {
  return AsyncStorage.setItem(
    CHAT_TIMESTAMP + recipientPub,
    timestamp.toString(),
  ).then(() => {
    notifyLastReadListeners()
  })
}

/**
 * Keep track of the timestamp of the last read message for a given chat.
 * @param {string} recipientPub
 * @returns {Promise<number|null>}
 */
export const getLastReadMsg = recipientPub => {
  return AsyncStorage.getItem(CHAT_TIMESTAMP + recipientPub).then(v => {
    if (v === null) {
      return null
    }

    return Number(v)
  })
}

/**
 * @returns {Promise<void>}
 */
export const clearAllStorage = () => AsyncStorage.clear()
