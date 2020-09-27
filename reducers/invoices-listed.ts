import produce from 'immer'
import { Reducer } from 'redux'
import { REHYDRATE, RehydrateAction } from 'redux-persist'
import Logger from 'react-native-file-log'
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
}

const INITIAL_STATE: State = {
  byId: {},
  ids: [],
}

const reducer: Reducer<State, Action | RehydrateAction> = (
  state = INITIAL_STATE,
  action,
) =>
  produce(state, draft => {
    if (action.type === REHYDRATE) {
      const { err, payload } = action

      if (err) {
        Logger.log(
          `InvoicesListed reducer, redux-persist's RehydrateAction err: ${JSON.stringify(
            err,
          )}`,
        )
        return
      }

      if (!Schema.isObj(payload)) {
        Logger.log(
          `InvoicesListed reducer, redux-persist's RehydrateAction err: payload not an object instead got: ${typeof payload}`,
        )

        return
      }

      const p = payload as { invoicesListed: State }

      Object.assign(draft, p.invoicesListed)

      draft.ids = []
    }

    if (action.type === 'invoices/receivedOwn') {
      const { invoices, originRequest } = action.data

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

      const isLatestInvoices =
        !!originRequest.reversed && Object.keys(originRequest).length === 1

      if (isLatestInvoices) {
        draft.ids = mostRecentToLeast.map(i => i.payment_request)
      }
    }

    if (action.type === 'authed') {
      const {
        data: {
          invoices: { invoices },
        },
      } = action.data

      const mostRecentToLeast = invoices.slice().sort((i1, i2) => {
        // If settled, use the settle date for sorting, else use creation date.
        // settle_date will be 0 if not settled
        const date1 = Number(i1.settle_date) || Number(i1.creation_date)
        const date2 = Number(i2.settle_date) || Number(i2.creation_date)

        return date2 - date1
      })

      for (const invoice of mostRecentToLeast) {
        draft.byId[invoice.payment_request] = invoice
      }

      draft.ids = mostRecentToLeast.map(i => i.payment_request)
    }
  })

export default reducer
