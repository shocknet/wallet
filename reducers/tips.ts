import produce from 'immer'
import { Reducer } from 'redux'
import { REHYDRATE, RehydrateAction } from 'redux-persist'
import Logger from 'react-native-file-log'
import { Schema } from 'shock-common'

import { Action } from '../app/actions'
import { Tip } from '../app/schema'

type State = Record<string, Tip>

const reducer: Reducer<State, Action | RehydrateAction> = (
  state = {},
  action,
) =>
  produce(state, draft => {
    if (action.type === REHYDRATE) {
      const { err, payload } = action

      if (err) {
        Logger.log(
          `Tips reducer, redux-persist's RehydrateAction err: ${JSON.stringify(
            err,
          )}`,
        )
        return
      }

      if (!Schema.isObj(payload)) {
        Logger.log(
          `Tips reducer, redux-persist's RehydrateAction err: payload not an object instead got: ${typeof payload}`,
        )

        return
      }

      const p = payload as { tips: State }

      if (typeof p.tips !== 'object') {
        Logger.log(
          `Tips reducer, redux-persist's RehydrateAction payload.tips not an object: ${JSON.stringify(
            err,
          )}`,
        )

        return
      }

      Object.assign(draft, p.tips)

      Object.entries(draft).forEach(([k, { state }]) => {
        if (state === 'processing') {
          delete draft[k]
        }
      })
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
