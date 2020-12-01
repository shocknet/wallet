import { Schema } from 'shock-common'

import { State } from '../reducers'

import { getMyPublicKey } from './auth'

export const selectAllSharedPosts = (state: State) => state.sharedPosts

export const selectSharedPost = (state: State, id: string): Schema.SharedPost =>
  state.sharedPosts[id]

export const selectIsSharedByMe = (state: State, postID: string) => {
  const myPublicKey = getMyPublicKey(state)
  const shareID = myPublicKey + postID

  return !!state.sharedPosts[shareID]
}
