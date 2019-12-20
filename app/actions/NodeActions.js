import Http from 'axios'
import { ThunkAction } from 'redux-thunk' // eslint-disable-line no-unused-vars
import { AnyAction } from 'redux' // eslint-disable-line no-unused-vars

export const ACTIONS = {
  LOAD_NODE_INFO: 'nodeInfo/load',
  LOAD_NODE_HEALTH: 'health/load',
  SET_CONNECTION_STATUS: 'connectionStatus/update',
}

/**
 * Fetches the Node's info
 * @returns {ThunkAction<Promise<void>, {}, {}, AnyAction>}
 */
export const fetchNodeInfo = () => async dispatch => {
  const { data } = await Http.get(`/api/lnd/getinfo`)

  dispatch({
    type: ACTIONS.LOAD_NODE_INFO,
    data,
  })

  return data
}

/**
 * Fetches the Node's Health
 * @returns {ThunkAction<Promise<void>, {}, {}, AnyAction>}
 */
export const fetchNodeHealth = () => async dispatch => {
  const { data } = await Http.get(`/healthz`)

  dispatch({
    type: ACTIONS.LOAD_NODE_HEALTH,
    data,
  })

  return data
}

/**
 * Sets the Node's connection status
 * @param {'online'|'offline'} status
 * @returns {ThunkAction<void, {}, {}, AnyAction>}
 */
export const setConnectionStatus = status => dispatch => {
  dispatch({
    type: ACTIONS.SET_CONNECTION_STATUS,
    data: status,
  })
}
