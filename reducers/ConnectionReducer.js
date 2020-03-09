// @ts-ignore
import uuid from 'uuid/v4'
import { ACTIONS } from '../app/actions/ConnectionActions'

/**
 * @typedef {object} State
 * @prop {string?} devicePublicKey
 * @prop {string?} APIPublicKey
 * @prop {string?} sessionId
 * @prop {string} deviceId
 * @prop {boolean} socketConnected
 */

// TO DO: typings for data
/**
 * @typedef {object} Action
 * @prop {string} type
 * @prop {(object|any[])=} data
 */

/** @type {State} */
const INITIAL_STATE = {
  devicePublicKey: null,
  APIPublicKey: null,
  sessionId: null,
  deviceId: uuid(),
  socketConnected: false,
}

/**
 * @param {State} state
 * @param {Action} action
 * @returns {State}
 */
const connection = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ACTIONS.LOAD_NEW_KEYS: {
      const { devicePublicKey, APIPublicKey, sessionId } = action.data
      return {
        ...state,
        devicePublicKey,
        sessionId,
        APIPublicKey,
      }
    }
    case ACTIONS.SOCKET_DID_CONNECT: {
      return {
        ...state,
        socketConnected: true,
      }
    }
    case ACTIONS.SOCKET_DID_DISCONNECT: {
      return {
        ...state,
        socketConnected: false,
      }
    }
    default:
      return state
  }
}

export default connection
