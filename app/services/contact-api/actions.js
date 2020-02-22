/**
 * @format
 */

import debounce from 'lodash/debounce'
import once from 'lodash/once'

import * as Cache from '../../services/cache'
import { defaultName } from '../utils'

import Action from './action'
import Event from './event'
import * as Events from './events'
import { socket } from './socket'

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
 * @returns {Promise<void>}
 */
export const logout = () => {
  return getToken().then(token => {
    if (!socket || !(socket && socket.connected)) {
      throw new Error('NOT_CONNECTED')
    }

    socket.emit(Action.LOGOUT, {
      token,
    })
  })
}

/**
 * @param {string} alias
 * @param {string} pass
 */
export const register = (alias, pass) => {
  if (!socket || !(socket && socket.connected)) {
    throw new Error('NOT_CONNECTED')
  }

  socket.emit(Action.REGISTER, { alias, pass })
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

  Events.setSentReqs([
    // filter a possible existing req
    ...currSentReqs.filter(r => r.recipientPublicKey !== recipientPublicKey),
    {
      id: uuid,
      recipientAvatar: existingReq ? existingReq.recipientAvatar : null,
      recipientChangedRequestAddress: false,
      recipientDisplayName: existingReq
        ? existingReq.recipientDisplayName
        : defaultName(recipientPublicKey),
      recipientPublicKey,
      timestamp: Date.now(),
    },
  ])

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
    Events.setSentReqs(Events.getCurrSentReqs().filter(r => r.id !== uuid))
    throw new Error(res.msg || 'Unknown Error')
  }
}

/**
 * @param {string} recipientPublicKey
 * @param {string} body
 * @returns {Promise<void>}
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

  console.warn(`res in sendreqwithinitialmsg: ${JSON.stringify(res)}`)

  if (!res.ok) {
    throw new Error(res.msg)
  }
}

/**
 * @param {string} recipientPub
 * @param {number|string} amount
 * @param {string} memo
 * @throws {Error} Forwards an error if any from the API.
 * @returns {Promise<void>}
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

  const res = await new Promise(resolve => {
    socket &&
      socket.on(
        Action.SEND_PAYMENT,
        once(res => {
          if (res.origBody.uuid === uuid) {
            resolve(res)
          }
        }),
      )
  })

  console.warn(`res in sendPayment: ${JSON.stringify(res)}`)

  if (!res.ok) {
    throw new Error(res.msg || 'Unknown Error')
  }
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

  /** @type {import('./schema').Chat[]} */
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
