/**
 * @format
 */
import once from 'lodash/once'
import debounce from 'lodash/debounce'

import * as Cache from '../cache'

import Action from './action'
import Event from './event'
import * as Socket from './socket'
// eslint-disable-next-line no-unused-vars
import * as Schema from './schema'

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

/** @typedef {(connected: boolean) => void} ConnectionListener  */

/**
 * @type {ConnectionListener[]}
 */
const connectionListeners = []

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

/** @typedef {(handshakeAddress: string|null) => void} HandshakeAddrListener */
/** @typedef {(receivedRequests: Schema.SimpleReceivedRequest[]) => void} ReceivedRequestsListener */

/** @typedef {(users: Schema.User[]) => void} UsersListener  */

/**
 * @type {HandshakeAddrListener[]}
 */
const handshakeAddrListeners = []

/**
 * @type {UsersListener[]}
 */
const usersListeners = []

////////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {(a: string|null) => void} AvatarListener
 */

/** @type {Set<AvatarListener>} */
const avatarListeners = new Set()

/** @type {string|null} */
let currentAvatar = null

export const getAvatar = () => currentAvatar

/**
 * @param {string|null} a
 */
export const setAvatar = a => {
  currentAvatar = a || null
  avatarListeners.forEach(l => {
    l(currentAvatar)
  })
}

/**
 * @param {AvatarListener} listener
 * @returns {() => void}
 */
export const onAvatar = listener => {
  if (!avatarListeners.add(listener)) {
    throw new Error('tried to subscribe twice')
  }

  listener(currentAvatar)

  return () => {
    if (!avatarListeners.delete(listener)) {
      throw new Error('tried to unsubscribe twice')
    }
  }
}

////////////////////////////////////////////////////////////////////////////////

/** @type {string|null} */
let currentAddr = null

export const getHandshakeAddr = () => currentAddr

/** @param {string} addr */
export const setHandshakeAddress = addr => {
  currentAddr = addr
  handshakeAddrListeners.forEach(l => l(currentAddr))
}

/**
 * @param {HandshakeAddrListener} listener
 */
export const onHandshakeAddr = listener => {
  if (handshakeAddrListeners.indexOf(listener) > -1) {
    throw new Error('tried to subscribe twice')
  }

  handshakeAddrListeners.push(listener)

  listener(currentAddr)

  return () => {
    const idx = handshakeAddrListeners.indexOf(listener)

    if (idx < 0) {
      throw new Error('tried to unsubscribe twice')
    }

    handshakeAddrListeners.splice(idx, 1)
  }
}

////////////////////////////////////////////////////////////////////////////////

/** @typedef {(displayName: string|null) => void} DisplayNameListener */

/**
 * @type {Set<DisplayNameListener>}
 */
const displayNameListeners = new Set()

/** @type {string|null} */
let currentDisplayName = null

export const getDisplayName = () => currentDisplayName

/** @param {string|null} dn */
export const setDisplayName = dn => {
  currentDisplayName = dn || null
  displayNameListeners.forEach(l => {
    l(currentDisplayName)
  })
}

/**
 * @param {DisplayNameListener} listener
 */
export const onDisplayName = listener => {
  if (!displayNameListeners.add(listener)) {
    throw new Error('tried to subscribe twice')
  }

  listener(currentDisplayName)

  return () => {
    if (!displayNameListeners.delete(listener)) {
      throw new Error('tried to unsubscribe twice')
    }
  }
}

////////////////////////////////////////////////////////////////////////////////

/** @type {Schema.SimpleReceivedRequest[]} */
let currentReceivedReqs = []

export const currReceivedReqs = () => currentReceivedReqs

/** @type {Set<ReceivedRequestsListener>} */
const receivedReqsListeners = new Set()

/**
 * @param {ReceivedRequestsListener} listener
 * @returns {() => void}
 */
