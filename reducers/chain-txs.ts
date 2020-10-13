/**
 * https://medium.com/@dcousineau/advanced-redux-entity-normalization-f5f1fe2aefc5
 */
import produce from 'immer'
import { Reducer } from 'redux'
import { Schema } from 'shock-common'

import { Action } from '../app/actions'

interface State {
  /**
   * Keys are the encoded version of the invoice.
   */
  byId: Record<string, Schema.ChainTransaction>

  /**
   * Most recent to least recent.
   */
  ids: string[]
}

const INITIAL_STATE: State = {
  byId: {},
  ids: [],
}

const reducer: Reducer<State, Action> = (state = INITIAL_STATE, action) =>
  produce(state, draft => {
    if (action.type === 'chainTXs/receivedSingle') {
      const { tx } = action.payload
      draft.byId[tx.tx_hash] = tx

      const existing = [...draft.ids.map(tx_hash => draft.byId[tx_hash]), tx]

      existing.sort(
        (tx1, tx2) => Number(tx2.time_stamp) - Number(tx1.time_stamp),
      )

      draft.ids = existing.map(tx => tx.tx_hash)
    }

    if (action.type === 'chainTXs/receivedOwn') {
      const { transactions, originRequest } = action.data
      // They come in no good order.
      const mostRecentToLeast = transactions
        .slice()
        .sort((t1, t2) => Number(t2.time_stamp) - Number(t1.time_stamp))

      for (const tx of mostRecentToLeast) {
        draft.byId[tx.tx_hash] = tx
      }

      // TODO
      const isLatestTXs = originRequest.end_height === -1

      if (isLatestTXs) {
        draft.ids = mostRecentToLeast.map(i => i.tx_hash)
      }
    }
  })

export default reducer
