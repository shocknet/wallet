/**
 * @format
 */

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
    console.warn(`isChatMessage->typeof o !== 'object'`)
    return false
  }

  if (o === null) {
    console.warn(`isChatMessage->o === null`)
    return false
  }

  const obj = /** @type {ChatMessage} */ (o)

  if (typeof obj.body !== 'string') {
    console.warn(
      `isChatMessage->typeof obj.body !== 'string' : ${typeof obj.body} : o: ${JSON.stringify(
        obj,
      )}`,
    )
    return false
  }

  if (typeof obj.id !== 'string') {
    console.warn(`isChatMessage->typeof obj.id !== 'string' : ${typeof obj.id}`)
    return false
  }

  if (typeof obj.outgoing !== 'boolean') {
    console.warn(
      `isChatMessage->typeof obj.outgoing !== 'boolean' : ${typeof obj.outgoing}`,
    )
    return false
  }

  if (typeof obj.timestamp !== 'number') {
    console.warn(
      `isChatMessage->typeof obj.timestamp !== 'number' : ${typeof obj.timestamp}`,
    )
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
    console.warn(`isChat->typeof o !== 'object' : ${typeof o}`)
    return false
  }

  if (o === null) {
    console.warn(`isChat->o === null`)
    return false
  }

  const obj = /** @type {Chat} */ (o)

  if (typeof obj.recipientAvatar !== 'string' && obj.recipientAvatar !== null) {
    console.warn(
      `isChat-> typeof obj.recipientAvatar !== 'string' && obj.recipientAvatar !== null : ${typeof obj.recipientAvatar}`,
    )
    return false
  }

  if (!Array.isArray(obj.messages)) {
    console.warn(`isChat-> !Array.isArray(obj.messages)`)
    return false
  }

  if (typeof obj.recipientPublicKey !== 'string') {
    console.warn(
      `isChat-> typeof obj.recipientPublicKey !== 'string' : ${typeof obj.recipientPublicKey}`,
    )
    return false
  }

  if (obj.recipientPublicKey.length === 0) {
    console.warn(`isChat-> obj.recipientPublicKey.length === 0`)
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

  if (typeof obj.response !== 'string') {
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
