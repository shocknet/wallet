// @ts-check
import Logger from 'react-native-file-log'

import * as Wallet from '../../services/wallet'

export const ACTIONS = {
  LOAD_CHANNELS: 'channels/load',
  LOAD_PENDING_CHANNELS: 'channels/pending/load',
  LOAD_PEERS: 'peers/load',
}
/**
 * Fetches the Node's info
 * @returns {import('redux-thunk').ThunkAction<Promise<Wallet.Channel[]>, {}, {}, import('redux').AnyAction>}
 */
export const fetchChannels = () => async dispatch => {
  try {
    const data = await Wallet.listChannels()
    dispatch({
      type: ACTIONS.LOAD_CHANNELS,
      data,
    })

    return data
  } catch (e) {
    Logger.log(`Error inside fetchChannels thunk: ${e.message}`)
    return []
  }
}
/**
 * Fetches the Node's info
 * @returns {import('redux-thunk').ThunkAction<Promise<Wallet.PendingChannel[]>, {}, {}, import('redux').AnyAction>}
 */
export const fetchPendingChannels = () => async dispatch => {
  try {
    const data = await Wallet.pendingChannels()
    dispatch({
      type: ACTIONS.LOAD_PENDING_CHANNELS,
      data,
    })

    return data
  } catch (e) {
    Logger.log(`Error inside fetchPendingChannels thunk: ${e.message}`)
    return []
  }
}

/**
 * Fetches the Node's info
 * @returns {import('redux-thunk').ThunkAction<Promise<Wallet.Peer[]>, {}, {}, import('redux').AnyAction>}
 */
export const fetchPeers = () => async dispatch => {
  try {
    const data = await Wallet.listPeers()

    dispatch({
      type: ACTIONS.LOAD_PEERS,
      data,
    })

    return data
  } catch (e) {
    Logger.log(`Error inside fetchPeers thunk: ${e.message}`)
    return []
  }
}

/**
 * Fetches the Node's info
 * @returns {import('redux-thunk').ThunkAction<Promise<[
 *   Wallet.Peer[],
 *   Wallet.Channel[],
 * ]>, {}, {}, import('redux').AnyAction>}
 */
export const fetchHistory = () => async dispatch => {
  try {
    const history = await Promise.all([
      dispatch(fetchPeers()),
      dispatch(fetchChannels()),
    ])

    return history
  } catch (e) {
    Logger.log(`Error inside fetchHistory thunk: ${e.message}`)

    return [[], []]
  }
}
