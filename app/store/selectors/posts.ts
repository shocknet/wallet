import { createSelector } from 'reselect'
import { Schema } from 'shock-common'

import { State } from '../reducers'

import { getMyPublicKey } from './auth'
import { getFollowedPublicKeys } from './follows'
import { makeGetUser } from './users'
import { selectAllSharedPosts } from './shared-posts'

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

export const getOwnPosts = createSelector<
  State,
  ReturnType<typeof getPosts>,
  ReturnType<typeof getMyPublicKey>,
  Schema.PostN[]
>(
  getPosts,
  getMyPublicKey,
  (posts, myPublicKey) =>
    Object.values(posts).filter(p => p.author === myPublicKey),
)

export const getOwnPostsAndOwnShared = createSelector(
  getOwnPosts,
  selectAllSharedPosts,
  (ownPosts, allSharedPosts) => {
    const allPosts = [...ownPosts, ...Object.values(allSharedPosts)]

    allPosts.sort((a, b) => {
      let dateA = Schema.isSharedPost(a) ? a.shareDate : a.date
      let dateB = Schema.isSharedPost(b) ? b.shareDate : b.date

      return dateB - dateA
    })
  },
)

export const makeGetPostsAndSharedForPublicKey = () => {
  const getUser = makeGetUser()

  return createSelector<
    State,
    string, // Props to selectors
    ReturnType<typeof getPosts>,
    ReturnType<typeof selectAllSharedPosts>,
    ReturnType<typeof getPublicKey>,
    ReturnType<typeof getUser>,
    (Schema.PostN | Schema.SharedPost)[] // Return type
  >(
    getPosts,
    selectAllSharedPosts,
    getPublicKey,
    getUser,
    (posts, sharedPostsRecord, publicKey, user) => {
      const sharedPosts = Object.values(sharedPostsRecord)
      const sharedByThisPublicKey = sharedPosts.filter(
        p => p.sharedBy === publicKey,
      )
      const postsByThisPublicKey = Object.values(posts).filter(
        p => p.author === publicKey,
      )

      const mixed = [...sharedByThisPublicKey, ...postsByThisPublicKey]

      mixed.sort((a, b) => {
        let dateA = Schema.isSharedPost(a) ? a.shareDate : a.date
        let dateB = Schema.isSharedPost(b) ? b.shareDate : b.date

        return dateB - dateA
      })

      if (user.pinnedPost) {
        const idx = mixed.findIndex(p => {
          const post = p as Schema.PostN
          post.id && post.id === user.pinnedPost
        })
        if (idx > 0) {
          const [pinned] = mixed.splice(idx, 1)
          mixed.splice(0, 0, pinned)
        }
      }

      return mixed
    },
  )
}
