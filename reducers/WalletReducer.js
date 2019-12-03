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
  channelBalance: '0',
  confirmedBalance: '0',
  USDRate: null,
}

/**
 * @param {State} state
 * @param {Action} action
 */
const wallet = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    default:
      return state
  }
}

export default wallet
