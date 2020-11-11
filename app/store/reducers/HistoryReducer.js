// @ts-check
import { ACTIONS } from '../actions/HistoryActions'
import * as Wallet from '../../services/wallet'

/**
 * @typedef {Wallet.Invoice | Wallet.Payment | Wallet.Transaction} UnifiedTransaction
 */

/**
 * @typedef {object} State
 * @prop {Wallet.Channel[]} channels
 * @prop {Wallet.pendingChannels[]} pendingChannels
 * @prop {Wallet.Peer[]} peers
 */
// TO DO: typings for data
/**
 * @typedef {import('../../services/wallet').Channel} Channel
 * @typedef {import('../../services/wallet').Peer} Peer
 */
/**
 * @typedef {object} Action
 * @prop {string} type
 * @prop {(object|Channel[]|Peer[])=} data
 */

/** @type {State} */
const INITIAL_STATE = {
  channels: [],
  pendingChannels: [],
  peers: [],
}
/**
 * @param {State} state
 * @param {Action} action
 * @returns {State}
 */
const history = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ACTIONS.LOAD_CHANNELS: {
      const { data } = action
      if (!Array.isArray(data)) {
        return state
      }
      return {
        ...state,
        //@ts-expect-error
        channels: data,
      }
    }
    case ACTIONS.LOAD_PENDING_CHANNELS: {
      const { data } = action
      if (!Array.isArray(data)) {
        return state
      }
      return {
        ...state,
        //@ts-expect-error
        pendingChannels: data,
      }
    }

    case ACTIONS.LOAD_PEERS: {
      const { data } = action
      if (!Array.isArray(data)) {
        return state
      }
      return {
        ...state,
        //@ts-expect-error
        peers: data,
      }
    }

    default:
      return state
  }
}

export default history
