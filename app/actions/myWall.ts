import * as Common from 'shock-common'

export type BeganFetchPageAction = {
  type: 'myWall/beganFetchPage'
  data: {
    page: number
  }
}
export type FinishedFetchPageAction = {
  type: 'myWall/finishedFetchPage'
  data: {
    page: number
    posts: Common.Schema.Post[]
  }
}
export type ErrorFetchPageAction = {
  type: 'myWall/errorFetchPage'
  data: {
    page: number
    error: string
  }
}

export type BeganSettingPinnedAction = {
  type: 'myWall/beganSettingPinned'
  data: {
    page: number
    postId: string
  }
}
export type FinishedSettingPinnedAction = {
  type: 'myWall/finishedSettingPinned'
  data: {
    page: number
    postId: string
  }
}
export type ErrorSettingPinnedAction = {
  type: 'myWall/ErrorSettingPinned'
  data: {
    page: number
    postId: string
    error: string
  }
}

export type BeganDeletePostAction = {
  type: 'myWall/beganDeletePost'
  data: {
    page: number
    postId: string
  }
}

export type FinishedDeletePostAction = {
  type: 'myWall/finishedDeletePost'
  data: {
    index: number
    postId: string
  }
}

export type ErrorDeletePostAction = {
  type: 'myWall/ErrorDeletePost'
  data: {
    index: number
    postId: string
    error: string
  }
}

export type WallActions =
  | BeganFetchPageAction
  | FinishedFetchPageAction
  | ErrorFetchPageAction
  | BeganSettingPinnedAction
  | FinishedSettingPinnedAction
  | ErrorSettingPinnedAction
  | BeganDeletePostAction
  | FinishedDeletePostAction
  | ErrorDeletePostAction

export const beganFetchPage = (page: number): BeganFetchPageAction => ({
  type: 'myWall/beganFetchPage',
  data: { page },
})
export const finishedFetchPage = (
  page: number,
  posts: Common.Schema.Post[],
): FinishedFetchPageAction => ({
  type: 'myWall/finishedFetchPage',
  data: {
    page,
    posts,
  },
})
export const errorFetchPage = (
  page: number,
  error: string,
): ErrorFetchPageAction => ({
  type: 'myWall/errorFetchPage',
  data: {
    page,
    error,
  },
})

export const beganSettingPinned = (
  page: number,
  postId: string,
): BeganSettingPinnedAction => ({
  type: 'myWall/beganSettingPinned',
  data: {
    page,
    postId,
  },
})

export const finishedSettingPinned = (
  page: number,
  postId: string,
): FinishedSettingPinnedAction => ({
  type: 'myWall/finishedSettingPinned',
  data: {
    page,
    postId,
  },
})

export const ErrorSettingPinned = (
  page: number,
  postId: string,
  error: string,
): ErrorSettingPinnedAction => ({
  type: 'myWall/ErrorSettingPinned',
  data: { page, postId, error },
})

export const beganDeletePost = (
  page: number,
  postId: string,
): BeganDeletePostAction => ({
  type: 'myWall/beganDeletePost',
  data: {
    page,
    postId,
  },
})

export const finishedDeletePost = (
  index: number,
  postId: string,
): FinishedDeletePostAction => ({
  type: 'myWall/finishedDeletePost',
  data: {
    index,
    postId,
  },
})

export const ErrorDeletePost = (
  index: number,
  postId: string,
  error: string,
): ErrorDeletePostAction => ({
  type: 'myWall/ErrorDeletePost',
  data: { index, postId, error },
})
