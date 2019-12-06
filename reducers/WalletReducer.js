import { ACTIONS } from '../actions/WalletActions'
import Big from 'big.js'
/**
 * @typedef {object} State
 * @param {string} channelBalance
 * @param {string} confirmedBalance
 * @param {string|null} USDRate
 */

/**
 * @typedef {object} Action
 * @param {string} type
 * @param {State} data
 */

/** @type {State} */
const INITIAL_STATE = {
  totalBalance: '0',
  channelBalance: '0',
  confirmedBalance: '0',
  pendingChannelBalance: '0',

  USDRate: null,
}

/**
 * @param {State} state
 * @param {Action} action
 */
const wallet = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ACTIONS.LOAD_WALLET_BALANCE: {
      const {
        channelBalance,
        confirmedBalance,
        pendingChannelBalance,
      } = action.data
      const totalBalance = new Big(confirmedBalance)
        .add(channelBalance)
        .add(pendingChannelBalance)
        .toString()

      return {
        ...state,
        totalBalance,
        channelBalance,
        confirmedBalance,
        pendingChannelBalance,
      }
    }
    case ACTIONS.SET_USD_RATE: {
      const { data } = action

      return {
        ...state,
        USDRate: data,
      }
    }
    default:
      return state
  }
}

export default wallet
