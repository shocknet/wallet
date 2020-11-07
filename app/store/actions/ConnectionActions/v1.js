import Http from 'axios'
import { RSAKeychain } from 'react-native-rsa-native'
import Logger from 'react-native-file-log'

import { KEYS_LOADED, keysLoaded } from './v2'

export const ACTIONS = {
  LOAD_NEW_KEYS: KEYS_LOADED,
}

/** @type {Promise<ExchangedKeyPair>?} */
let exchangingKeypair = null

/**
 * @typedef {object} DeviceKeyPair
 * @prop {string} publicKey
 */

/**
 * @typedef {object} ExchangedKeyPair
 * @prop {(string)=} devicePublicKey
 * @prop {(string)=} APIPublicKey
 * @prop {boolean} success
 */

/**
 * @typedef {object} ExchangeKeyPairParams
 * @prop {string} deviceId
 * @prop {string?} sessionId
 * @prop {string?} cachedSessionId
 * @prop {(string)=} baseURL
 */

/**
 * @typedef {object} PublicKey
 * @prop {string | undefined} public
 */

/**
 * Generates a keypair
 * @param {string} tag
 * @param {number} size
 * @param {number} retries
 * @returns {Promise<PublicKey>}
 */
const generateKey = async (tag, size = 2048, retries = 0) => {
  if (retries >= 5) {
    throw new Error('Unable to generate a key')
  }
  const keypairExists = await RSAKeychain.keyExists(tag)

  if (keypairExists) {
    return { public: await RSAKeychain.getPublicKey(tag) }
  }

  const keyPair = await RSAKeychain.generateKeys(tag, size)

  if (!keyPair.public) {
    return generateKey(tag, size, retries + 1)
  }

  Logger.log('[ENCRYPTION] New key generated')
  Logger.log('[ENCRYPTION] New Keypair', {
    publicKey: keyPair.public,
    tag,
  })

  return keyPair
}

/**
 * Generates and exchanges public keys with the API
 * @param {ExchangeKeyPairParams} deviceInfo
 * @returns {import('redux-thunk').ThunkAction<Promise<ExchangedKeyPair>, {}, {}, import('redux').AnyAction>}
 */
export const exchangeKeyPair = ({
  deviceId,
  sessionId,
  cachedSessionId,
  baseURL,
}) => async dispatch => {
  try {
    Logger.log({
      deviceId,
      sessionId,
      cachedSessionId,
    })
    const keyTag = `com.shocknet.APIKey.${sessionId}`
    const oldKeyTag = cachedSessionId
      ? `com.shocknet.APIKey.${cachedSessionId}`
      : null
    const keypairExists = await RSAKeychain.keyExists(keyTag)
    Logger.log('Key Tag:', keyTag)
    Logger.log('Old Key Tag:', oldKeyTag)
    Logger.log('Keypair Exists:', keypairExists)

    if (keyTag === oldKeyTag && keypairExists) {
      Logger.log('[ENCRYPTION] Key tag already exists!')
      return {
        success: true,
      }
    }

    // if (oldKeypair && oldKeyTag) {
    //   await RSAKeychain.deletePrivateKey(oldKeyTag)
    // }

    Logger.log('[ENCRYPTION] Generating new RSA 2048 key...')
    const keyPair = await generateKey(keyTag, 2048)
    const exchangedKeys = await Http.post(
      `${baseURL ? baseURL : ''}/api/security/exchangeKeys`,
      {
        publicKey: keyPair.public,
        deviceId,
      },
    )

    const data = {
      devicePublicKey: keyPair.public,
      APIPublicKey: exchangedKeys.data.APIPublicKey,
      sessionId: exchangedKeys.headers['x-session-id'],
      success: true,
    }

    dispatch(keysLoaded(data))

    return data
  } catch (err) {
    Logger.log('[ENCRYPTION] Key Exchange Error:', err)
    throw err
  }
}

/**
 * @param {ExchangeKeyPairParams} keypairDetails
 * @returns {import('redux-thunk').ThunkAction<Promise<ExchangedKeyPair>, {}, {}, import('redux').AnyAction>}
 */
export const throttledExchangeKeyPair = keypairDetails => async (
  dispatch,
  getState,
  extraArgument,
) => {
  try {
    if (!exchangingKeypair) {
      exchangingKeypair = exchangeKeyPair(keypairDetails)(
        dispatch,
        getState,
        extraArgument,
      )
    }

    const result = await exchangingKeypair

    // eslint-disable-next-line require-atomic-updates
    exchangingKeypair = null

    return result
  } catch (err) {
    Logger.log(`Error inside throttledExchangeKeyPair -> ${err.message}`)
    exchangingKeypair = null
    throw err
  }
}
