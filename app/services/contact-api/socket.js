/**
 * @format
 */
import SocketIO from 'socket.io-client'

import * as Cache from '../../services/cache'

import * as Events from './events'

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
 * @prop {(eventName: string, data: Record<string, any>) => void} emit
 * @prop {(eventName: string, handler: (data: Emission) => void) => void} on
 */

/**
 * @type {SimpleSocket}
 */
// eslint-disable-next-line init-declarations
export let socket

export const disconnect = () => {
  if (socket) {
    // @ts-ignore
    socket.disconnect()
    // @ts-ignore
    socket.off()
  }
}

let eventsSetup = false

/**
 * Use outside of this module if need to create a single use socket.
 * @returns {Promise<SimpleSocket>}
 */
export const createSocket = async () => {
  const nodeURL = await Cache.getNodeURL()

  if (nodeURL === null) {
    throw new Error('Tried to connect the socket without a cached node url')
  }

  // @ts-ignore
  return SocketIO(`http://${nodeURL}`, {
    autoConnect: false,
    transports: ['websocket'],
    jsonp: false,
  })
}

/**
 * @returns {Promise<void>}
 */
export const connect = async () => {
  socket = await createSocket()
  socket.on('connect_error', e => {
    // @ts-ignore
    console.warn(e.message)
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
      socket.connect()
    }
  })

  socket.on('connect', () => {
    if (!eventsSetup) {
      eventsSetup = true

      Events.setupEvents()
    }
  })

  socket.connect()
}
