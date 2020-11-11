export const ACTIONS = {
  LOAD_RECEIVED_REQUESTS:
    /** @type {'requests/received'} */ ('requests/received'),
  LOAD_SENT_REQUESTS: /** @type {'requests/sent'} */ ('requests/sent'),
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
