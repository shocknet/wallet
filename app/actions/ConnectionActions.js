import Http from 'axios'
import { RSAKeychain } from 'react-native-rsa-native'

export const ACTIONS = {
  LOAD_NEW_KEYS: 'encryption/loadKeys',
}

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

const getPublicKey = async (keyTag = '') => {
  try {
    console.log('getPublicKey:', keyTag)
    const publicKey = await RSAKeychain.getPublicKey(keyTag)
    console.log('publicKey:', publicKey)
    return publicKey
  } catch (err) {
    console.error(err)
    return null
  }
}

/**
 * @typedef {object} ExchangeKeyPairParams
 * @prop {string} deviceId
 * @prop {string?} sessionId
 * @prop {string?} cachedSessionId
 * @prop {(string)=} baseURL
 */

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
    console.log({
      deviceId,
      sessionId,
      cachedSessionId,
    })
    const keyTag = `com.shocknet.APIKey.${sessionId}`
    const oldKeyTag = `com.shocknet.APIKey.${cachedSessionId}`
    const oldKeypair = await getPublicKey(oldKeyTag)
    console.log('Old Keypair:', oldKeypair)

    if (sessionId === cachedSessionId) {
      return {
        success: true,
      }
    }

    if (oldKeypair) {
      await RSAKeychain.deletePrivateKey(oldKeyTag)
    }

    console.log('Generating new key...')
    const keyPair = await RSAKeychain.generateKeys(keyTag, 4096)
    console.log('New key generated')
    console.log('New Keypair', {
      publicKey: keyPair.public,
      deviceId,
    })
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

    dispatch({
      type: ACTIONS.LOAD_NEW_KEYS,
      data,
    })

    return data
  } catch (err) {
    console.error(err)
    throw err
  }
}
