/**
 * @format
 */

import debounce from 'lodash/debounce'
import once from 'lodash/once'

import Action from './action'
import Event from './event'
import { _authData as authData } from './events'
import { socket } from './socket'

/**
 * @param {string} alias
 * @param {string} pass
 */
export const auth = (alias, pass) => {
  if (!socket.connected) {
    throw new Error('NOT_CONNECTED')
  }

  socket.emit(Action.AUTHENTICATE, { alias, pass })
}

/**
 * @param {string} requestID
 */
export const acceptRequest = requestID => {
  if (!socket.connected) {
    throw new Error('NOT_CONNECTED')
  }

  if (authData === null) {
    throw new Error('NOT_AUTH')
  }

  socket.emit(Action.ACCEPT_REQUEST, {
    token: authData.token,
    requestID,
  })
}

export const generateNewHandshakeNode = () => {
  if (!socket.connected) {
    throw new Error('NOT_CONNECTED')
  }

  if (authData === null) {
    throw new Error('NOT_AUTH')
  }

  socket.emit(Action.GENERATE_NEW_HANDSHAKE_NODE, {
    token: authData.token,
  })
}

export const logout = () => {
  if (!socket.connected) {
    throw new Error('NOT_CONNECTED')
  }

  if (authData === null) {
    throw new Error('NOT_AUTH')
  }

  socket.emit(Action.LOGOUT, {
    token: authData.token,
  })
}

/**
 * @param {string} alias
 * @param {string} pass
 */
export const register = (alias, pass) => {
  if (!socket.connected) {
    throw new Error('NOT_CONNECTED')
  }

  socket.emit(Action.REGISTER, { alias, pass })
}

/**
 * @param {string} avatar
 */
export const setAvatar = avatar => {
  if (!socket.connected) {
    throw new Error('NOT_CONNECTED')
  }

  if (authData === null) {
    throw new Error('NOT_AUTH')
  }

  socket.emit(Action.SET_AVATAR, {
    token: authData.token,
    avatar,
  })
}

/**
 * @param {string} displayName
 */
export const setDisplayName = displayName => {
  if (!socket.connected) {
    throw new Error('NOT_CONNECTED')
  }

  if (authData === null) {
    throw new Error('NOT_AUTH')
  }

  socket.emit(Action.SET_DISPLAY_NAME, {
    token: authData.token,
    displayName,
  })
}

/**
 * @param {string} recipientPublicKey
 */
export const sendHandshakeRequest = recipientPublicKey => {
  if (!socket.connected) {
    throw new Error('NOT_CONNECTED')
  }

  if (authData === null) {
    throw new Error('NOT_AUTH')
  }

  socket.emit(Action.SEND_HANDSHAKE_REQUEST, {
    token: authData.token,
    recipientPublicKey,
  })

  // issue#31
  const { token } = authData
  setTimeout(() => {
    socket.emit(Event.ON_SENT_REQUESTS, {
      token,
    })
  }, 500)
}

/**
 * @param {string} recipientPublicKey
 * @param {string} body
 */
export const sendMessage = (recipientPublicKey, body) => {
  if (!socket.connected) {
    throw new Error('NOT_CONNECTED')
  }

  if (authData === null) {
    throw new Error('NOT_AUTH')
  }

  socket.emit(Action.SEND_MESSAGE, {
    token: authData.token,
    recipientPublicKey,
    body,
  })
}

/**
 * @param {string} recipientPublicKey
 * @param {string} initialMsg
 * @throws {Error} Forwards an error if any from the API.
 * @returns {Promise<void>}
 */
export const sendReqWithInitialMsg = async (recipientPublicKey, initialMsg) => {
  if (!socket.connected) {
    throw new Error('NOT_CONNECTED')
  }

  if (authData === null) {
    throw new Error('NOT_AUTH')
  }

  socket.emit(Action.SEND_HANDSHAKE_REQUEST_WITH_INITIAL_MSG, {
    token: authData.token,
    recipientPublicKey,
    initialMsg,
  })

  const res = await new Promise(resolve => {
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

  // issue#31
  const { token } = authData
  setTimeout(() => {
    socket.emit(Event.ON_SENT_REQUESTS, {
      token,
    })
  }, 500)

  if (!res.ok) {
    throw new Error(res.msg)
  }
}
