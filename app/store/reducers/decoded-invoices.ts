import { Schema } from 'shock-common'
import produce from 'immer'
import { Reducer } from 'redux'

import { Action } from '../actions'

type State = Record<string, Schema.InvoiceWhenDecoded>

const reducer: Reducer<State, Action> = (state = {}, action) =>
  produce(state, draft => {
    if (action.type === 'invoice/load') {
      const { payment_request, ...decodedInvoice } = action.data

      draft[payment_request] = decodedInvoice
    }

    if (action.type === 'invoices/batchDecodeReceived') {
      const { invoices, payReqs } = action.data

      for (let i = 0; i < invoices.length; i++) {
        const [invoice, payReq] = [invoices[i], payReqs[i]]

        draft[payReq] = invoice
      }
    }
  })

export default reducer
