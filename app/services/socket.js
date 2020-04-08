import SocketIO from 'socket.io-client'
import isEmpty from 'lodash/isEmpty'
import Logger from 'react-native-file-log'

import * as Cache from './cache'
import * as Encryption from './encryption'

/**
 * @typedef {import('redux').Store<{ connection: import('../../reducers/ConnectionReducer').State } & import('redux-persist/es/persistReducer').PersistPartial, import('redux').Action<any>> & { dispatch: any; }} ReduxStore
 */

class Socket {
  /** @type {object} */
  socketInstance = null

  /** @type {ReduxStore?} */
  store = null

  /**
   * Set Redux Store for use along with end-to-end encryption
   * @param {ReduxStore} store
   * @returns {ReduxStore} Returns the initialized Redux store
   */
  setStore = store => {
    this.store = store
    return store
  }

  /**
   * @private
   * @param {SocketIOClient.Socket} socket
   */
  encryptSocketInstance = socket => ({
    connect: () => socket.connect(),
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
    binary: b => this.encryptSocketInstance(socket.binary(b)),
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
          Logger.log('Listening to Event:', eventName)

          if (Encryption.isNonEncrypted(eventName)) {
            cb(data)
            return
          }

          const decryptedData = await this.decryptSocketData(data).catch(
            err => {
              Logger.log(
                `Error decrypting data for event: ${eventName} - msg: ${err.message}`,
              )
            },
          )

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

      Logger.log('Encrypting socket...', eventName, data)
      const encryptedData = await this.encryptSocketData(data)
      Logger.log('Encrypted Socket Data:', encryptedData)
      socket.emit(eventName, encryptedData)
      // @ts-ignore
      return this.encryptSocketInstance(socket)
    },
  })

  /**
   * @param {object} data
   */
  encryptSocketData = async data => {
    if (this.store) {
      const { APIPublicKey } = this.store.getState().connection

      Logger.log('APIPublicKey', APIPublicKey)

      if (!APIPublicKey && !isEmpty(data)) {
        throw new Error(
          'Please exchange keys with the API before sending any data through WebSockets',
        )
      }

      if (APIPublicKey && !isEmpty(data)) {
        Logger.log('encryptSocketData APIPublicKey:', APIPublicKey, data)
        const stringifiedData = JSON.stringify(data)
        const encryptedData = await Encryption.encryptData(
          stringifiedData,
          APIPublicKey,
        )
        Logger.log('Original Data:', data)
        Logger.log('Encrypted Data:', encryptedData)
        return encryptedData
      }
    }

    return null
  }

  /**
   * @param {object} data
   */
  decryptSocketData = async data => {
    if (data && data.encryptedKey && this.store) {
      const decryptionTime = Date.now()
      Logger.log('[LND SOCKET] Decrypting Data...', data)
      const { sessionId } = this.store.getState().connection
      const decryptedKey = await Encryption.decryptKey(
        data.encryptedKey,
        sessionId,
      )
      const { decryptedData } = await Encryption.decryptData({
        encryptedData: data.encryptedData,
        key: decryptedKey,
        iv: data.iv,
      })
      Logger.log(
        `[LND SOCKET] Decryption took: ${Date.now() - decryptionTime}ms`,
      )
      return JSON.parse(decryptedData)
    }

    Logger.log('[LND SOCKET] Data is non-encrypted', data)

    return data
  }

  connectSocket = async () => {
    if (this.store) {
      const { connection } = this.store.getState()

      const nodeURL = await Cache.getNodeURL()

      const socket = SocketIO(`http://${nodeURL}`, {
        query: {
          'x-shockwallet-device-id': connection.deviceId,
          IS_LND_SOCKET: true,
        },
      })

      this.socketInstance = this.encryptSocketInstance(socket)

      Logger.log('[LND SOCKET] New socket instance created successfully')

      return this.socketInstance
    }

    Logger.log('[LND SOCKET] Error: Store is not initialized yet.')

    return null
  }

  get socket() {
    return this.socketInstance
  }
}

const socket = new Socket()

export default socket
