import { Schema } from 'shock-common'

/**
 * @typedef {Schema.Post} Post

 */

/**
 * @typedef {object} BeganLoadSingleFeedAction
 * @prop {{ page: number }} data
 * @prop {'feed/beganLoadSingleFeed'} type
 */
/**
 * @typedef {object} FinishedLoadSingleFeedAction
 * @prop {{ feed: Map<string,Post> }} data
 * @prop {'feed/finishedLoadSingleFeed'} type
 */
/**
 * @typedef {object} LoadSingleFeedErrorAction
 * @prop {{ page: number }} data
 * @prop {'feed/loadSingleFeedError'} type
 */

/**
 * @typedef {BeganLoadSingleFeedAction|FinishedLoadSingleFeedAction|LoadSingleFeedErrorAction} SingleFeedActions
 */

/**
 * @param {number} page
 * @returns {BeganLoadSingleFeedAction}
 */
export const beganLoadSingleFeed = page => ({
  data: {
    page,
  },
  type: 'feed/beganLoadSingleFeed',
})

/**
 * @param {Map<string,Post>} feed
 * @return {FinishedLoadSingleFeedAction}
 */
export const finishedLoadSingleFeed = feed => ({
  data: {
    feed,
  },
  type: 'feed/finishedLoadSingleFeed',
})

/**
 * @param {number} page
 * @return {LoadSingleFeedErrorAction}
 */
export const loadSingleFeedError = page => ({
  data: {
    page,
  },
  type: 'feed/loadSingleFeedError',
})
