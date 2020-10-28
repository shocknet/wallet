import { createSelector } from 'reselect'
import { Schema } from 'shock-common'

import { State } from '../reducers'

import { getFollowedPublicKeys } from './follows'
import { makeGetUser } from './users'

export const getPosts = (state: State) => state.posts

export const getPost = (state: State, id: string): Schema.PostN | null =>
  state.posts[id] || null

const getPublicKey = (_: State, publicKey: string) => publicKey

export const makeGetPostsForPublicKey = () => {
  const getUser = makeGetUser()

  return createSelector<
    State,
    string, // Props to selectors
    ReturnType<typeof getPosts>,
    ReturnType<typeof getPublicKey>,
    ReturnType<typeof getUser>,
    Schema.PostN[] // Return type
  >(
    getPosts,
    getPublicKey,
    getUser,
    (posts, publicKey, user) => {
      const postsByThisPublicKey = Object.values(posts)
        .filter(p => p.author === publicKey)
        .sort((a, b) => b.date - a.date)

      if (user.pinnedPost) {
        const idx = postsByThisPublicKey.findIndex(
          p => p.id === user.pinnedPost,
        )
        if (idx > 0) {
          const [pinned] = postsByThisPublicKey.splice(idx, 1)
          postsByThisPublicKey.splice(0, 0, pinned)
        }
      }

      return postsByThisPublicKey
    },
  )
}

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
