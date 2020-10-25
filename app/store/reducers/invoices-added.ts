import produce from 'immer'
import { Reducer } from 'redux'
import { Schema } from 'shock-common'

import { Action } from '../actions'

/**
 * The key is the encoded invoice.
 */
type State = Record<string, Schema.InvoiceWhenAdded>

const INITIAL_STATE: State = {}

const reducer: Reducer<State, Action> = (state = INITIAL_STATE, action) =>
  produce(state, draft => {
    if (action.type === 'invoice/add') {
      const { invoice, data: encodedInvoice } = action

      draft[encodedInvoice] = invoice
    }
  })

export default reducer
