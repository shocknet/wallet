import { Schema } from 'shock-common'

import * as Actions from '../actions'
import { getFeedPage } from '../services/feed'

/**
 *
 * @typedef {Schema.Post} Post
 */

/**
 *
 * @param {number} pageNumber
 * @returns {import('redux-thunk').ThunkAction<{}, {}, {}, import('redux').AnyAction>}
 */

export const thunkGetFeedPage = pageNumber => async dispatch => {
  dispatch(Actions.FeedWall.beganLoadFeed(pageNumber))
  try {
    const data = await getFeedPage(pageNumber)
    // @ts-ignore
    dispatch(Actions.FeedWall.finishedLoadFeed(data))
  } catch (error) {
    dispatch(Actions.FeedWall.loadFeedError(pageNumber))
  }
}
