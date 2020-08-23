import { ToastAndroid } from 'react-native'
import { Dispatch } from 'redux'
import Logger from 'react-native-file-log'

import * as Wallet from '../services/wallet'
import { Action, requestedTip, tipWentThrough, tipFailed } from '../actions'

export const tip = async (
  amount: number,
  recipientsPublicKey: string,
  memo: string,
) => (dispatch: Dispatch<Action>) => {
  dispatch(requestedTip(amount, recipientsPublicKey, memo))

  Wallet.tip(amount, recipientsPublicKey, memo, 0)
    .then(paymentV2 => {
      dispatch(tipWentThrough(recipientsPublicKey, paymentV2))
    })
    .catch((e: { message: string }) => {
      const msg = `Couldn't tip: ${e.message}`
      Logger.log(msg)
      ToastAndroid.show(msg, ToastAndroid.LONG)
      dispatch(tipFailed(recipientsPublicKey, msg))
    })
}
