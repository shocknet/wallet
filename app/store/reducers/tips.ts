import produce from 'immer'
import { Reducer } from 'redux'

import { Action } from '../actions'
import { Tip } from '../../schema'

type State = Record<string, Tip>

const reducer: Reducer<State, Action> = (state = {}, action) =>
  produce(state, draft => {
    // Soft restarts trigger payments refresh but not redux-persist's
    // rehydration. Which results in duplicate tips showing up (once as a Tip
    // once as a PaymentV2).
    if (action.type === 'payments/refreshForced') {
      for (const [pk, tip] of Object.entries(draft)) {
        if (tip.state === 'wentThrough') {
          delete draft[pk]
        }
      }
    }

    if (action.type === 'tips/requestedTip') {
      const { amount, recipientsPublicKey, memo } = action.data

      draft[recipientsPublicKey] = {
        amount,
        state: 'processing',
        lastErr: '',
        lastMemo: memo,
      }
    }

    if (action.type === 'tips/tipFailed') {
      const { recipientsPublicKey, message } = action.data

      const tip = draft[recipientsPublicKey]

      tip.state = 'err'
      tip.lastErr = message
    }

    if (action.type === 'tips/tipWentThrough') {
      const { recipientsPublicKey } = action.data

      draft[recipientsPublicKey].state = 'wentThrough'
    }
  })

export default reducer
