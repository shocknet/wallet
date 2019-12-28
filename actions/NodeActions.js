import Http from 'axios'

export const ACTIONS = {
  LOAD_NODE_INFO: 'nodeInfo/load',
  LOAD_NODE_HEALTH: 'health/load',
  SET_CONNECTION_STATUS: 'connectionStatus/update',
}

/**
 * Fetches the Node's info
 * @returns {import('redux-thunk').ThunkAction<Promise<void>, {}, {}, import('redux').AnyAction>}
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
 * @returns {import('redux-thunk').ThunkAction<Promise<void>, {}, {}, import('redux').AnyAction>}
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
 * @returns {import('redux-thunk').ThunkAction<void, {}, {}, import('redux').AnyAction>}
 */
export const setConnectionStatus = status => dispatch => {
  dispatch({
    type: ACTIONS.SET_CONNECTION_STATUS,
    data: status,
  })
}
