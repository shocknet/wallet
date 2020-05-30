//import { Schema } from 'shock-common'

/**
 * @typedef {object} FeedMedia
 *
 * @property {'VIDEO'|'AUDIO'|'IMAGE'} type
 * @property {string} magnetUri
 * @property {number} ratio_x
 * @property {number} ratio_y
 *
 */

/**
 * @typedef {object} PartialFeed
 * @property {string} id
 * @property {string} username
 * @property {string} profilePic
 * @property {string[]} paragraphs
 * @property {FeedMedia[]} media
 *
 */

/**
 * @typedef {object} BeganLoadFeedAction
 * @prop {{ page: number }} data
 * @prop {'feed/beganLoadFeed'} type
 */
/**
 * @typedef {object} FinishedLoadFeedAction
 * @prop {{ feed: Map<string,PartialFeed> }} data
 * @prop {'feed/finishedLoadFeed'} type
 */
/**
 * @typedef {object} LoadFeedErrorAction
 * @prop {{ page: number }} data
 * @prop {'feed/loadFeedError'} type
 */
/**
 * @typedef {object} BeganAddPostAction
 * @prop {{ post: PartialFeed }} data
 * @prop {'feed/beganAddPost'} type
 */
/**
 * @typedef {object} FinishedAddPostAction
 * @prop {{ post: PartialFeed }} data
 * @prop {'feed/finishedAddPost'} type
 */
/**
 * @typedef {object} AddPostErrorAction
 * @prop {{ post: PartialFeed }} data
 * @prop {'feed/addPostError'} type
 */

/**
 * @typedef {BeganLoadFeedAction|FinishedLoadFeedAction|LoadFeedErrorAction|BeganAddPostAction|FinishedAddPostAction|AddPostErrorAction} feedActions
 */

/**
 * @param {number} page
 * @returns {BeganLoadFeedAction}
 */
export const beganLoadFeed = page => ({
  data: {
    page,
  },
  type: 'feed/beganLoadFeed',
})

/**
 * @param {Map<string,PartialFeed>} feed
 * @return {FinishedLoadFeedAction}
 */
export const finishedLoadFeed = feed => ({
  data: {
    feed,
  },
  type: 'feed/finishedLoadFeed',
})

/**
 * @param {number} page
 * @return {LoadFeedErrorAction}
 */
export const loadFeedError = page => ({
  data: {
    page,
  },
  type: 'feed/loadFeedError',
})

/**
 * @param {PartialFeed} post
 * @return {BeganAddPostAction}
 */
export const beganAddPost = post => ({
  data: {
    post,
  },
  type: 'feed/beganAddPost',
})

/**
 * @param {PartialFeed} post
 * @return {FinishedAddPostAction}
 */
export const finishedAddPost = post => ({
  data: {
    post,
  },
  type: 'feed/finishedAddPost',
})

/**
 * @param {PartialFeed} post
 * @return {AddPostErrorAction}
 */
export const addPostError = post => ({
  data: {
    post,
  },
  type: 'feed/addPostError',
})
