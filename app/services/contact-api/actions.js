/**
 * @format
 */

import debounce from 'lodash/debounce'
import once from 'lodash/once'
import Logger from 'react-native-file-log'
import { Constants, Schema, APISchema } from 'shock-common'
import Http from 'axios'

import * as Cache from '../../services/cache'

import * as Events from './events'
import { socket } from './socket'

const { Action } = Constants
const { Event } = Constants

/**
 * @throws {Error} If no data is cached.
 * @returns {Promise<string>}
 */
const getToken = async () => {
  const authData = await Cache.getStoredAuthData()

  if (authData === null) {
    throw new Error('Subscribed to event without having auth data cached.')
  }

  return authData.authData.token
}

/**
 * @param {string} requestID
 */
export const acceptRequest = requestID => {
  return Cache.getToken().then(token => {
    if (!socket || !(socket && socket.connected)) {
      throw new Error('NOT_CONNECTED')
    }
    socket.emit(Action.ACCEPT_REQUEST, {
      token,
      requestID,
    })

    socket.emit(Event.ON_CHATS, {
      token,
    })
  })
}

/**
 * @returns {Promise<void>}
 */
export const generateNewHandshakeNode = () => {
  return getToken().then(token => {
    if (!socket || !(socket && socket.connected)) {
      throw new Error('NOT_CONNECTED')
    }

    socket.emit(Action.GENERATE_NEW_HANDSHAKE_NODE, {
      token,
    })
  })
}

/**
 * @param {string} avatar
 */
export const setAvatar = avatar => {
  if (!socket || !(socket && socket.connected)) {
    throw new Error('NOT_CONNECTED')
  }

  const uuid = Math.random().toString() + Date.now().toString()
  const oldAvatar = Events.getAvatar()
  Events.setAvatar(avatar)

  const cb = once(res => {
    if (!socket || !(socket && socket.connected)) {
      throw new Error('NOT_CONNECTED')
    }
    socket.off(Action.SET_AVATAR, cb)
    if (!res.ok) {
      if (res.origBody.uuid === uuid) {
        Events.setAvatar(oldAvatar)
      }
    }
  })

  socket.on(Action.SET_AVATAR, cb)

  getToken().then(token => {
    if (!socket || !(socket && socket.connected)) {
      throw new Error('NOT_CONNECTED')
    }

    socket.emit(Action.SET_AVATAR, {
      token,
      avatar,
    })
  })
}

/**
 * @param {string} displayName
 * @returns {Promise<void>}
 */
export const setDisplayName = displayName => {
  return getToken().then(token => {
    if (!socket || !(socket && socket.connected)) {
      throw new Error('NOT_CONNECTED')
    }
    socket.emit(Action.SET_DISPLAY_NAME, {
      token,
      displayName,
    })
  })
}

/**
 * @param {string} recipientPublicKey
 * @returns {Promise<void>}
 */
export const sendHandshakeRequest = async recipientPublicKey => {
  const currSentReqs = Events.getCurrSentReqs()
  const currChats = Events.getCurrChats()
  const uuid = Date.now().toString() + Math.random().toString()

  if (currChats.find(c => c.recipientPublicKey === recipientPublicKey)) {
    throw new Error('Handshake already in place')
  }

  const existingReq = currSentReqs.find(
    r => r.recipientPublicKey === recipientPublicKey,
  )

  if (existingReq && !existingReq.recipientChangedRequestAddress) {
    throw new Error('A request is already in place')
  }

  const token = await getToken()

  if (!socket || !(socket && socket.connected)) {
    throw new Error('NOT_CONNECTED')
  }

  socket.emit(Action.SEND_HANDSHAKE_REQUEST, {
    token,
    recipientPublicKey,
    uuid,
  })

  /** @type {import('./socket').Emission} */
  const res = await new Promise(resolve => {
    if (!socket || !(socket && socket.connected)) {
      throw new Error('NOT_CONNECTED')
    }
    socket.on(Action.SEND_HANDSHAKE_REQUEST, res => {
      if (res.origBody.uuid === uuid) {
        resolve(res)
      }
    })
  })

  if (!res.ok) {
    throw new Error(res.msg || 'Unknown Error')
  }
}

/**
 * Returns the message id.
 * @param {string} recipientPublicKey
 * @param {string} body
 * @returns {Promise<string>} The message id.
 */
export const sendMessage = async (recipientPublicKey, body) => {
  const uuid = Math.random().toString() + Date.now().toString()

  getToken().then(token => {
    if (!socket || !(socket && socket.connected)) {
      throw new Error('NOT_CONNECTED')
    }

    socket.emit(Action.SEND_MESSAGE, {
      token,
      recipientPublicKey,
      body,
      uuid,
    })
  })

  const res = await new Promise(resolve => {
    if (!socket || !(socket && socket.connected)) {
      throw new Error('NOT_CONNECTED')
    }
    socket.on(
      Action.SEND_MESSAGE,
      once(res => {
        if (res.origBody.uuid === uuid) {
          resolve(res)
        }
      }),
    )
  })

  if (!res.ok) {
    throw new Error(res.msg || 'Unknown Error')
  }

  return res.msg
}

/**
 * @param {string} recipientPublicKey
 * @param {string} initialMsg
 * @throws {Error} Forwards an error if any from the API.
 * @returns {Promise<void>}
 */