export const onReceivedRequests = listener => {
  if (!receivedReqsListeners.add(listener)) {
    throw new Error('Tried to subscribe twice')
  }

  listener(currentReceivedReqs)

  return () => {
    if (!receivedReqsListeners.delete(listener)) {
      throw new Error('Tried to unsubscribe twice')
    }
  }
}

////////////////////////////////////////////////////////////////////////////////

/** @typedef {(sentRequests: Schema.SimpleSentRequest[]) => void} SentRequestsListener */

/** @type {Set<SentRequestsListener>} */
const sentReqsListeners = new Set()

/** @type {Schema.SimpleSentRequest[]} */
let currSentReqs = []

export const getCurrSentReqs = () => currSentReqs

/** @param {Schema.SimpleSentRequest[]} sentReqs */
export const setSentReqs = sentReqs => {
  currSentReqs = [...sentReqs]
  sentReqsListeners.forEach(l => l(currSentReqs))
}

/**
 * @param {SentRequestsListener} listener
 */
export const onSentRequests = listener => {
  if (!sentReqsListeners.add(listener)) {
    throw new Error('Tried to subscribe twice')
  }

  listener(currSentReqs)

  return () => {
    if (!sentReqsListeners.delete(listener)) {
      throw new Error('Tried to unsubscribe twice')
    }
  }
}

/**
 * @param {UsersListener} listener
 */
export const onUsers = listener => {
  if (usersListeners.indexOf(listener) > -1) {
    throw new Error('tried to subscribe twice')
  }

  usersListeners.push(listener)

  setImmediate(async () => {
    Socket.socket.emit(Event.ON_ALL_USERS, {
      token: await getToken(),
    })
  })

  return () => {
    const idx = usersListeners.indexOf(listener)

    if (idx < 0) {
      throw new Error('tried to unsubscribe twice')
    }

    usersListeners.splice(idx, 1)
  }
}

/** @typedef {(bio: string|null) => void} BioListener*/

/** @type {string|null} */
export let currentBio = 'A ShockWallet user'

/**
 * @type {BioListener[]}
 */
const bioListeners = []

const notifyBioListeners = debounce(() => {
  bioListeners.forEach(l => l(currentBio))
}, 500)

/**
 * @param {BioListener} listener
 */
