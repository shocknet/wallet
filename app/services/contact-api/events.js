/**
 * @format
 */
import once from 'lodash/once'

import Action from './action'
import Event from './event'
import * as Socket from './socket'
import * as Schema from './schema'

////////////////////////////////////////////////////////////////////////////////
// AUTH AND CONNECTIVITY ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {object} _AuthData
 * @prop {string} publicKey
 * @prop {string} token
 */

/** @typedef {_AuthData|null} AuthData */

/** @typedef {(authData: AuthData) => void} AuthListener */
/** @typedef {(connected: boolean) => void} ConnectionListener  */

/**
 * @type {AuthData}
 */
export let _authData = null

/**
 * @type {AuthListener[]}
 */
const authListeners = []

/**
 * @type {ConnectionListener[]}
 */
const connectionListeners = []

/**
 *
 * @param {AuthData} ad
 */
export const initAuthData = ad => {
  _authData = ad

  setImmediate(() => {
    authListeners.forEach(l => {
      l(_authData)
    })
  })
}

/**
 * @param {AuthListener} listener
 */
export const onAuth = listener => {
  if (authListeners.indexOf(listener) > -1) {
    throw new Error('tried to subscribe twice')
  }

  authListeners.push(listener)

  setImmediate(() => {
    // in case unsub was called before next tick
    if (authListeners.includes(listener)) {
      listener(_authData)
    }
  })

  return () => {
    const idx = authListeners.indexOf(listener)

    if (idx < 0) {
      throw new Error('tried to unsubscribe twice')
    }

    authListeners.splice(idx, 1)
  }
}

/**
 * @param {ConnectionListener} listener
 */
export const onConnection = listener => {
  if (connectionListeners.indexOf(listener) > -1) {
    throw new Error('tried to subscribe twice')
  }

  connectionListeners.push(listener)

  setImmediate(() => {
    // check listener is still subbed in case unsub is called before next tick
    if (!connectionListeners.includes(listener)) {
      return
    }

    if (Socket.socket) {
      if (Socket.socket.connected) {
        listener(true)
      } else {
        // this nicely handles initial connection cases
        Socket.socket.on(
          'connect',
          once(() => {
            listener(true)
          }),
        )
      }
    } else {
      listener(false)
    }
  })

  return () => {
    const idx = connectionListeners.indexOf(listener)

    if (idx < 0) {
      throw new Error('tried to unsubscribe twice')
    }

    connectionListeners.splice(idx, 1)
  }
}

////////////////////////////////////////////////////////////////////////////////
// DATA EVENTS /////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/** @typedef {(avatar: string|null) => void} AvatarListener */
/** @typedef {(chats: Schema.Chat[]) => void} ChatsListener  */
/** @typedef {(handshakeAddress: string|null) => void} HandshakeAddrListener */
/** @typedef {(displayName: string|null) => void} DisplayNameListener */
/** @typedef {(receivedRequests: Schema.SimpleReceivedRequest[]) => void} ReceivedRequestsListener */
/** @typedef {(sentRequests: Schema.SimpleSentRequest[]) => void} SentRequestsListener */
/** @typedef {(users: Schema.User[]) => void} UsersListener  */

/**
 * @type {AvatarListener[]}
 */
const avatarListeners = []

/**
 * @type {ChatsListener[]}
 */
const chatsListeners = []

/**
 * @type {HandshakeAddrListener[]}
 */
const handshakeAddrListeners = []

/**
 * @type {DisplayNameListener[]}
 */
const displayNameListeners = []

/**
 * @type {ReceivedRequestsListener[]}
 */
const receivedRequestsListeners = []

/**
 * @type {SentRequestsListener[]}
 */
const sentRequestsListeners = []

/**
 * @type {UsersListener[]}
 */
const usersListeners = []

/**
 * @param {AvatarListener} listener
 */
export const onAvatar = listener => {
  if (_authData === null) {
    throw new Error('NOT_AUTH')
  }

  if (avatarListeners.indexOf(listener) > -1) {
    throw new Error('tried to subscribe twice')
  }

  avatarListeners.push(listener)

  Socket.socket.emit(Event.ON_AVATAR, {
    token: _authData.token,
  })

  return () => {
    const idx = avatarListeners.indexOf(listener)

    if (idx < 0) {
      throw new Error('tried to unsubscribe twice')
    }

    avatarListeners.splice(idx, 1)
  }
}

