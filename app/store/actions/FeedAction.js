import { Schema } from 'shock-common'

/**
 * @typedef {Schema.Post} Post

 */

/**
 * @typedef {object} BeganLoadFeedAction
 * @prop {{ page: number }} data
 * @prop {'feedWall/beganLoadFeed'} type
 */
/**
 * @typedef {object} FinishedLoadFeedAction
 * @prop {{ data: Map<string,Post> }} data
 * @prop {'feedWall/finishedLoadFeed'} type
 */
/**
 * @typedef {object} LoadFeedErrorAction
 * @prop {{ page: number }} data
 * @prop {'feedWall/loadFeedError'} type
 */
/**

/**
 * @typedef {BeganLoadFeedAction|FinishedLoadFeedAction|LoadFeedErrorAction} FeedActions
 */

/**
 * @param {number} page
 * @returns {BeganLoadFeedAction}
 */
export const beganLoadFeed = page => ({
  data: {
    page,
  },
  type: 'feedWall/beganLoadFeed',
})

/**
 * @param {Map<string,Post>} data
 * @return {FinishedLoadFeedAction}
 */
export const finishedLoadFeed = data => ({
  // @ts-expect-error
  data,
  type: 'feedWall/finishedLoadFeed',
})

/**
 * @param {number} page
 * @return {LoadFeedErrorAction}
 */
export const loadFeedError = page => ({
  data: {
    page,
  },
  type: 'feedWall/loadFeedError',
})
