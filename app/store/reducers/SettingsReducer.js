import { ACTIONS } from '../actions/SettingsActions'
/**
 * @typedef {object} State
 * @prop {boolean} notifyDisconnect
 * @prop {number} notifyDisconnectAfterSeconds
 */

/**
 * @typedef {object} Action
 * @prop {string} type
 * @prop {(boolean|number)=} data
 */

/** @type {State} */
const INITIAL_STATE = {
  notifyDisconnect: false,
  notifyDisconnectAfterSeconds: 10,
}
/**
 * @param {State} state
 * @param {Action} action
 * @returns {State}
 */
const settings = (state = INITIAL_STATE, action) => {
  if (!action.data) {
    return state
  }
  switch (action.type) {
    case ACTIONS.UPDATE_NOTIFY_DISCONNECT: {
      const { data } = action
      if (typeof data !== 'boolean') {
        return state
      }
      return {
        ...state,
        notifyDisconnect: data,
      }
    }
    case ACTIONS.UPDATE_NOTIFY_DISCONNECT_AFTER: {
      const { data } = action
      if (typeof data !== 'number') {
        return state
      }
      return {
        ...state,
        notifyDisconnectAfterSeconds: data,
      }
    }
    default: {
      return state
    }
  }
}

export default settings
