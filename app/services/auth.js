/**
 * @format
 */
import { backOff } from 'exponential-backoff'
import { JitterTypes } from 'exponential-backoff/dist/options'
import once from 'lodash/once'

import * as Cache from './cache'
import { Socket } from './contact-api'

// TO DO: Move this constant to common repo
const IS_GUN_AUTH = 'IS_GUN_AUTH'

/**
 * @returns {Promise<boolean>}
 */
export const isGunAuthed = async () => {
  const socket = await Socket.createSocket()
  socket.connect()

  const socketPromise = new Promise(res => {
    socket.on(
      IS_GUN_AUTH,
      once(response => {
        res(response.msg.isGunAuth)
      }),
    )
    socket.binary(false).emit(IS_GUN_AUTH, {})
  })

  const timeout = new Promise((_, rej) => {
    setTimeout(() => {
      rej(new Error('Could not retrieve gun auth status in under 5 seconds'))
    }, 5000)
  })

  // ideally we would place socket.disconnect() inside a finally clause, but
  // those are bugged as of current react native version
  try {
    const res = await Promise.race([socketPromise, timeout])
    socket.disconnect()
    return res
  } catch (err) {
    socket.disconnect()
    throw err
  }
}

/**
 * Tells the node to connect to LND.
 * @param {string} alias
 * @param {string} password
 * @returns {Promise<void>}
 */
export const connectNodeToLND = (alias, password) =>
  backOff(
    async () => {
      const nodeURL = await Cache.getNodeURL()

      if (nodeURL === null) {
        throw new TypeError('nodeURL === null')
      }

      const res = await fetch(`http://${nodeURL}/api/lnd/connect`, {
        method: 'POST',
        body: JSON.stringify({
          alias,
          password,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        const body = await res.json()

        throw new Error(body.errorMessage || body.message || 'Unknown error.')
      }
    },
    {
      jitter: JitterTypes.Full,
      retry(e, attemptNumber) {
        console.warn(
          `retrying connectNodeToLND, error messages: ${e.message}, attempt number ${attemptNumber} out of 10`,
        )

        return true
      },
    },
  )

/**
 * @param {string} alias
 * @param {string} password
 * @throws {Error|TypeError}
 * @returns {Promise<{ token: string , publicKey: string }>}
 */
export const unlockWallet = async (alias, password) => {
  await connectNodeToLND(alias, password)
  const nodeURL = await Cache.getNodeURL()

  if (nodeURL === null) {
    throw new TypeError('nodeURL === null')
  }

  const res = await fetch(`http://${nodeURL}/api/lnd/auth`, {
    method: 'POST',
    body: JSON.stringify({
      alias,
      password,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const body = await res.json()

  if (res.ok) {
    if (typeof body.authorization !== 'string') {
      throw new TypeError("typeof body.authorization !== 'string'")
    }

    if (typeof body.user.publicKey !== 'string') {
      throw new TypeError("typeof body.user.publicKey !== 'string'")
    }

    return {
      publicKey: body.user.publicKey,
      token: body.authorization,
    }
  }

  if (body.errorMessage === 'LND is down') {
    connectNodeToLND(alias, password)
  }

  throw new Error(body.errorMessage || body.message || 'Unknown error.')
}

/**
 * @param {string} alias
 * @param {string} password
 * @returns {Promise<{ token: string , publicKey: string }>}
 */
export const registerExistingWallet = async (alias, password) => {
  const nodeURL = await Cache.getNodeURL()

  if (nodeURL === null) {
    throw new TypeError('nodeURL === null')
  }

  const res = await fetch(`http://${nodeURL}/api/lnd/wallet/existing`, {
    method: 'POST',
    body: JSON.stringify({
      alias,
      password,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const body = await res.json()

  if (res.ok) {
    if (typeof body.authorization !== 'string') {
      throw new TypeError("typeof body.authorization !== 'string'")
    }

    if (typeof body.user.publicKey !== 'string') {
      throw new TypeError("typeof body.user.publicKey !== 'string'")
    }

    console.log(body)

    return {
      publicKey: body.user.publicKey,
      token: body.authorization,
    }
  }

  if (body.errorMessage === 'LND is down') {
    connectNodeToLND(alias, password)
  }

  throw new Error(body.errorMessage || body.message || 'Unknown error.')
}

/**
 * @param {string} alias
 * @param {string} password
 * @throws {Error|TypeError}
 * @returns {Promise<{ token: string , publicKey: string }>}
 */
export const createWallet = async (alias, password) => {
  const nodeURL = await Cache.getNodeURL()

  if (nodeURL === null) {
    throw new TypeError('nodeURL === null')
  }

  const res = await fetch(`http://${nodeURL}/api/lnd/wallet`, {
    method: 'POST',
    body: JSON.stringify({
      alias,
      password,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const body = await res.json()

  if (res.ok) {
    if (typeof body.authorization !== 'string') {
      throw new TypeError("typeof body.authorization !== 'string'")
    } else if (typeof body.user.publicKey !== 'string') {
      throw new TypeError("typeof body.user.publicKey !== 'string'")
    } else {
      return {
        publicKey: body.user.publicKey,
        token: body.authorization,
      }
    }
  } else {
    if (body.errorMessage === 'LND is down') {
      connectNodeToLND(alias, password)
    }

    throw new Error(body.errorMessage || body.message || 'Unknown error.')
  }
}
