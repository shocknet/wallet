import Logger from 'react-native-file-log'

import * as API from '../../services/contact-api'

export const ACTIONS = {
  LOAD_RECEIVED_REQUESTS:
    /** @type {'requests/received'} */ ('requests/received'),
  LOAD_SENT_REQUESTS: /** @type {'requests/sent'} */ ('requests/sent'),
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
 * @typedef {object} ReceivedRequestsAction
 * @prop {typeof ACTIONS.LOAD_RECEIVED_REQUESTS} type
 * @prop {ReceivedRequest[]} data
 */

/**
 * @typedef {object} SentRequestsAction
 * @prop {typeof ACTIONS.LOAD_SENT_REQUESTS} type
 * @prop {SentRequest[]} data
 */

/**
 * Subscribes to received requests event listener
 * @param {((chats: ReceivedRequest[]) => void)=} callback
 * @returns {import('redux-thunk').ThunkAction<Promise<ReceivedRequest[]>, {}, {}, import('redux').AnyAction>}
 */
export const subscribeReceivedRequests = callback => dispatch =>
  new Promise((resolve, reject) => {
    // TODO: Move to saga
    API.Events.onReceivedRequests(requests => {
      try {
        const received = requests.map(chat => ({
          id: chat.id,
          pk: chat.requestorPK,
          avatar: chat.requestorAvatar,
          displayName: chat.requestorDisplayName,
          // @ts-expect-error TODO
          response: chat.response,
          timestamp: chat.timestamp,
        }))

        /** @type {ReceivedRequestsAction} */
        const receivedRequestsAction = {
          type: ACTIONS.LOAD_RECEIVED_REQUESTS,
          data: received,
        }

        dispatch(receivedRequestsAction)

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
 * @returns {(dispatch: (a: any) => void) => Promise<any>}
 */
export const subscribeSentRequests = callback => async dispatch => {
  try {
    await new Promise((resolve, reject) => {
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

          /** @type {SentRequestsAction} */
          const sentRequestsAction = {
            type: ACTIONS.LOAD_SENT_REQUESTS,
            data: sent,
          }

          dispatch(sentRequestsAction)

          if (callback) {
            callback(sent)
          }

          resolve(sent)
        } catch (err) {
          Logger.log(
            `Error inside subscribeSentRequests thunk listener: ${err.message}`,
          )
          reject(err)
        }
      })
    })
  } catch (e) {
    Logger.log(`Error inside subscribeSentRequests thunk: ${e.message}`)
  }
}

/**
 * Resets the cached sent/received requests
 * @returns {import('redux-thunk').ThunkAction<void, {}, {}, import('redux').AnyAction>}
 */
export const resetRequests = () => dispatch => {
  dispatch({
    type: ACTIONS.RESET_REQUESTS,
  })
}
