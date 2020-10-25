import { createSelector } from 'reselect'
import { Schema } from 'shock-common'

import { State } from '../reducers'

import { getFollowedPublicKeys } from './follows'

export const getPosts = (state: State) => state.posts

export const getPost = (state: State, id: string): Schema.PostN | null =>
  state.posts[id] || null

const getPublicKey = (_: State, publicKey: string) => publicKey

export const makeGetPostsForPublicKey = () =>
  createSelector<
    State,
    string, // Props to selectors
    ReturnType<typeof getPosts>,
    ReturnType<typeof getPublicKey>,
    Schema.PostN[] // Return type
  >(
    getPosts,
    getPublicKey,
    (posts, publicKey) => {
      return Object.values(posts)
        .filter(p => p.author === publicKey)
        .sort((a, b) => b.date - a.date)
    },
  )

export const getPostsFromFollowed = createSelector<
  State,
  ReturnType<typeof getPosts>,
  ReturnType<typeof getFollowedPublicKeys>,
  Schema.PostN[] // Return type
>(
  getPosts,
  getFollowedPublicKeys,
  (posts, publicKeys) => {
    return Object.values(posts)
      .filter(p => publicKeys.includes(p.author))
      .sort((a, b) => b.date - a.date)
  },
)
