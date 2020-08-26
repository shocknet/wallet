import { Schema } from 'shock-common'
import produce from 'immer'
import { Reducer } from 'redux'

import { Action } from '../app/actions'

type State = Record<string, Schema.PaymentV2>

const INITIAL_STATE = {} as State

const reducer: Reducer<State, Action> = (state = INITIAL_STATE, action) =>
  produce(state, draft => {
    switch (action.type) {
      case 'tips/tipWentThrough':
        const { paymentV2 } = action.data

        draft[paymentV2.payment_hash] = paymentV2
    }
  })

export default reducer