export const onBio = listener => {
  if (bioListeners.indexOf(listener) > -1) {
    throw new Error('tried to subscribe twice')
  }

  bioListeners.push(listener)

  setImmediate(async () => {
    notifyBioListeners() // will provide current value to listener
    Socket.socket.emit(Event.ON_BIO, {
      token: await getToken(),
    })
  })

  return () => {
    const idx = bioListeners.indexOf(listener)

    if (idx < 0) {
      throw new Error('tried to unsubscribe twice')
    }

    bioListeners.splice(idx, 1)
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

/** @typedef {(chats: Schema.Chat[]) => void} ChatsListener  */

/**
 * @type {ChatsListener[]}
 */
const chatsListeners = []

/** @type {Schema.Chat[]} */
export let currentChats = []

export const getCurrChats = () => currentChats

/** @param {Schema.Chat[]} chats */
export const setChats = chats => {
  currentChats = chats
  chatsListeners.forEach(l => l(currentChats))
}

/**
 * @param {ChatsListener} listener
 */
export const onChats = listener => {
  if (chatsListeners.indexOf(listener) > -1) {
    throw new Error('tried to subscribe twice')
  }

  chatsListeners.push(listener)

  listener(currentChats)

  return () => {
    const idx = chatsListeners.indexOf(listener)

    if (idx < 0) {
      throw new Error('tried to unsubscribe twice')
    }

    chatsListeners.splice(idx, 1)
  }
}

/** @typedef {(seedBackup: string|null) => void} SeedBackupListener  */

/** @type {string|null} */
export let currentSeedBackup = null

/**
 * @type {SeedBackupListener[]}
 */
const seedBackupListeners = []

const notifySeedBackupListeners = debounce(() => {
  seedBackupListeners.forEach(l => l(currentSeedBackup))
}, 500)

/**
 * @param {SeedBackupListener} listener
 */
export const onSeedBackup = listener => {
  if (seedBackupListeners.indexOf(listener) > -1) {
    throw new Error('tried to subscribe twice')
  }

  seedBackupListeners.push(listener)

  setImmediate(() => {
    notifySeedBackupListeners()
  })

  return () => {
    const idx = seedBackupListeners.indexOf(listener)

    if (idx < 0) {
      throw new Error('tried to unsubscribe twice')
    }

    seedBackupListeners.splice(idx, 1)
  }
}

export const setupEvents = () => {
  if (!Socket.socket.connected) {
    throw new Error('Should call setupEvents() after socket is connected.')
  }

  Socket.socket.on('connect', () => {
    connectionListeners.forEach(l => {
      l(true)
    })
  })

  Socket.socket.on('disconnect', reason => {
    console.warn('socket disconnected')
    connectionListeners.forEach(l => {
      l(false)
    })

    // @ts-ignore
    if (reason === 'io server disconnect') {
      // https://socket.io/docs/client-api/#Event-%E2%80%98disconnect%E2%80%99
      Socket.socket.connect()
    }
  })

  Socket.socket.on(Event.ON_AVATAR, res => {
    if (res.ok) {
      setAvatar(res.msg)
    }
  })

  Socket.socket.on(Event.ON_CHATS, res => {
    if (res.ok) {
      setChats(res.msg)
    }
  })

  Socket.socket.on(Event.ON_HANDSHAKE_ADDRESS, res => {
    if (res.ok) {
      setHandshakeAddress(res.msg)
    }
  })

  Socket.socket.on(Event.ON_DISPLAY_NAME, res => {
    if (res.ok) {
      setDisplayName(res.msg)
    }
  })

  Socket.socket.on(Event.ON_RECEIVED_REQUESTS, res => {
    if (res.ok) {
      currentReceivedReqs = res.msg
      receivedReqsListeners.forEach(l => l(currentReceivedReqs))
    }
  })

  Socket.socket.on(Event.ON_SENT_REQUESTS, res => {
    if (res.ok) {
      setSentReqs(res.msg)
    }
  })

  Socket.socket.on(Event.ON_ALL_USERS, res => {
    if (res.ok) {
      usersListeners.forEach(l => {
        l(res.msg)
      })
    }
  })

  Socket.socket.on(Event.ON_BIO, res => {
    if (res.ok) {
      currentBio = res.msg
      notifyBioListeners()
    }
  })

  Socket.socket.on(Event.ON_SEED_BACKUP, res => {
    if (res.ok) {
      currentSeedBackup = res.msg
      notifySeedBackupListeners()
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
        Cache.writeStoredAuthData(null)
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
        Cache.writeStoredAuthData(null)
      }
    })
  })

  Socket.socket.on('IS_GUN_AUTH', res => {
    console.warn(`res for IS_GUN_AUTH: ${JSON.stringify(res)}`)
  })

  connectionListeners.forEach(l => {
    l(Socket.socket.connected)
  })

  Cache.getToken().then(token => {
    setInterval(() => {
      Socket.socket.emit('SET_LAST_SEEN_APP', {
        token,
      })
    }, 3000)

    Socket.socket.emit(Event.ON_CHATS, {
      token,
    })

    Socket.socket.emit(Event.ON_SEED_BACKUP, {
      token,
    })

    Socket.socket.emit(Event.ON_RECEIVED_REQUESTS, {
      token,
    })

    Socket.socket.emit(Event.ON_SENT_REQUESTS, {
      token,
    })

    Socket.socket.emit(Event.ON_AVATAR, {
      token,
    })

    Socket.socket.emit(Event.ON_DISPLAY_NAME, {
      token,
    })

    Socket.socket.emit(Event.ON_HANDSHAKE_ADDRESS, {
      token,
    })
  })
}
