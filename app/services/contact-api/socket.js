/**
 * @format
 */
import SocketIO from 'socket.io-client'
import isEmpty from 'lodash/isEmpty'
import once from 'lodash/once'

import * as Cache from '../../services/cache'

import * as Events from './events'
import * as Encryption from '../encryption'

// TO DO: move to common repo
/**
 * @typedef {object} Emission
 * @prop {boolean} ok
 * @prop {any} msg
 * @prop {Record<string, any>} origBody
 */

// TO DO: move to common repo
/**
 * @typedef {object} SimpleSocket
 * @prop {(b: boolean) => SimpleSocket} binary Specifies whether the emitted
 * data contains binary. Increases performance when specified. Can be `true` or
 * `false`.
 * @prop {() => void} connect
 * @prop {boolean} connected
 * @prop {() => void} disconnect
 * @prop {boolean} disconnected
 * @prop {(eventName: string, data: Record<string, any>) => void} emit
 * @prop {(eventName: string, handler: (data: Emission) => void) => void} on
 * @prop {(eventName: string, handler: (data: Emission) => void) => void} off
 */

/**
 * @typedef {import('redux').Store<{ connection: import('../../../reducers/ConnectionReducer').State } & import('redux-persist/es/persistReducer').PersistPartial, import('redux').Action<any>> & { dispatch: any; }} ReduxStore
 */

/**
 * @type {SimpleSocket|null}
 */
// eslint-disable-next-line init-declarations
export let socket

/**
 * @type {ReduxStore}
 */
// eslint-disable-next-line init-declarations
export let store

/**
 * Set Redux Store for use along with end-to-end encryption
 * @param {ReduxStore} initializedStore
 * @returns {ReduxStore} Returns the initialized Redux store
 */
export const setStore = initializedStore => {
  store = initializedStore
  return store
}

export const disconnect = () => {
  if (socket) {
    // @ts-ignore
    socket.disconnect()
    // @ts-ignore
    socket.off()

    // @ts-ignore
    socket = null
  } else {
    throw new Error('Tried to disconnect the socket without creating one first')
  }
}

/**
 * @param {object} data
 */
export const encryptSocketData = async data => {
  const { APIPublicKey } = store.getState().connection

  console.log('APIPublicKey', APIPublicKey)

  if (!APIPublicKey && !isEmpty(data)) {
    throw new Error(
      'Please exchange keys with the API before sending any data through WebSockets',
    )
  }

  if (APIPublicKey && !isEmpty(data)) {
    console.log('encryptSocketData APIPublicKey:', APIPublicKey, data)
    const stringifiedData = JSON.stringify(data)
    const encryptedData = await Encryption.encryptData(
      stringifiedData,
      APIPublicKey,
    )
    console.log('Original Data:', data)
    console.log('Encrypted Data:', encryptedData)
    return encryptedData
  }

  return null
}

/**
 * @param {object} data
 */
export const decryptSocketData = async data => {
  if (data && data.encryptedKey) {
    const decryptionTime = Date.now()
    console.log('Decrypting Data...', data)
    const { sessionId } = store.getState().connection
    const decryptedKey = await Encryption.decryptKey(
      data.encryptedKey,
      sessionId,
    )
    const { decryptedData } = await Encryption.decryptData({
      encryptedData: data.encryptedData,
      key: decryptedKey,
      iv: data.iv,
    })
    console.log(`Decryption took: ${Date.now() - decryptionTime}ms`)
    return JSON.parse(decryptedData)
  }

  console.log('Data is non-encrypted', data)

  return data
}

/**
 * @param {SocketIOClient.Socket} socket
 */
export const encryptSocketInstance = socket => ({
  connect: () => {
    throw new Error('Do not call socket.connect() yourself')
  },
  get connected() {
    return socket.connected
  },
  // @ts-ignore
  off: () => socket.off(),
  disconnect: () => socket.disconnect(),
  get disconnected() {
    return socket.disconnected
  },
  // @ts-ignore
  binary: b => encryptSocketInstance(socket.binary(b)),
  /**
   * @param {string} eventName
   * @param {(handler: any) => void} cb
   */
  on: (eventName, cb) => {
    socket.on(
      eventName,
      /**
       * @param {any} data
       */
      async data => {
        console.log('Listening to Event:', eventName)

        if (Encryption.isNonEncrypted(eventName)) {
          cb(data)
          return
        }

        const decryptedData = await decryptSocketData(data).catch(err => {
          console.warn(
            `Error decrypting data for event: ${eventName} - msg: ${err.message}`,
          )
        })

        cb(decryptedData)
      },
    )
  },
  /**
   * @param {string} eventName
   * @param {any} data
   */
  emit: async (eventName, data) => {
    if (Encryption.isNonEncrypted(eventName)) {
      socket.emit(eventName, data)
      return
    }

    console.log('Encrypting socket...', eventName, data)
    const encryptedData = await encryptSocketData(data)
    console.log('Encrypted Socket Data:', encryptedData)
    socket.emit(eventName, encryptedData)
  },
})

/**
 * Use outside of this module if need to create a single use socket.
 * @returns {Promise<SimpleSocket>}
 */
export const createSocket = async () => {
  const nodeURL = await Cache.getNodeURL()

  if (nodeURL === null) {
    throw new Error('Tried to connect the socket without a cached node url')
  }

  console.log(`http://${nodeURL}`)

  // @ts-ignore
  const socket = SocketIO(`http://${nodeURL}`, {
    autoConnect: true,
    reconnectionAttempts: Infinity,
    transports: ['polling'],
    upgrade: false,
    jsonp: false,
    query: {
      'x-shockwallet-device-id': store.getState().connection.deviceId,
    },
  })
  return encryptSocketInstance(socket)
}

/**
 * @returns {Promise<void>}
 */
export const connect = async () => {
  if (socket) {
    throw new Error(
      'Tried to connect a new socket without disconnecting the old one first',
    )
  }
  const newSocket = await createSocket()
  // not a problem unless you call this function too quickly
  // eslint-disable-next-line require-atomic-updates
  socket = newSocket
  socket.on('connect_error', e => {
    // @ts-ignore
    console.warn('connect_error: ' + e.message || e || 'Unknown')
  })

  socket.on('connect_error', error => {
    console.warn(`connect_error: ${error}`)
  })

  socket.on('connect_timeout', timeout => {
    console.warn(`connect_timeout: ${timeout}`)
  })

  socket.on('error', error => {
    console.warn(`Socket.socket.on:error: ${error}`)
  })

  socket.on('reconnect_attempt', attemptNumber => {
    console.warn(`Socket.socket.on:reconnect_attempt: ${attemptNumber}`)
  })

  socket.on('disconnect', reason => {
    console.warn(`reason for disconnect: ${reason}`)

    // @ts-ignore
    if (reason === 'io server disconnect') {
      // https://Socket.socket.io/docs/client-api/#Event-%E2%80%98disconnect%E2%80%99
    }
  })

  socket.on('connect', once(Events.setupEvents))

  socket.connect()
}
