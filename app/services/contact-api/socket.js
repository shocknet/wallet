/**
 * @format
 */
import SocketIO from 'socket.io-client'

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
export let socket

export const disconnect = () => {
  if (socket) {
    // @ts-ignore
    socket.disconnect()
    // @ts-ignore
    socket.off()
  }
}

/**
 * @param {string} url
 * @returns {void}
 */
export const connect = url => {
  disconnect()

  socket = SocketIO(url, {
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

  socket.connect()
}
