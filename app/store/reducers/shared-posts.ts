import * as Common from 'shock-common'
import produce from 'immer'
import { Reducer } from 'redux'

import { Action } from '../actions'

type State = Record<string, Common.Schema.SharedPost>

const reducer: Reducer<State, Action> = (state = {}, action) =>
  produce(state, draft => {
    if (action.type === 'sharedPosts/received') {
      const {
        originalAuthor,
        originalDate,
        originalPostID,
        shareID,
        sharedBy,
        shareDate,
      } = action.payload

      draft[shareID] = {
        originalAuthor,
        originalDate,
        originalPostID,
        shareID,
        sharedBy,
        shareDate,
      }
    }

    if (action.type === 'sharedPosts/removed') {
      const { id } = action.payload

      delete draft[id]
    }
  })

export default reducer
