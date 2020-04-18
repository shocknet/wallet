/**
 * @format
 */
import Logger from 'react-native-file-log'

const isFinite = require('lodash/isFinite')
const isNumber = require('lodash/isNumber')
const isNaN = require('lodash/isNaN')

/**
 * @typedef {object} ChatMessage
 * @prop {string} body
 * @prop {string} id
 * @prop {boolean} outgoing True if the message is an outgoing message,
 * otherwise it is an incoming message.
 * @prop {number} timestamp
 */

/**
 * A simpler representation of a conversation between two users than the
 * outgoing/incoming feed paradigm. It combines both the outgoing and incoming
 * messages into one data structure plus metada about the chat.
 * @typedef {object} Chat
 * @prop {string|null} recipientAvatar Base64 encoded image.
 * @prop {string} recipientPublicKey A way to uniquely identify each chat.
 * @prop {ChatMessage[]} messages Sorted from most recent to least recent.
 * @prop {string|null} recipientDisplayName
 * @prop {boolean} didDisconnect True if the recipient performed a disconnect.
 * @prop {string} id
 * @prop {number|null|undefined} lastSeenApp
 */

/**
 * @typedef {object} SimpleSentRequest
 * @prop {string} id
 * @prop {string|null} recipientAvatar
 * @prop {boolean} recipientChangedRequestAddress True if the recipient changed
 * the request node address and therefore can't no longer accept the request.
 * @prop {string|null} recipientDisplayName
 * @prop {string} recipientPublicKey Fallback for when user has no display name.
 * @prop {number} timestamp
 */

/**
 * @typedef {object} SimpleReceivedRequest
 * @prop {string} id
 * @prop {string|null} requestorAvatar
 * @prop {string|null} requestorDisplayName
 * @prop {string} requestorPK
 * @prop {string} response
 * @prop {number} timestamp
 */

/**
 * @typedef {object} User
 * @prop {string|null} avatar
 * @prop {string|null} currentHandshakeAddress
 * @prop {string|null} displayName
 * @prop {string} publicKey
 */

export {}

/**
 * @param {any} o
 * @returns {o is ChatMessage}
 */
export const isChatMessage = o => {
  if (typeof o !== 'object') {
    return false
  }

  if (o === null) {
    return false
  }

  const obj = /** @type {ChatMessage} */ (o)

  if (typeof obj.body !== 'string') {
    return false
  }

  if (typeof obj.id !== 'string') {
    return false
  }

  if (typeof obj.outgoing !== 'boolean') {
    return false
  }

  if (typeof obj.timestamp !== 'number') {
    return false
  }

  return true
}

/**
 * @param {any} o
 * @returns {o is Chat}
 */
export const isChat = o => {
  if (typeof o !== 'object') {
    return false
  }

  if (o === null) {
    return false
  }

  const obj = /** @type {Chat} */ (o)

  if (typeof obj.recipientAvatar !== 'string' && obj.recipientAvatar !== null) {
    return false
  }

  if (!Array.isArray(obj.messages)) {
    return false
  }

  if (typeof obj.recipientPublicKey !== 'string') {
    return false
  }

  if (obj.recipientPublicKey.length === 0) {
    return false
  }

  if (typeof obj.didDisconnect !== 'boolean') {
    return false
  }

  if (typeof obj.id !== 'string') {
    return false
  }

  return obj.messages.every(item => isChatMessage(item))
}

/**
 * @param {any} o
 * @returns {o is SimpleReceivedRequest}
 */
export const isSimpleReceivedRequest = o => {
  if (typeof o !== 'object') {
    return false
  }

  if (o === null) {
    return false
  }

  const obj = /** @type {SimpleReceivedRequest} */ (o)

  if (typeof obj.id !== 'string') {
    return false
  }

  if (typeof obj.requestorAvatar !== 'string' && obj.requestorAvatar !== null) {
    return false
  }

  if (
    typeof obj.requestorDisplayName !== 'string' &&
    obj.requestorDisplayName !== null
  ) {
    return false
  }

  if (typeof obj.requestorPK !== 'string') {
    return false
  }

  if (typeof obj.timestamp !== 'number') {
    return false
  }

  return true
}

