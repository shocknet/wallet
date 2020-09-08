import { ACTIONS } from '../app/actions/FeesActions'
/**
 * @typedef {import('../app/actions/FeesActions').feeLevel} feeLevel
 * @typedef {import('../app/actions/FeesActions').feeSource} feeSource
 */
/**
 * @typedef {object} State
 * @prop {feeLevel} feesLevel
 * @prop {feeSource} feesSource
 * @prop {string} absoluteFee
 * @prop {string} relativeFee
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
  absoluteFee:'10',
  relativeFee:'0.006'
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
    case ACTIONS.UPDATE_ROUTING_FEE_ABSOLUTE:{
      const {data} = action
      return {
        ...state,
        absoluteFee:data
      }
    }
    case ACTIONS.UPDATE_ROUTING_FEE_RELATIVE:{
      const {data} = action
      return {
        ...state,
        relativeFee:data
      }
    }
    default: {
      return state
    }
  }
}

export default fees