/**
 * @param {ChatsListener} listener
 */
export const onChats = listener => {
  if (_authData === null) {
    throw new Error('NOT_AUTH')
  }

  if (chatsListeners.indexOf(listener) > -1) {
    throw new Error('tried to subscribe twice')
  }

  chatsListeners.push(listener)

  Socket.socket.emit(Event.ON_CHATS, {
    token: _authData.token,
  })

  return () => {
    const idx = chatsListeners.indexOf(listener)

    if (idx < 0) {
      throw new Error('tried to unsubscribe twice')
    }

    chatsListeners.splice(idx, 1)
  }
}

/**
 * @param {HandshakeAddrListener} listener
 */
export const onHandshakeAddr = listener => {
  if (_authData === null) {
    throw new Error('NOT_AUTH')
  }

  if (handshakeAddrListeners.indexOf(listener) > -1) {
    throw new Error('tried to subscribe twice')
  }

  handshakeAddrListeners.push(listener)

  Socket.socket.emit(Event.ON_HANDSHAKE_ADDRESS, {
    token: _authData.token,
  })

  return () => {
    const idx = handshakeAddrListeners.indexOf(listener)

    if (idx < 0) {
      throw new Error('tried to unsubscribe twice')
    }

    handshakeAddrListeners.splice(idx, 1)
  }
}

/**
 * @param {DisplayNameListener} listener
 */
export const onDisplayName = listener => {
  if (_authData === null) {
    throw new Error('NOT_AUTH')
  }

  if (displayNameListeners.indexOf(listener) > -1) {
    throw new Error('tried to subscribe twice')
  }

  displayNameListeners.push(listener)

  Socket.socket.emit(Event.ON_DISPLAY_NAME, {
    token: _authData.token,
  })

  return () => {
    const idx = displayNameListeners.indexOf(listener)

    if (idx < 0) {
      throw new Error('tried to unsubscribe twice')
    }

    displayNameListeners.splice(idx, 1)
  }
}

/**
 * @param {ReceivedRequestsListener} listener
 */
export const onReceivedRequests = listener => {
  if (_authData === null) {
    throw new Error('NOT_AUTH')
  }

  if (receivedRequestsListeners.indexOf(listener) > -1) {
    throw new Error('tried to subscribe twice')
  }

  receivedRequestsListeners.push(listener)

  Socket.socket.emit(Event.ON_RECEIVED_REQUESTS, {
    token: _authData.token,
  })

  return () => {
    const idx = receivedRequestsListeners.indexOf(listener)

    if (idx < 0) {
      throw new Error('tried to unsubscribe twice')
    }

    receivedRequestsListeners.splice(idx, 1)
  }
}

/**
 * @param {SentRequestsListener} listener
 */
export const onSentRequests = listener => {
  if (_authData === null) {
    throw new Error('NOT_AUTH')
  }

  if (sentRequestsListeners.indexOf(listener) > -1) {
    throw new Error('tried to subscribe twice')
  }

  sentRequestsListeners.push(listener)

  Socket.socket.emit(Event.ON_SENT_REQUESTS, {
    token: _authData.token,
  })

  return () => {
    const idx = sentRequestsListeners.indexOf(listener)

    if (idx < 0) {
      throw new Error('tried to unsubscribe twice')
    }

    sentRequestsListeners.splice(idx, 1)
  }
}

/**
 * @param {UsersListener} listener
 */
export const onUsers = listener => {
  if (_authData === null) {
    throw new Error('NOT_AUTH')
  }

  if (usersListeners.indexOf(listener) > -1) {
    throw new Error('tried to subscribe twice')
  }

  usersListeners.push(listener)

  Socket.socket.emit(Event.ON_ALL_USERS, {
    token: _authData.token,
  })

  return () => {
    const idx = usersListeners.indexOf(listener)

    if (idx < 0) {
      throw new Error('tried to unsubscribe twice')
    }

    usersListeners.splice(idx, 1)
  }
}

