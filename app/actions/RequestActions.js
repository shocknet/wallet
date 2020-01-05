import * as API from '../services/contact-api'

export const ACTIONS = {
  LOAD_RECEIVED_REQUESTS: 'requests/received',
  LOAD_SENT_REQUESTS: 'requests/sent',
  RESET_REQUESTS: 'requests/reset',
}

/**
 * @typedef {object} ReceivedRequest
 * @prop {string} id
 * @prop {string} pk
 * @prop {string | null} avatar
 * @prop {string | null} displayName
 * @prop {string} response
 * @prop {number} timestamp
 */

/**
 * @typedef {object} SentRequest
 * @prop {string} id
 * @prop {string} pk
 * @prop {string | null} avatar
 * @prop {string | null} displayName
 * @prop {boolean} changedRequestAddress
 * @prop {number} timestamp
 */

/**
 * Subscribes to received requests event listener
 * @param {((chats: ReceivedRequest[]) => void)=} callback
 * @returns {import('redux-thunk').ThunkAction<Promise<ReceivedRequest[]>, {}, {}, import('redux').AnyAction>}
 */
export const subscribeReceivedRequests = callback => dispatch =>
  new Promise((resolve, reject) => {
    API.Events.onReceivedRequests(requests => {
      try {
        const received = requests.map(chat => ({
          id: chat.id,
          pk: chat.requestorPK,
          avatar: chat.requestorAvatar,
          displayName: chat.requestorDisplayName,
          response: chat.response,
          timestamp: chat.timestamp,
        }))

        dispatch({
          type: ACTIONS.LOAD_RECEIVED_REQUESTS,
          data: received,
        })

        if (callback) {
          callback(received)
        }

        resolve(received)
      } catch (err) {
        reject(err)
      }
    })
  })

/**
 * Subscribes to sent requests event listener
 * @param {((chats: SentRequest[]) => void)=} callback
 * @returns {import('redux-thunk').ThunkAction<Promise<SentRequest[]>, {}, {}, import('redux').AnyAction>}
 */
export const subscribeSentRequests = callback => dispatch =>
  new Promise((resolve, reject) => {
    API.Events.onSentRequests(requests => {
      try {
        const sent = requests.map(chat => ({
          id: chat.id,
          pk: chat.recipientPublicKey,
          avatar: chat.recipientAvatar,
          displayName: chat.recipientDisplayName,
          changedRequestAddress: chat.recipientChangedRequestAddress,
          timestamp: chat.timestamp,
        }))

        dispatch({
          type: ACTIONS.LOAD_SENT_REQUESTS,
          data: sent,
        })

        if (callback) {
          callback(sent)
        }

        resolve(sent)
      } catch (err) {
        reject(err)
      }
    })
  })

/**
 * Resets the cached sent/received requests
 * @returns {import('redux-thunk').ThunkAction<void, {}, {}, import('redux').AnyAction>}
 */
export const resetRequests = () => dispatch => {
  dispatch({
    type: ACTIONS.RESET_REQUESTS,
  })
}
