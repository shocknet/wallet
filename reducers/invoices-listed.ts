import produce from 'immer'
import { Reducer } from 'redux'
import { RehydrateAction } from 'redux-persist'
import { Schema } from 'shock-common'

// https://medium.com/@dcousineau/advanced-redux-entity-normalization-f5f1fe2aefc5

import { Action } from '../app/actions'

interface State {
  /**
   * Keys are the encoded version of the invoice.
   */
  byId: Record<string, Schema.InvoiceWhenListed>

  /**
   * Most recent to least recent.
   */
  ids: string[]

  latestSettled: string[]
}

const INITIAL_STATE: State = {
  byId: {},
  ids: [],
  latestSettled: [],
}

const reducer: Reducer<State, Action | RehydrateAction> = (
  state = INITIAL_STATE,
  action,
) =>
  produce(state, draft => {
    if (action.type === 'invoices/receivedSingle') {
      const { invoice } = action.payload
      draft.byId[invoice.payment_request] = invoice

      if (invoice.settled) {
        const existingSettled = [
          ...draft.latestSettled.map(payReq => draft.byId[payReq]),
          invoice,
        ]

        existingSettled.sort(
          (i1, i2) => Number(i2.settle_date) - Number(i1.settle_date),
        )

        draft.latestSettled = existingSettled.map(i => i.payment_request)
      }
    }

    if (action.type === 'invoices/receivedOwn') {
      const { invoices, originRequest } = action.data

      // They come in no good order.
      const mostRecentToLeast = invoices.slice().sort((i1, i2) => {
        // If settled, use the settle date for sorting, else use creation date.
        // settle_date will be 0 if not settled
        const date1 = Number(i1.settle_date) || Number(i1.creation_date)
        const date2 = Number(i2.settle_date) || Number(i2.creation_date)

        return date2 - date1
      })

      for (const invoice of mostRecentToLeast) {
        draft.byId[invoice.payment_request] = invoice
        // draft.ids._
      }

      const fromBeginning =
        typeof originRequest.index_offset === 'undefined' ||
        originRequest.index_offset === 0

      const isLatestInvoices =
        !!originRequest.reversed && fromBeginning && !originRequest.pending_only

      if (isLatestInvoices) {
        draft.ids = mostRecentToLeast.map(i => i.payment_request)

        draft.latestSettled = mostRecentToLeast
          .filter(i => i.settled)
          .map(i => i.payment_request)
      }
    }
  })

export default reducer
