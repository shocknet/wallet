import { createAction } from '@reduxjs/toolkit'

export const sharedPostRemoved = createAction(
  'sharedPosts/removed',
  (shareID: string) => ({
    payload: {
      shareID,
    },
  }),
)

export const receivedSharedPost = createAction(
  'sharedPosts/received',
  (
    originalAuthor: string,
    originalPostID: string,
    sharedBy: string,
    shareDate: number,
  ) => ({
    payload: {
      originalAuthor,
      originalPostID,
      sharedBy,
      shareDate,
    },
  }),
)

export const removedSeveralSharedPosts = createAction(
  'sharedPosts/removedSeveral',
  (shareIDs: string[]) => ({
    payload: {
      shareIDs,
    },
  }),
)

export type SharedPostsAction =
  | ReturnType<typeof sharedPostRemoved>
  | ReturnType<typeof receivedSharedPost>
  | ReturnType<typeof removedSeveralSharedPosts>
