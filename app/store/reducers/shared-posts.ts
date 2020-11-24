import produce from 'immer'
import { Reducer } from 'redux'
import { Schema } from 'shock-common'

import { Action } from '../actions'

/**
 * Key is original post id + public key of the user sharing it.
 */
type State = Record<string, Schema.SharedPost>

const reducer: Reducer<State, Action> = (state = {}, action) =>
  produce(state, draft => {
    if (action.type === 'sharedPosts/received') {
      const {
        originalAuthor,
        originalPostID,
        shareDate,
        sharedBy,
      } = action.payload

      const shareID = sharedBy + originalPostID

      draft[shareID] = {
        originalAuthor,
        originalPostID,
        shareDate,
        sharedBy,
        shareID,
      }
    }

    if (action.type === 'sharedPosts/removed') {
      const { shareID } = action.payload

      delete draft[shareID]
    }
  })

export default reducer
