import Logger from 'react-native-file-log'

export const ACTIONS = {
  UPDATE_SELECTED_FEE: 'fees/updateSelected',
  UPDATE_FEES_SOURCE: 'fees/updateSource',
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
  Logger.log('updating selected fee')
  dispatch({
    type: ACTIONS.UPDATE_FEES_SOURCE,
    data: feesSource,
  })
  return feesSource
}
