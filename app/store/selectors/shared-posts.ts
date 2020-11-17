import * as Common from 'shock-common'
import { createSelector } from 'reselect'

import { State } from '../reducers'

export const selectAllSharedPosts = (state: State) => state.sharedPosts

const getPostID = (_: State, props: string) => props

export const selectSharedPost = (
  state: State,
  id: string,
): Common.Schema.SharedPost => state.sharedPosts[id]

export const makeSelectIsShared = () => {
  return createSelector<State, string, State['sharedPosts'], string, boolean>(
    selectAllSharedPosts,
    getPostID,
    (sharedPosts, postID) =>
      Object.values(sharedPosts).some(p => p.originalPostID === postID),
  )
}
