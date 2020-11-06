import uuid from 'uuid/v4'
import { Action } from '../actions'

/**
 * @typedef {object} State
 * @prop {string?} devicePublicKey
 * @prop {string?} APIPublicKey
 * @prop {string?} sessionId
 * @prop {string} deviceId
 * @prop {number} lastPing
 */

// TO DO: typings for data

/** @type {State} */
const INITIAL_STATE = {
  devicePublicKey: null,
  APIPublicKey: null,
  sessionId: null,
  deviceId: uuid(),
  lastPing: 0,
}

/**
 * @param {State} state
 * @param {Action} action
 * @returns {State}
 */
const connection = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'encryption/loadKeys': {
      const { devicePublicKey, APIPublicKey, sessionId } = action.data
      return {
        ...state,
        devicePublicKey: devicePublicKey || null,
        sessionId,
        APIPublicKey,
      }
    }
    case 'socket/ping': {
      return {
        ...state,
        lastPing: action.data.timestamp,
      }
    }
    default:
      return state
  }
}

export default connection
