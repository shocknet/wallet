/**
 * @format
 */
import SocketIO from 'socket.io-client'

import * as Cache from '../../services/cache'

import * as Events from './events'

/**
 * @typedef {object} SimpleSocket
 * @prop {() => void} connect
 * @prop {boolean} connected
 * @prop {(eventName: string, data: any) => void} emit
 * @prop {(eventName: string, handler: (data: any) => void) => void} on
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
 * @returns {Promise<void>}
 */
export const connect = async () => {
  const nodeURL = await Cache.getNodeURL()

  if (nodeURL === null) {
    throw new Error('Tried to connect the socket without a cached node url')
  }

  socket = SocketIO(`http://${nodeURL}`, {
    autoConnect: false,
    transports: ['websocket'],
    jsonp: false,
  })

  socket.on('connect_error', e => {
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
