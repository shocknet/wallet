import { ToastAndroid } from 'react-native'
import Logger from 'react-native-file-log'

import * as Wallet from '../../services/wallet'

export const ACTIONS = {
  LOAD_WALLET_BALANCE: 'balance/load',
  SET_USD_RATE: 'usdRate/load',
}

/**
 * @typedef {object} WalletBalance
 * @prop {string} confirmedBalance
 * @prop {string} pendingChannelBalance
 * @prop {string} channelBalance
 */

/**
 * Fetches the Node's info
 * @returns {import('redux-thunk').ThunkAction<Promise<WalletBalance>, {}, {}, import('redux').AnyAction>}
 */
export const getWalletBalance = () => async dispatch => {
  try {
    const balance = await Wallet.balance()

    const data = {
      confirmedBalance: balance.confirmed_balance,
      pendingChannelBalance: balance.pending_channel_balance,
      channelBalance: balance.channel_balance,
    }

    dispatch({
      type: ACTIONS.LOAD_WALLET_BALANCE,
      data,
    })

    return data
  } catch (e) {
    Logger.log(`Error inside getWalletBalance thunks: ${e.message}`)
    return {
      channelBalance: '0',
      confirmedBalance: '0',
      pendingChannelBalance: '0',
    }
  }
}

/**
 * Fetches the Node's info
 * @returns {import('redux-thunk').ThunkAction<Promise<number>, {}, {}, import('redux').AnyAction>}
 */
export const getUSDRate = () => async dispatch => {
  try {
    const USDRate = await Wallet.USDExchangeRate()

    dispatch({
      type: ACTIONS.SET_USD_RATE,
      data: USDRate,
    })

    return USDRate
  } catch (e) {
    ToastAndroid.show(`Could not get USD rate`, ToastAndroid.LONG)
    Logger.log(`Error inside getUSDRate tip: ${e.message}`)
    return 0
  }
}
