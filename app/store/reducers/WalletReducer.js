/**
 * @typedef {import('../actions').Action} Action
 */

import Big from 'big.js'
/**
 * @typedef {object} State
 * @prop {string} channelBalance
 * @prop {string} confirmedBalance
 * @prop {string|null} USDRate
 * @prop {string} totalBalance
 * @prop {string} pendingChannelBalance
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
    case 'balance/load': {
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
    case 'usdRate/load': {
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
