import once from 'lodash/once'
import Http from 'axios'
import SocketIO from 'socket.io-client'
import Logger from 'react-native-file-log'

import * as Cache from './cache'
import * as Wallet from './wallet'

// TO DO: Move this constant to common repo
const IS_GUN_AUTH = 'IS_GUN_AUTH'

/**
 * @param {string} nodeURL
 * @returns {Promise<boolean>}
 */
export const isGunAuthed = async nodeURL => {
  const socket = SocketIO(`http://${nodeURL}`, {
    autoConnect: false,
    query: {
      IS_GUN_AUTH: true,
    },
  })
  // ideally we would place socket.disconnect() inside a finally clause, but
  // those are bugged as of current react native version
  try {
    const socketPromise = new Promise(res => {
      socket.on(
        IS_GUN_AUTH,
        once(response => {
          res(response.msg.isGunAuth)
        }),
      )
      socket.emit(IS_GUN_AUTH, {})
    })

    const timeout = new Promise((_, rej) => {
      setTimeout(() => {
        rej(new Error('Could not retrieve gun auth status in under 15 seconds'))
      }, 15000)
    })

    socket.connect()
    const res = await Promise.race([socketPromise, timeout])
    socket.disconnect()
    return res
  } catch (err) {
    socket.disconnect()
    throw err
  }
}

/**
 * @typedef {object} AuthResponse
 * @prop {string} publicKey
 * @prop {string} token
 */

/**
 * @param {string} alias
 * @param {string} password
 * @throws {Error|TypeError}
 * @returns {Promise<AuthResponse>}
 */
export const unlockWallet = async (alias, password) => {
  const nodeURL = await Cache.getNodeURL()

  if (nodeURL === null) {
    throw new TypeError('nodeURL === null')
  }

  try {
    const { data } = await Http.post(`http://${nodeURL}/api/lnd/auth`, {
      alias,
      password,
    })

    if (typeof data.authorization !== 'string') {
      throw new TypeError("typeof data.authorization !== 'string'")
    }

    if (typeof data.user.publicKey !== 'string') {
      throw new TypeError("typeof data.user.publicKey !== 'string'")
    }

    return {
      publicKey: data.user.publicKey,
      token: data.authorization,
    }
  } catch (err) {
    throw new Error(
      err.response
        ? err.response.data.errorMessage || err.response.data.message
        : 'Unknown error.',
    )
  }
}

/**
 * @param {string} alias
 * @param {string} password
 * @throws {Error|TypeError}
 * @returns {Promise<AuthResponse>}
 */
export const createWallet = async (alias, password) => {
  const nodeURL = await Cache.getNodeURL()

  if (nodeURL === null) {
    throw new TypeError('nodeURL === null')
  }
  try {
    const { data } = await Http.post(`http://${nodeURL}/api/lnd/wallet`, {
      alias,
      password,
    })

    if (typeof data.authorization !== 'string') {
      throw new TypeError("typeof data.authorization !== 'string'")
    } else if (typeof data.user.publicKey !== 'string') {
      throw new TypeError("typeof data.user.publicKey !== 'string'")
    } else {
      return {
        publicKey: data.user.publicKey,
        token: data.authorization,
      }
    }
  } catch (err) {
    throw new Error(
      err.response ? JSON.stringify(err.response.data) : 'Unknown error.',
    )
  }
}

/**
 *
 * @param {string} alias
 * @param {string} pass
 * @throws {Error}
 * @returns {Promise<AuthResponse>}
 */
export const newGUNAlias = async (alias, pass) => {
  const currWalletStatus = await Wallet.walletStatus()

  if (currWalletStatus === 'noncreated') {
    throw new Error(
      'Tried to call newGunAlias() witht a noncreated wallet status',
    )
  }

  const nodeURL = await Cache.getNodeURL()

  try {
    const { data: body } = await Http.post(
      `http://${nodeURL}/api/lnd/wallet/existing`,
      { alias, password: pass },
      { headers: { 'Content-Type': 'application/json' } },
    )

    return {
      publicKey: body.user.publicKey,
      token: body.authorization,
    }
  } catch (err) {
    const body = err.response.data
    Logger.log(`here: ${JSON.stringify(body)}`)
    throw new Error(body.errorMessage || body.message || 'Unknown error.')
  }
}
