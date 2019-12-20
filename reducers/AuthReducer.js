/**
 * @typedef {object} State
 * @param {string} host
 */

/**
 * @typedef {object} Action
 * @param {string} type
 * @param {State} data
 */

/** @type {State} */
const INITIAL_STATE = {
  host: '',
}

/**
 * @param {State} state
 * @param {Action} action
 */
const auth = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    default:
      return state
  }
}

export default auth
