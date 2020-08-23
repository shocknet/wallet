import produce from 'immer'
import { Reducer } from 'redux'
import { REHYDRATE } from 'redux-persist'

import { Action } from '../app/actions'

type State = Record<
  string,
  {
    amount: number
    state: 'processing' | 'wentThrough' | 'err'
    lastErr: string
  }
>

const reducer: Reducer<State, Action> = (state = {}, action) =>
  produce(state, draft => {
    // @ts-expect-error
    if (action.type === REHYDRATE) {
      Object.entries(draft).forEach(([k, { state }]) => {
        if (state === 'processing') {
          delete draft[k]
        }
      })
    }

    if (action.type === 'tips/requestedTip') {
      const { amount, recipientsPublicKey } = action.data

      draft[recipientsPublicKey] = {
        amount,
        state: 'processing',
        lastErr: '',
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
