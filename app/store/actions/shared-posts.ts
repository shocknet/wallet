import { createAction } from '@reduxjs/toolkit'

export const sharedPostRemoved = createAction(
  'sharedPosts/removed',
  (id: string) => ({
    payload: {
      id,
    },
  }),
)

export const receivedRawSharedPost = createAction(
  'sharedPosts/received',
  (
    originalAuthor: string,
    originalDate: number,
    originalPostID: string,
    sharedBy: string,
    shareID: string,
    shareDate: number,
  ) => ({
    payload: {
      originalAuthor,
      originalDate,
      originalPostID,
      sharedBy,
      shareID,
      shareDate,
    },
  }),
)

export const sharedPostsRemovedSeveral = createAction(
  'posts/removedSeveral',
  (postsIDs: string[]) => ({
    payload: {
      postsIDs,
    },
  }),
)

export type SharedPostsAction =
  | ReturnType<typeof sharedPostRemoved>
  | ReturnType<typeof receivedRawSharedPost>
  | ReturnType<typeof sharedPostsRemovedSeveral>
