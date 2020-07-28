import { ACTIONS } from '../app/actions/ChatActions'

/**
 * TODO: typings
 * @typedef {object} State
 * @prop {any[]} received
 * @prop {any[]} sent
 * @prop {any} selectedRequest
 */

/**
 * @typedef {object} Action
 * @prop {string} type
 * @prop {State} data
 */

/** @type {State} */
const INITIAL_STATE = {
  received: [],
  sent: [],
  selectedRequest: null,
}

/**
 * @param {State} state
 * @param {Action} action
 */
const request = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ACTIONS.LOAD_CONTACTS: {
      const { data } = action

      return {
        ...state,
        contacts: data,
      }
    }
    case ACTIONS.LOAD_MESSAGES: {
      const { data } = action

      return {
        ...state,
        messages: data,
      }
    }
    case ACTIONS.RESET_CHAT: {
      return INITIAL_STATE
    }
    default:
      return state
  }
}

export default request
