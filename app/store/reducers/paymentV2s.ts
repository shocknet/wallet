import { Schema } from 'shock-common'
import produce from 'immer'
import { Reducer } from 'redux'

import { Action } from '../actions'

type State = Record<string, Schema.PaymentV2> & {
  $$__LATEST__PERFORMED: string[]
}

const INITIAL_STATE = ({ $$__LATEST__PERFORMED: [] } as unknown) as State

const reducer: Reducer<State, Action> = (state = INITIAL_STATE, action) =>
  produce(state, draft => {
    switch (action.type) {
      case 'tips/tipWentThrough':
        const { paymentV2 } = action.data

        draft[paymentV2.payment_hash] = paymentV2
        break

      case 'payments/receivedOwn':
        const { originRequest, payments } = action.data

        const mostRecentToLeast = payments.slice().sort((p1, p2) => {
          // If settled, use the settle date for sorting, else use creation date.
          // settle_date will be 0 if not settled
          const date1 = Number(p1.creation_date)
          const date2 = Number(p2.creation_date)

          return date2 - date1
        })

        const isLatest =
          originRequest.reversed && originRequest.max_payments === 50

        if (isLatest) draft.$$__LATEST__PERFORMED = []

        for (const payment of mostRecentToLeast) {
          draft[payment.payment_hash] = payment
          if (isLatest) draft.$$__LATEST__PERFORMED.push(payment.payment_hash)
        }
        break
    }
  })

export default reducer
