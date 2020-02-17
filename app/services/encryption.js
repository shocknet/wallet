import { NativeModules } from 'react-native'
// @ts-ignore
import Crypto from 'react-native-crypto'
import { RSA, RSAKeychain } from 'react-native-rsa-native'
const { Aes } = NativeModules
const nonEncryptedEvents = ['ping', 'disconnect', 'IS_GUN_AUTH']

/**
 * @typedef {object} EncryptResult
 * @prop {string} encryptedData
 * @prop {string} encryptedKey
 * @prop {string} iv
 */

/**
 * @typedef {object} DecryptResult
 * @prop {string} decryptedData
 */

/**
 * @param {number} length
 * @returns {Promise<string>}
 */
export const generateRandomBytes = (length = 16) =>
  new Promise((resolve, reject) => {
    Crypto.randomBytes(
      length,
      /**
       * @param {any} err
       * @param {{ toString: (encoding: ('hex'|'base64')) => string }} randomBytes
       */
      (err, randomBytes) => {
        if (err) {
          reject(err)
          return
        }

        resolve(randomBytes.toString('hex'))
      },
    )
  })

/**
 * @param {string} data
 * @param {string} rsaKey
 * @returns {Promise<EncryptResult>}
 */
export const encryptData = async (data, rsaKey) => {
  const [key, iv] = await Promise.all([
    generateRandomBytes(32),
    generateRandomBytes(16),
  ])
  console.log('AES Key:', key, rsaKey)
  const [encryptedData, encryptedKey] = await Promise.all([
    Aes.encrypt(data, key, iv),
    encryptKey(key, rsaKey),
  ])
  return {
    encryptedData,
    encryptedKey,
    iv,
  }
}

/**
 * @param {{ encryptedData: string, key: string, iv: string }} data
 * @returns {Promise<DecryptResult>}
 */
export const decryptData = async ({ encryptedData, key, iv }) => {
  const decrypted = await Aes.decrypt(encryptedData, key, iv)
  console.log('Decrypted data:', decrypted)
  return {
    decryptedData: decrypted,
  }
}

/**
 * @param {string} aesKey
 * @param {string} rsaKey
 * @returns {Promise<string>}
 */
export const encryptKey = async (aesKey, rsaKey) => {
  console.log('publicKey', rsaKey)
  const encryptedKey = await RSA.encrypt(aesKey, rsaKey)
  return encryptedKey
}

/**
 * @param {string} encryptedKey
 * @param {string?} sessionId
 * @returns {Promise<string>}
 */
export const decryptKey = async (encryptedKey, sessionId) => {
  try {
    const keyTag = `com.shocknet.APIKey.${sessionId}`
    console.log('Decrypting Key:', encryptedKey)
    const decryptedKey = await RSAKeychain.decrypt(encryptedKey, keyTag)
    console.log('Decrypted Key:', decryptedKey)
    return decryptedKey
  } catch (err) {
    console.warn(err)
    throw err
  }
}

/**
 * @param {string} eventName
 * @returns {boolean}
 */
export const isNonEncrypted = eventName =>
  nonEncryptedEvents.includes(eventName)
