import { Schema } from 'shock-common'

import { State } from '../reducers'

export const selectAllSharedPosts = (state: State) => state.sharedPosts

export const selectSharedPost = (state: State, id: string): Schema.SharedPost =>
  state.sharedPosts[id]