/**
 * @param {any} o
 * @returns {o is SimpleSentRequest}
 */
export const isSimpleSentRequest = o => {
  if (typeof o !== 'object') {
    return false
  }

  if (o === null) {
    return false
  }

  const obj = /** @type {SimpleSentRequest} */ (o)

  if (typeof obj.id !== 'string') {
    return false
  }

  if (typeof obj.recipientAvatar !== 'string' && obj.recipientAvatar !== null) {
    return false
  }

  if (typeof obj.recipientChangedRequestAddress !== 'boolean') {
    return false
  }

  if (
    typeof obj.recipientDisplayName !== 'string' &&
    obj.recipientDisplayName !== null
  ) {
    return false
  }

  if (typeof obj.recipientPublicKey !== 'string') {
    return false
  }

  if (typeof obj.timestamp !== 'number') {
    return false
  }

  return true
}

/**
 * @typedef {import('./schema-types').EncSpontPayment} EncSpontPayment
 */

const ENC_SPONT_PAYMENT_PREFIX = '$$__SHOCKWALLET__SPONT__PAYMENT'

/**
 * @param {string} s
 * @returns {s is EncSpontPayment}
 */
export const isEncodedSpontPayment = s =>
  s.indexOf(ENC_SPONT_PAYMENT_PREFIX) === 0

/**
 * @typedef {object} SpontaneousPayment
 * @prop {number} amt
 * @prop {string} memo
 * @prop {string} preimage
 */

/**
 *
 * @param {EncSpontPayment} sp
 * @throws {Error} If decoding fails.
 * @returns {SpontaneousPayment}
 */
export const decodeSpontPayment = sp => {
  try {
    const [amtStr, memo, preimage] = sp
      .slice((ENC_SPONT_PAYMENT_PREFIX + '__').length)
      .split('__')

    if (typeof preimage !== 'string') {
      throw new TypeError('Could not parse preimage')
    }

    if (typeof amtStr !== 'string') {
      throw new TypeError('Could not parse amt')
    }

    if (typeof memo !== 'string') {
      throw new TypeError('Could not parse memo')
    }

    const amt = Number(amtStr)

    if (!isNumber(amt)) {
      throw new TypeError(`Could parse amount as a number, not a number?`)
    }

    if (isNaN(amt)) {
      throw new TypeError(`Could not parse amount as a number, got NaN.`)
    }

    if (!isFinite(amt)) {
      throw new TypeError(
        `Amount was correctly parsed, but got a non finite number.`,
      )
    }

    return {
      amt,
      memo,
      preimage,
    }
  } catch (err) {
    Logger.log(`Encoded spontaneous payment: ${sp}`)
    Logger.log(err.toString())
    throw err
  }
}

/**
 * @param {number} amt
 * @param {string} memo
 * @param {string} preimage
 * @returns {EncSpontPayment}
 */
export const encodeSpontaneousPayment = (amt, memo, preimage) => {
  if (typeof amt !== 'number') {
    throw new TypeError('amt must be a number')
  }

  if (typeof memo !== 'string') {
    throw new TypeError('memo must be an string')
  }

  if (typeof preimage !== 'string') {
    throw new TypeError('preimage must be an string')
  }

  if (amt <= 0) {
    throw new RangeError('Amt must be greater than zero')
  }

  if (memo.length < 1) {
    throw new TypeError('Memo must be populated')
  }

  if (preimage.length < 1) {
    throw new TypeError('preimage must be populated')
  }

  const enc = `${ENC_SPONT_PAYMENT_PREFIX}__${amt}__${memo}__${preimage}`

  if (isEncodedSpontPayment(enc)) {
    return enc
  }

  throw new Error('isEncodedSpontPayment(enc) false')
}
