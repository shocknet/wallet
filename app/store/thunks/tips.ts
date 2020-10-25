import { ToastAndroid } from 'react-native'
import { Dispatch } from 'redux'
import Logger from 'react-native-file-log'

import { State } from '../reducers'
import * as Wallet from '../../services/wallet'
import { Action, requestedTip, tipWentThrough, tipFailed } from '../actions'

export const tip = (
  amount: number,
  recipientsPublicKey: string,
  memo: string,
) => (dispatch: Dispatch<Action>, getState: () => State) => {
  const {
    tips,
    fees: { absoluteFee, relativeFee },
  } = getState()
  const tipOrUndef = tips[recipientsPublicKey]

  // only one tip process at a time
  if (tipOrUndef && tipOrUndef.state === 'processing') {
    return
  }

  dispatch(requestedTip(amount, recipientsPublicKey, memo))

  const relFeeN = Number(relativeFee)
  const absFeeN = Number(absoluteFee)
  if (!relFeeN || !absFeeN) {
    throw new Error('invalid fees provided')
  }
  const amountN = Number(amount)
  const calculatedFeeLimit = Math.floor(amountN * relFeeN + absFeeN)
  const feeLimit = calculatedFeeLimit > amountN ? amountN : calculatedFeeLimit

  Wallet.tip(amount, recipientsPublicKey, memo, feeLimit)
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
