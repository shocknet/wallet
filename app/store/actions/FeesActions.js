import Logger from 'react-native-file-log'

export const ACTIONS = {
  UPDATE_SELECTED_FEE: 'fees/updateSelected',
  UPDATE_FEES_SOURCE: 'fees/updateSource',
  UPDATE_ROUTING_FEE_ABSOLUTE: 'fees/ln/absolute',
  UPDATE_ROUTING_FEE_RELATIVE: 'fees/ln/relative',
}
/**
 *
 * @typedef {'MAX'|'MID'|'MIN'} feeLevel
 * @typedef {string} feeSource
 */
/**
 * @param {feeLevel} feesLevel
 * @returns {import('redux-thunk').ThunkAction<feeLevel, {}, {}, import('redux').AnyAction>}
 */
export const updateSelectedFee = feesLevel => dispatch => {
  Logger.log('updating selected fee')
  dispatch({
    type: ACTIONS.UPDATE_SELECTED_FEE,
    data: feesLevel,
  })
  return feesLevel
}
/**
 * @param {feeSource} feesSource
 * @returns {import('redux-thunk').ThunkAction<feeSource, {}, {}, import('redux').AnyAction>}
 */
export const updateFeesSource = feesSource => dispatch => {
  Logger.log('updating selected fee source')
  dispatch({
    type: ACTIONS.UPDATE_FEES_SOURCE,
    data: feesSource,
  })
  return feesSource
}
/**
 * @param {string} fee
 * @returns {import('redux-thunk').ThunkAction<string, {}, {}, import('redux').AnyAction>}
 */
export const updateRoutingFeeAbsolute = fee => dispatch => {
  Logger.log('updating selected fee source')
  dispatch({
    type: ACTIONS.UPDATE_ROUTING_FEE_ABSOLUTE,
    data: fee,
  })
  return fee
}
/**
 * @param {string} fee
 * @returns {import('redux-thunk').ThunkAction<string, {}, {}, import('redux').AnyAction>}
 */
export const updateRoutingFeeRelative = fee => dispatch => {
  Logger.log('updating selected fee source')
  dispatch({
    type: ACTIONS.UPDATE_ROUTING_FEE_RELATIVE,
    data: fee,
  })
  return fee
}
