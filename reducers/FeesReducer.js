import { ACTIONS } from '../app/actions/FeesActions'
/**
 * @typedef {import('../app/actions/FeesActions').feeLevel} feeLevel
 * @typedef {import('../app/actions/FeesActions').feeSource} feeSource
 */
/**
 * @typedef {object} State
 * @prop {feeLevel} feesLevel
 * @prop {feeSource} feesSource
 */

/**
 * @typedef {object} Action
 * @prop {string} type
 * @prop {(string)=} data
 */

/** @type {State} */
const INITIAL_STATE = {
  feesLevel: 'MID',
  feesSource: 'https://mempool.space/api/v1/fees/recommended',
}
/**
 * @param {State} state
 * @param {Action} action
 * @returns {State}
 */
const fees = (state = INITIAL_STATE, action) => {
  if (!action.data) {
    return state
  }
  switch (action.type) {
    case ACTIONS.UPDATE_SELECTED_FEE: {
      const { data } = action
      if (data !== 'MIN' && data !== 'MID' && data !== 'MAX') {
        return state
      }
      return {
        ...state,
        feesLevel: data,
      }
    }
    case ACTIONS.UPDATE_FEES_SOURCE: {
      const { data } = action
      return {
        ...state,
        feesSource: data,
      }
    }
    default: {
      return state
    }
  }
}

export default fees
