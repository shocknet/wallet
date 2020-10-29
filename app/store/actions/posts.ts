import { Schema } from 'shock-common'
import { createAction } from '@reduxjs/toolkit'

export const receivedPosts = (posts: (Schema.PostN | Schema.Post)[]) =>
  ({
    type: 'posts/received',
    payload: {
      posts,
    },
  } as const)

export const receivedRawPost = (
  post: Schema.RawPost,
  id: string,
  authorPublicKey: string,
) =>
  ({
    type: 'posts/receivedRaw',
    payload: {
      authorPublicKey,
      id,
      post,
    },
  } as const)

export const receivedRawPosts = (
  posts: Schema.RawPost[],
  ids: string[],
  authorPublicKey: string,
) =>
  ({
    type: 'posts/receivedSeveralRaw',
    payload: {
      authorPublicKey,
      ids,
      posts,
    },
  } as const)

export const requestedPostPin = createAction(
  'posts/requestedPin',
  (postID: string) => ({
    payload: {
      postID,
    },
  }),
)

export const pinnedPost = createAction('posts/pinned', (postID: string) => ({
  payload: {
    postID,
  },
}))

export const requestedPostRemoval = createAction(
  'posts/requestedRemoval',
  (postID: string) => ({
    payload: {
      postID,
    },
  }),
)

export const postRemoved = createAction('posts/removed', (postID: string) => ({
  payload: {
    postID,
  },
}))

export const requestedPostUnpin = createAction('posts/requestedUnpin')

export const unpinnedPost = createAction('posts/unpinned')

export type PostsAction =
  | ReturnType<typeof receivedPosts>
  | ReturnType<typeof receivedRawPost>
  | ReturnType<typeof receivedRawPosts>
  | ReturnType<typeof requestedPostPin>
  | ReturnType<typeof pinnedPost>
  | ReturnType<typeof requestedPostRemoval>
  | ReturnType<typeof postRemoved>
  | ReturnType<typeof requestedPostUnpin>
  | ReturnType<typeof unpinnedPost>
