/**
 * @format
 */
import { backOff } from 'exponential-backoff'
import { JitterTypes } from 'exponential-backoff/dist/options'

import * as Cache from './cache'

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
        throw new Error(body.errorMessage || body.message)
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

  throw new Error(body.errorMessage || body.message)
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

  throw new Error(body.errorMessage || body.message)
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

    throw new Error(body.errorMessage || body.message)
  }
}
