import Http from 'axios'
import Logger from 'react-native-file-log'
import { Schema } from 'shock-common'

import * as Cache from './cache'
import * as Wallet from './wallet'

/**
 * @returns {Promise<boolean>}
 */
export const isGunAuthed = async () => {
  const timeout = new Promise((_, rej) => {
    setTimeout(() => {
      rej(new Error('Could not retrieve gun auth status in under 5 seconds'))
    }, 5000)
  })

  const res = await Promise.race([Http.get(`/api/gun/auth`), timeout])

  return res.data.data
}

/**
 * @typedef {object} AuthResponse
 * @prop {string} publicKey
 * @prop {string} token
 * @prop {Record<string, Schema.Follow>} follows
 * @prop {Wallet.ListInvoiceResponse} invoices
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
      follows: data.follows,
      invoices: data.data.invoices,
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
        follows: {},
        invoices: {
          first_index_offset: 0,
          invoices: [],
          last_index_offset: 0,
        },
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
      follows: {},
      invoices: {
        first_index_offset: 0,
        invoices: [],
        last_index_offset: 0,
      },
    }
  } catch (err) {
    const body = err.response.data
    Logger.log(`here: ${JSON.stringify(body)}`)
    throw new Error(body.errorMessage || body.message || 'Unknown error.')
  }
}
