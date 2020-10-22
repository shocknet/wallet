import { Schema } from 'shock-common'

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

export type PostsAction =
  | ReturnType<typeof receivedPosts>
  | ReturnType<typeof receivedRawPost>
  | ReturnType<typeof receivedRawPosts>
