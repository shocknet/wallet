/**
 * We normalize/denormalize so we don't have to change too much code in the view
 * layer. TODO.
 */
import produce from 'immer'
import { Reducer } from 'redux'
import { Schema } from 'shock-common'

import { Action } from '../actions'

interface State {
  byId: Record<string, Schema.ChatN>
}

const INITIAL_STATE: State = {
  byId: {},
}

const reducer: Reducer<State, Action> = (state = INITIAL_STATE, action) =>
  produce(state, draft => {
    if (action.type == 'chats/receivedChats') {
      const { chats } = action.data

      for (const [id, chatN] of Object.entries(
        Schema.normalizeChats(chats).entities.chats,
      )) {
        draft.byId[id] = chatN
      }
    }
  })

export default reducer
