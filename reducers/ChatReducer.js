import { ACTIONS } from '../app/actions/ChatActions'

/**
 * @typedef {object} State
 * @param {import('../app/actions/ChatActions').Contact[]} contacts
 * @param {object} messages
 * @param {import('../app/actions/ChatActions').SelectedContact} selectedContact
 */

/**
 * @typedef {object} Action
 * @param {string} type
 * @param {State} data
 */

/** @type {State} */
const INITIAL_STATE = {
  contacts: [],
  messages: {},
  selectedContact: null,
}

/**
 * @param {State} state
 * @param {Action} action
 */
const chat = (state = INITIAL_STATE, action) => {
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
    case ACTIONS.SELECT_CONTACT: {
      const { data } = action

      return {
        ...state,
        selectedContact: data,
      }
    }
    case ACTIONS.RESET_SELECTED_CONTACT: {
      return {
        ...state,
        selectedContact: null,
      }
    }
    case ACTIONS.RESET_CHAT: {
      return INITIAL_STATE
    }
    default:
      return state
  }
}

export default chat
