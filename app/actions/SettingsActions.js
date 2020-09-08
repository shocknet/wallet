import Logger from 'react-native-file-log'

export const ACTIONS = {
  UPDATE_NOTIFY_DISCONNECT: 'settings/disconnect',
  UPDATE_NOTIFY_DISCONNECT_AFTER: 'settings/after',
}
/**
 * @param {boolean} notify
 * @returns {import('redux-thunk').ThunkAction<boolean, {}, {}, import('redux').AnyAction>}
 */
export const updateNotifyDisconnect = notify => dispatch => {
  Logger.log('updating selected fee')
  dispatch({
    type: ACTIONS.UPDATE_NOTIFY_DISCONNECT,
    data: notify,
  })
  return notify
}
/**
 * @param {number} seconds
 * @returns {import('redux-thunk').ThunkAction<number, {}, {}, import('redux').AnyAction>}
 */
export const updateNotifyDisconnectAfter = seconds => dispatch => {
  Logger.log('updating selected fee source')
  dispatch({
    type: ACTIONS.UPDATE_NOTIFY_DISCONNECT_AFTER,
    data: seconds,
  })
  return seconds
}
