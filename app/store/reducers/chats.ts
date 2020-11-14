/**
 * We normalize/denormalize so we don't have to change too much code in the view
 * layer. TODO.
 */
import { Reducer } from 'redux'
import { Schema } from 'shock-common'

import { Action } from '../actions'

interface State {
  byId: Record<string, Schema.ChatN>
}

const INITIAL_STATE: State = {
  byId: {},
}

const reducer: Reducer<State, Action> = (state = INITIAL_STATE, action) => {
  if (action.type === 'chats/receivedChats') {
    const { chats } = action.data
    return {
      byId: Schema.normalizeChats(chats).entities.chats || {},
    }
  }

  return state
}

export default reducer
