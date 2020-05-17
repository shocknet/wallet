// @ts-nocheck
/**
 * @typedef {object} State
 * @prop {string} host
 */

/**
 * @typedef {object} Action
 * @prop {string} type
 * @prop {State} data
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
