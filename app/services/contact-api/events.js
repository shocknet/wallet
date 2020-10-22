import Http from 'axios'
import Logger from 'react-native-file-log'
import { isEqual } from 'lodash'
import { Constants, Schema } from 'shock-common'

import * as Cache from '../cache'
import * as Store from '../../../store'
import * as Actions from '../../actions'

// eslint-disable-next-line no-unused-vars

const { Event } = Constants

const POLL_INTERVAL = 3500

/**
 * @returns {Promise<boolean>}
 */
const isAuth = async () => {
  const nodeURL = await Cache.getNodeURL()
  if (!nodeURL) {
    return false
  }
  const storedAuthData = await Cache.getStoredAuthData()
  return storedAuthData !== null
}

////////////////////////////////////////////////////////////////////////////////
// DATA EVENTS /////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/** @typedef {(receivedRequests: Schema.SimpleReceivedRequest[]) => void} ReceivedRequestsListener */

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

const receivedReqsFetcher = async () => {
  if (!(await isAuth())) {
    setTimeout(receivedReqsFetcher, POLL_INTERVAL)
    return
  }

  Http.get(`/api/gun/${Event.ON_RECEIVED_REQUESTS}`)
    .then(res => {
      if (res.status === 200) {
        setReceivedReqs(res.data.data)
      } else {
        throw new Error(
          res.data.errorMessage || res.data.message || JSON.stringify(res.data),
        )
      }

      setTimeout(receivedReqsFetcher, POLL_INTERVAL)
    })
    .catch(e => {
      Logger.log(`Error in sent reqs Poll:  ${e.message || 'Unknown error'}`)
      setTimeout(receivedReqsFetcher, POLL_INTERVAL)
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
    receivedReqsFetcher()
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

const sentReqsFetcher = async () => {
  if (!(await isAuth())) {
    setTimeout(sentReqsFetcher, POLL_INTERVAL)
    return
  }

  Http.get(`/api/gun/${Event.ON_SENT_REQUESTS}`)
    .then(res => {
      if (res.status === 200) {
        setSentReqs(res.data.data)
      } else {
        throw new Error(
          res.data.errorMessage || res.data.message || JSON.stringify(res.data),
        )
      }

      setTimeout(sentReqsFetcher, POLL_INTERVAL)
    })
    .catch(e => {
      Logger.log(`Error in sent reqs Poll:  ${e.message || 'Unknown error'}`)
      setTimeout(sentReqsFetcher, POLL_INTERVAL)
    })
}

let sentReqsSubbed = false

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
    sentReqsFetcher()
  }

  return () => {
    if (!sentReqsListeners.delete(listener)) {
      throw new Error('Tried to unsubscribe twice')
    }
  }
}

////////////////////////////////////////////////////////////////////////////////

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
  if (isEqual(currentChats, chats)) {
    return
  }

  currentChats = chats
  chatsListeners.forEach(l => l(currentChats))
}

const chatsFetcher = async () => {
  if (!(await isAuth())) {
    setTimeout(chatsFetcher, POLL_INTERVAL)
    return
  }

  Http.get(`/api/gun/${Event.ON_CHATS}`)
    .then(res => {
      if (res.status === 200) {
        setChats(res.data.data)
      } else {
        throw new Error(res.data.errorMessage)
      }

      setTimeout(chatsFetcher, POLL_INTERVAL)
    })
    .catch(e => {
      Logger.log(`Error in Chats Poll:  ${e.message || 'Unknown error'}`)
      setTimeout(chatsFetcher, POLL_INTERVAL)
    })
}

let chatsSubbed = false

/**
 * @param {ChatsListener} listener
 */
export const onChats = listener => {
  if (chatsListeners.indexOf(listener) > -1) {
    throw new Error('tried to subscribe twice')
  }

  if (!chatsSubbed) {
    chatsSubbed = true
    chatsFetcher()
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

export const setupEvents = async () => {
  // TODO: Setup or replace seed backup event
  const store = Store.getStore()

  onChats(() => {})()
  onSentRequests(() => {})()
  onReceivedRequests(() => {})()

  // @ts-ignore
  store.dispatch(Actions.ChatActions.subscribeOnChats())
  // @ts-ignore
  store.dispatch(Actions.RequestActions.subscribeReceivedRequests())
  // @ts-ignore
  store.dispatch(Actions.RequestActions.subscribeSentRequests())

  const ad = await Cache.getStoredAuthData()

  if (ad) {
    store.dispatch(
      Actions.Me.receivedMeData({
        publicKey: ad.authData.publicKey,
      }),
    )
  }
}
