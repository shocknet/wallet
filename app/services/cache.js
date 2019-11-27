/**
 * @format
 */

import { AsyncStorage } from 'react-native'
import { backOff } from 'exponential-backoff'
import { JitterTypes } from 'exponential-backoff/dist/options'

/**
 * @typedef {import('./contact-api/events').AuthData} AuthData
 */

/**
 * @typedef {object} StoredAuthData
 * @prop {AuthData} authData
 * @prop {string} nodeIP The node ip for which the auth data is valid.
 */

const NODE_IP = 'NODE_IP'
const STORED_AUTH_DATA = 'STORED_AUTH_DATA'
const AUTHENTICATED_NODE = 'AUTHENTICATED_NODE'

export const NO_CACHED_NODE_IP = 'NO_CACHED_NODE_IP'

/**
 * @typedef {(nodeIP: string|null) => void} NodeIPListener
 * @typedef {(sad: StoredAuthData|null) => void} StoredAuthDataListener
 */

/**
 * @type {Array<NodeIPListener>}
 */
const nodeIPListeners = []
/**
 * @type {Array<StoredAuthDataListener>}
 */
const storedAuthDataListeners = []

const notifyNodeIPListeners = () => {
  getNodeIP().then(nip => {
    nodeIPListeners.forEach(l => {
      l(nip)
    })
  })
}

const notifySADListeners = () => {
  getStoredAuthData().then(sad => {
    storedAuthDataListeners.forEach(l => {
      l(sad)
    })
  })
}

/**
 * @param {NodeIPListener} listener
 * @returns {() => void}
 */
export const onNodeIPChange = listener => {
  if (nodeIPListeners.includes(listener)) {
    throw new Error('Tried to subscribe twice')
  }

  nodeIPListeners.push(listener)

  getNodeIP()
    .then(nip => {
      // check in case unsub was called before promise resolution
      if (nodeIPListeners.includes(listener)) {
        listener(nip)
      }
    })
    .catch(e => {
      console.warn(e)
    })

  return () => {
    const idx = nodeIPListeners.indexOf(listener)

    if (idx < 0) {
      throw new Error('tried to unsubscribe twice')
    }

    nodeIPListeners.splice(idx, 1)
  }
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
export const getNodeIP = () =>
  backOff(() => AsyncStorage.getItem(NODE_IP), {
    jitter: JitterTypes.Full,
    retry(_, attemptNumber) {
      console.warn(`retry getItem(NODE_IP): ${attemptNumber}`)
      return true
    },
  })

/**
 * @param {string|null} ip
 * @returns {Promise<void>}
 */
export const writeNodeIP = ip =>
  backOff(
    () => {
      if (ip === null) {
        return AsyncStorage.removeItem(NODE_IP)
      } else {
        return AsyncStorage.setItem(NODE_IP, ip)
      }
    },
    {
      jitter: JitterTypes.Full,
      retry(_, attemptNumber) {
        console.warn(`retry getItem(STORED_AUTH_DATA): ${attemptNumber}`)
        return true
      },
    },
  ).then(() => {
    notifyNodeIPListeners()
  })

/**
 * @returns {Promise<StoredAuthData|null>}
 */
export const getStoredAuthData = () =>
  AsyncStorage.getItem(STORED_AUTH_DATA).then(sad => {
    if (sad === null) {
      return null
    } else {
      return JSON.parse(sad)
    }
  })

/**
 * @param {AuthData|null} authData
 * @throws {Error} If trying to store authdata without a cached node ip being
 * present.
 * @returns {Promise<void>}
 */
export const writeStoredAuthData = authData =>
  backOff(() => {
    if (authData === null) {
      return AsyncStorage.removeItem(STORED_AUTH_DATA)
    } else {
      return getNodeIP().then(nodeIP => {
        if (nodeIP === null) {
          throw new Error()
        } else {
          /** @type {StoredAuthData} */
          const sad = {
            authData,
            nodeIP,
          }

          return backOff(
            () =>
              Promise.all([
                AsyncStorage.setItem(STORED_AUTH_DATA, JSON.stringify(sad)),
                AsyncStorage.setItem(AUTHENTICATED_NODE, nodeIP),
              ]),
            {
              jitter: JitterTypes.Full,
              retry(_, attemptNumber) {
                console.warn(
                  `retry getItem(STORED_AUTH_DATA): ${attemptNumber}`,
                )
                return true
              },
            },
          ).then(() => {
            notifySADListeners()
          })
        }
      })
    }
  })

/**
 * Returns the token.
 * @throws {TypeError} NO_CACHED_NODE_IP - If node ip is not present in cache.
 * @returns {Promise<string|null>}
 */
export const getToken = async () => {
  const nodeIP = await getNodeIP()

  if (typeof nodeIP !== 'string') {
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
 * @returns {Promise<{ nodeIP: string , token: string|null }>}
 */
export const getNodeIPTokenPair = async () => ({
  // @ts-ignore If nodeIP is null, getToken() will throw.
  nodeIP: await getNodeIP(),
  token: await getToken(),
})
