import { ACTIONS } from '../app/actions/NodeActions'

/**
 * @typedef {object} State
 * @prop {object} nodeInfo
 * @prop {object} nodeHealth
 * @prop {'online'|'offline'} connectionStatus
 */

// TO DO: typings for data
/**
 * @typedef {object} Action
 * @prop {string} type
 * @prop {(object|any[])=} data
 */

/** @type {State} */
const INITIAL_STATE = {
  nodeInfo: null,
  nodeHealth: null,
  connectionStatus: 'online',
}

/**
 * @param {State} state
 * @param {Action} action
 * @returns {State}
 */
const node = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ACTIONS.LOAD_NODE_INFO: {
      const { data } = action
      return {
        ...state,
        nodeInfo: data,
      }
    }
    case ACTIONS.LOAD_NODE_HEALTH: {
      const { data } = action
      return {
        ...state,
        nodeHealth: data,
      }
    }
    case ACTIONS.SET_CONNECTION_STATUS: {
      const { data } = action
      return {
        ...state,
        connectionStatus: data,
      }
    }
    default:
      return state
  }
}

export default node