export const sendReqWithInitialMsg = async (recipientPublicKey, initialMsg) => {
  const token = await getToken()
  if (!socket || !(socket && socket.connected)) {
    throw new Error('NOT_CONNECTED')
  }

  socket.emit(Action.SEND_HANDSHAKE_REQUEST_WITH_INITIAL_MSG, {
    token,
    recipientPublicKey,
    initialMsg,
  })

  const res = await new Promise(resolve => {
    socket &&
      socket.on(
        Action.SEND_HANDSHAKE_REQUEST_WITH_INITIAL_MSG,
        debounce(
          once(res => {
            resolve(res)
          }),
          1000,
        ),
      )
  })

  Logger.log(`res in sendreqwithinitialmsg: ${JSON.stringify(res)}`)

  if (!res.ok) {
    throw new Error(res.msg)
  }
}

/**
 * Returns the preimage corresponding to the payment.
 * @param {string} recipientPub
 * @param {number|string} amount
 * @param {string} memo
 * @throws {Error} Forwards an error if any from the API.
 * @returns {Promise<string>} The payment's preimage.
 */
export const sendPayment = async (recipientPub, amount, memo) => {
  const token = await getToken()
  if (!socket || !(socket && socket.connected)) {
    throw new Error('NOT_CONNECTED')
  }

  const uuid = Date.now().toString()

  socket.emit(Action.SEND_PAYMENT, {
    token,
    recipientPub,
    amount,
    memo,
    uuid,
  })

  let timeoutid = -1

  /**
   * @type {import('./socket').Emission}
   */
  const res = await Promise.race([
    new Promise(resolve => {
      socket &&
        socket.on(
          Action.SEND_PAYMENT,
          once(res => {
            if (res.origBody.uuid === uuid) {
              clearTimeout(timeoutid)
              resolve(res)
            }
          }),
        )
    }),
    new Promise((_, rej) => {
      timeoutid = setTimeout(() => {
        rej(
          new Error(
            'Did not receive a response from the node in less than 30 seconds',
          ),
        )
      }, 30000)
    }),
  ])

  Logger.log(`res in sendPayment: ${JSON.stringify(res)}`)

  if (!res.ok) {
    throw new Error(res.msg || 'Unknown Error')
  }

  if (typeof res.msg !== 'string') {
    throw new Error('Did not get pregimage from node')
  }

  return res.msg
}

/**
 * @param {string} bio
 * @returns {Promise<void>}
 */
export const setBio = async bio => {
  const token = await getToken()
  if (!socket || !(socket && socket.connected)) {
    throw new Error('NOT_CONNECTED')
  }

  const uuid = Date.now().toString()

  socket.emit(Action.SET_BIO, {
    token,
    bio,
    uuid,
  })

  const res = await new Promise(resolve => {
    socket &&
      socket.on(
        Action.SET_BIO,
        once(res => {
          if (res.origBody.uuid === uuid) {
            resolve(res)
          }
        }),
      )
  })

  if (!res.ok) {
    throw new Error(res.msg || 'Unknown Error')
  }
}

/**
 * @param {string} pub
 * @throws {Error}
 * @returns {Promise<void>}
 */
export const disconnect = async pub => {
  const chatIdx = Events.currentChats.findIndex(
    c => c.recipientPublicKey === pub,
  )

  /** @type {Schema.Chat[]} */
  let deletedChat = []

  // it's fine if it doesn't exist in our cache
  if (chatIdx !== -1) {
    const currChats = Events.getCurrChats()
    deletedChat = currChats.splice(chatIdx, 1)
    Events.setChats(currChats)
  }

  const token = await getToken()
  const uuid = Math.random().toString() + Date.now().toString()

  if (!socket || !(socket && socket.connected)) {
    throw new Error('NOT_CONNECTED')
  }

  socket.emit(Action.DISCONNECT, {
    pub,
    token,
    uuid,
  })

  const res = await new Promise(resolve => {
    if (!socket || !(socket && socket.connected)) {
      throw new Error('NOT_CONNECTED')
    }
    socket.on(
      Action.DISCONNECT,
      once(res => {
        if (res.origBody.uuid === uuid) {
          resolve(res)
        }
      }),
    )
  })

  if (!res.ok) {
    if (deletedChat.length) {
      Events.setChats([...Events.getCurrChats(), deletedChat[0]])
    }
    throw new Error(res.msg || 'Unknown Error')
  }
}

/**
 * @param {string} publicKey
 * @returns {Promise<void>}
 */
export const follow = publicKey => {
  /** @type {APISchema.FollowRequest} */
  const req = {
    publicKey,
  }
  return Http.post('/api/gun/follows', req)
}

/**
 * @param {string} publicKey
 * @returns {Promise<void>}
 */
export const unfollow = publicKey => {
  return Http.post('/api/gun/unfollow', { publicKey })
}
/**
 * @param {number} page
 * @returns {Promise<{data:Map<string,Schema.Post>}>}
 */
export const loadFeed = page => {
  //eslint-disable-next-line
  console.log(page)
  //return Http.post('/api/gun/loadfeed', { page })
  return Http.get('/api/gun/feedpoc')
}
/**
 * @param {number} page
 * @param {string} publicKey
 * @returns {Promise<{data:Map<string,Schema.Post>}>}
 */
export const loadSingleFeed = (page, publicKey) => {
  return Http.post('/api/gun/loadfeed', { page, publicKey })
}
/**
 * @param {object} post
 * @returns {Promise<{data:string}>}
 */
export const addPost = post => {
  return Http.post('/api/gun/addpost', { post })
}