////////////////////////////////////////////////////////////////////////////////
// ACTION EVENTS ///////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {object} _RegisterListenerDataBAD
 * @prop {false} ok
 * @prop {string} msg
 * @prop {string} alias
 * @prop {string} pass
 */

/**
 * @typedef {object} _RegisterListenerDataOK
 * @prop {true} ok
 * @prop {null} msg
 * @prop {string} alias
 * @prop {string} pass
 */

/**
 * @typedef {_RegisterListenerDataBAD|_RegisterListenerDataOK} RegisterListenerData
 */

/** @typedef {(res: RegisterListenerData) => void} RegisterListener  */

/**
 * @type {RegisterListener[]}
 */
const registerListeners = []

/**
 *
 * @param {RegisterListener} listener
 */
export const onRegister = listener => {
  if (registerListeners.indexOf(listener) > -1) {
    throw new Error('tried to subscribe twice')
  }

  registerListeners.push(listener)

  return () => {
    const idx = registerListeners.indexOf(listener)

    if (idx < 0) {
      throw new Error('tried to unsubscribe twice')
    }

    registerListeners.splice(idx, 1)
  }
}

export const setupEvents = () => {
  Socket.socket.on('connect', () => {
    console.warn('socket connected')
    connectionListeners.forEach(l => {
      l(true)
    })
  })

  Socket.socket.on('disconnect', reason => {
    connectionListeners.forEach(l => {
      l(false)
    })

    if (reason === 'io server disconnect') {
      // https://socket.io/docs/client-api/#Event-%E2%80%98disconnect%E2%80%99
      Socket.socket.connect()
    }
  })

  Socket.socket.on(Action.REGISTER, res => {
    registerListeners.forEach(l => {
      l({
        alias: res.origBody.alias,
        msg: res.msg,
        ok: res.ok,
        pass: res.origBody.pass,
      })
    })
  })

  Socket.socket.on(Event.ON_AVATAR, res => {
    if (res.ok) {
      avatarListeners.forEach(l => {
        l(res.msg)
      })
    }
  })

  Socket.socket.on(Event.ON_CHATS, res => {
    if (res.ok) {
      chatsListeners.forEach(l => {
        l(res.msg)
      })
    }
  })

  Socket.socket.on(Event.ON_HANDSHAKE_ADDRESS, res => {
    if (res.ok) {
      handshakeAddrListeners.forEach(l => {
        l(res.msg)
      })
    }
  })

  Socket.socket.on(Event.ON_DISPLAY_NAME, res => {
    if (res.ok) {
      displayNameListeners.forEach(l => {
        l(res.msg)
      })
    }
  })

  Socket.socket.on(Event.ON_RECEIVED_REQUESTS, res => {
    if (res.ok) {
      receivedRequestsListeners.forEach(l => {
        l(res.msg)
      })
    }
  })

  Socket.socket.on(Event.ON_SENT_REQUESTS, res => {
    if (res.ok) {
      sentRequestsListeners.forEach(l => {
        l(res.msg)
      })
    }
  })

  Socket.socket.on(Event.ON_ALL_USERS, res => {
    if (res.ok) {
      usersListeners.forEach(l => {
        l(res.msg)
      })
    }
  })

  // If when receiving a token expired response on response to any data event
  // notify auth listeners that the token expired.
  Object.values(Event).forEach(e => {
    Socket.socket.on(e, res => {
      console.warn(`res for event: ${e}: ${JSON.stringify(res)}`)

      if (
        res.msg === 'Token expired.' ||
        res.msg === 'NOT_AUTH' ||
        res.msg === 'secret or public key must be provided'
      ) {
        _authData = null

        authListeners.forEach(l => {
          l(_authData)
        })
      }
    })
  })

  // If when receiving a token expired response on response to any action event
  // notify auth listeners that the token expired.
  Object.values(Action).forEach(a => {
    Socket.socket.on(a, res => {
      console.warn(`res for action: ${a}: ${JSON.stringify(res)}`)
      if (
        res.msg === 'Token expired.' ||
        res.msg === 'NOT_AUTH' ||
        res.msg === 'secret or public key must be provided'
      ) {
        _authData = null

        authListeners.forEach(l => {
          l(_authData)
        })
      }
    })
  })
}
