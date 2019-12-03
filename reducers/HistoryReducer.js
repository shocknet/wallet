/**
 * @typedef {object} State
 * @param {Array} channels
 * @param {object} invoices
 * @param {Array} peers
 * @param {object} transactions
 */

/**
 * @typedef {object} Action
 * @param {string} type
 * @param {State} data
 */

/** @type {State} */
const INITIAL_STATE = {
  channels: [],
  invoices: {
    content: [],
    page: 0,
    totalPages: 0,
    totalItems: 0,
  },
  peers: [],
  transactions: {
    content: [],
    page: 0,
    totalPages: 0,
    totalItems: 0,
  },
}
/**
 * @param {State} state
 * @param {Action} action
 */
const history = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    default:
      return state
  }
}

export default history
