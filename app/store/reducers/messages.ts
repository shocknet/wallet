/**
 * We normalize/denormalize so we don't have to change too much code in the view
 * layer. TODO.
 */
import produce from 'immer'
import { Reducer } from 'redux'
import { Schema } from 'shock-common'

import { Action } from '../actions'

interface State {
  byId: Record<string, Schema.ChatMessage>
}

const INITIAL_STATE: State = {
  byId: {},
}

const reducer: Reducer<State, Action> = (state = INITIAL_STATE, action) =>
  produce(state, draft => {
    if (action.type == 'chats/receivedChats') {
      const { chats } = action.data

      const {
        entities: { chatMessages },
      } = Schema.normalizeChats(chats)

      for (const msg of Object.values(chatMessages)) {
        draft.byId[msg.id] = msg
      }
    }
  })

export default reducer
