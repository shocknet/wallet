//@ts-nocheck
import produce from 'immer'
import { Schema } from 'shock-common'

/** @type {State} */
const INITIAL_STATE = {
  count: 0,
  totalPages: 0,
  posts: {},
  loadingNextPage: false,
  lastPageFetched: 0,
  errorPage: null,
}

/**
 * @param {State} state
 * @param {Action} action
 * @returns {State}
 */
const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'feedWall/beganLoadFeed':
      return produce(state, draft => {
        draft.loadingNextPage = true
        draft.lastPageFetched = action.data.page
      })
    case 'feedWall/finishedLoadFeed':
      return produce(state, draft => {
        draft.loadingNextPage = false
        draft.posts = {
          ...state.posts,
          ...action.data.posts,
        }
        draft.count = state.count + action.data.count
        draft.totalPages = action.data.totalPages
      })
    case 'feedWall/loadFeedError':
      return produce(state, draft => {
        draft.loadingNextPage = false
        draft.errorPage = action.data.page
      })
    default:
      return state
  }
}

export default reducer
