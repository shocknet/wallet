import { Schema } from 'shock-common'

import { State } from '../../reducers'

export const getPosts = (state: State) => state.posts

export const getPost = (state: State, id: string): Schema.PostN | null =>
  state.posts[id] || null
