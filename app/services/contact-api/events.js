/**
 * @format
 */
import debounce from 'lodash/debounce'
import Http from 'axios'

import * as Cache from '../cache'

import Action from './action'
import Event from './event'
import * as Socket from './socket'
// eslint-disable-next-line no-unused-vars
import * as Schema from './schema'

const POLL_INTERVAL = 3500

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

  listener(!!Socket.socket && Socket.socket.connected)

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

/** @type {Set<ReceivedRequestsListener>} */
const receivedReqsListeners = new Set()

/** @type {Schema.SimpleReceivedRequest[]} */
let currentReceivedReqs = []

export const currReceivedReqs = () => currentReceivedReqs

/** @param {Schema.SimpleReceivedRequest[]} reqs */
export const setReceivedReqs = reqs => {
  currentReceivedReqs = reqs
  receivedReqsListeners.forEach(l => l(currReceivedReqs()))
}

let receivedReqsSubbed = false
let lastReceivedReqsUpdate = Date.now() - 1000

const receivedReqsFetcher = () => {
  const thisUpdate = Date.now()
  lastReceivedReqsUpdate = thisUpdate

  Http.get(`/api/gun/${Event.ON_RECEIVED_REQUESTS}`).then(res => {
    if (lastReceivedReqsUpdate !== thisUpdate) {
      return
    }

    if (res.status === 200) {
      console.warn(
        `Received reqs through poll: ${JSON.stringify(res.data.data)}`,
      )
      setReceivedReqs(res.data.data)
    } else {
      console.warn(`Error in sent reqs Poll: ${res.data.errorMessage}`)
    }
  })
}

/**
 * @param {ReceivedRequestsListener} listener
 * @returns {() => void}
 */
export const onReceivedRequests = listener => {
  if (!receivedReqsListeners.add(listener)) {
    throw new Error('Tried to subscribe twice')
  }

  listener(currentReceivedReqs)

  if (!receivedReqsSubbed) {
    receivedReqsSubbed = true
    setInterval(receivedReqsFetcher, POLL_INTERVAL)
  }

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

let sentReqsSubbed = false
let lastSentReqsUpdate = Date.now() - 1000

const sentReqsFetcher = () => {
  const thisUpdate = Date.now()
  lastSentReqsUpdate = thisUpdate

  Http.get(`/api/gun/${Event.ON_SENT_REQUESTS}`).then(res => {
    if (lastSentReqsUpdate !== thisUpdate) {
      return
    }

    if (res.status === 200) {
      console.warn(`Sent reqs through poll: ${JSON.stringify(res.data.data)}`)
      setSentReqs(res.data.data)
    } else {
      console.warn(`Error in sent reqs Poll: ${res.data.errorMessage}`)
    }
  })
}

/**
 * @param {SentRequestsListener} listener
 */
export const onSentRequests = listener => {
  if (!sentReqsListeners.add(listener)) {
    throw new Error('Tried to subscribe twice')
  }

  listener(currSentReqs)

  if (!sentReqsSubbed) {
    sentReqsSubbed = true
    setInterval(sentReqsFetcher, POLL_INTERVAL)
  }

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
    if (!Socket.socket || !(Socket.socket && Socket.socket.connected)) {
      throw new Error('NOT_CONNECTED')
    }
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
    if (!Socket.socket || !(Socket.socket && Socket.socket.connected)) {
      throw new Error('NOT_CONNECTED')
    }
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

let chatsSubbed = false
let lastChatUpdate = Date.now() - 1000

const chatsFetcher = () => {
  const thisUpdate = Date.now()
  lastChatUpdate = thisUpdate

  Http.get(`/api/gun/${Event.ON_CHATS}`).then(res => {
    if (lastChatUpdate !== thisUpdate) {
      return
    }

    if (res.status === 200) {
      console.warn(`Chats through poll: ${JSON.stringify(res.data.data)}`)
      setChats(res.data.data)
    } else {
      console.warn(`Error in Chats Poll: ${res.data.errorMessage}`)
    }
  })
}

/**
 * @param {ChatsListener} listener
 */
export const onChats = listener => {
  if (chatsListeners.indexOf(listener) > -1) {
    throw new Error('tried to subscribe twice')
  }

  if (!chatsSubbed) {
    chatsSubbed = true
    setInterval(chatsFetcher, POLL_INTERVAL)
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
  const theSocket = Socket.socket
  if (!theSocket) {
    console.warn('Called setupEvents() before creating the socket')
    return
  }
  if (!theSocket.connected) {
    console.warn('Should call setupEvents() after socket is connected.')
  }

  theSocket.on('connect', () => {
    connectionListeners.forEach(l => {
      l(true)
    })
  })

  theSocket.on('disconnect', reason => {
    console.warn('socket disconnected')
    connectionListeners.forEach(l => {
      l(false)
    })

    // @ts-ignore
    if (reason === 'io server disconnect') {
      // https://socket.io/docs/client-api/#Event-%E2%80%98disconnect%E2%80%99
    }
  })

  theSocket.on(Event.ON_AVATAR, res => {
    if (res.ok) {
      setAvatar(res.msg)
    }
  })

  theSocket.on(Event.ON_HANDSHAKE_ADDRESS, res => {
    if (res.ok) {
      setHandshakeAddress(res.msg)
    }
  })

  theSocket.on(Event.ON_DISPLAY_NAME, res => {
    if (res.ok) {
      setDisplayName(res.msg)
    }
  })

  theSocket.on(Event.ON_ALL_USERS, res => {
    if (res.ok) {
      usersListeners.forEach(l => {
        l(res.msg)
      })
    }
  })

  theSocket.on(Event.ON_BIO, res => {
    if (res.ok) {
      currentBio = res.msg
      notifyBioListeners()
    }
  })

  theSocket.on(Event.ON_SEED_BACKUP, res => {
    if (res.ok) {
      currentSeedBackup = res.msg
      notifySeedBackupListeners()
    }
  })

  // If when receiving a token expired response on response to any data event
  // notify auth listeners that the token expired.
  Object.values(Event).forEach(e => {
    theSocket.on(e, res => {
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
    theSocket.on(a, res => {
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

  theSocket.on('IS_GUN_AUTH', res => {
    console.warn(`res for IS_GUN_AUTH: ${JSON.stringify(res)}`)
  })

  connectionListeners.forEach(l => {
    l(theSocket.connected)
  })

  Cache.getToken().then(token => {
    setInterval(() => {
      theSocket.emit(Action.SET_LAST_SEEN_APP, {
        token,
      })
    }, 3000)

    theSocket.emit(Event.ON_CHATS, {
      token,
    })

    theSocket.emit(Event.ON_SEED_BACKUP, {
      token,
    })

    theSocket.emit(Event.ON_RECEIVED_REQUESTS, {
      token,
    })

    theSocket.emit(Event.ON_SENT_REQUESTS, {
      token,
    })

    theSocket.emit(Event.ON_AVATAR, {
      token,
    })

    theSocket.emit(Event.ON_DISPLAY_NAME, {
      token,
    })

    theSocket.emit(Event.ON_HANDSHAKE_ADDRESS, {
      token,
    })
  })
}
