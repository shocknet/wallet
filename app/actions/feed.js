import { Schema } from 'shock-common'

/**
 * @typedef {Schema.Post} Post

 */

/**
 * @typedef {object} BeganLoadFeedAction
 * @prop {{ page: number }} data
 * @prop {'feed/beganLoadFeed'} type
 */
/**
 * @typedef {object} FinishedLoadFeedAction
 * @prop {{ feed: Map<string,Post> }} data
 * @prop {'feed/finishedLoadFeed'} type
 */
/**
 * @typedef {object} LoadFeedErrorAction
 * @prop {{ page: number }} data
 * @prop {'feed/loadFeedError'} type
 */
/**
 * @typedef {object} BeganAddPostAction
 * @prop {{ post: Post }} data
 * @prop {'feed/beganAddPost'} type
 */
/**
 * @typedef {object} FinishedAddPostAction
 * @prop {{ post: Post,id:string }} data
 * @prop {'feed/finishedAddPost'} type
 */
/**
 * @typedef {object} AddPostErrorAction
 * @prop {{ post: Post }} data
 * @prop {'feed/addPostError'} type
 */

/**
 * @typedef {BeganLoadFeedAction|FinishedLoadFeedAction|LoadFeedErrorAction|BeganAddPostAction|FinishedAddPostAction|AddPostErrorAction} FeedActions
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
 * @param {Map<string,Post>} feed
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
 * @param {Post} post
 * @return {BeganAddPostAction}
 */
export const beganAddPost = post => ({
  data: {
    post,
  },
  type: 'feed/beganAddPost',
})

/**
 * @param {Post} post
 * @param {string} id
 * @return {FinishedAddPostAction}
 */
export const finishedAddPost = (post, id) => ({
  data: {
    post,
    id,
  },
  type: 'feed/finishedAddPost',
})

/**
 * @param {Post} post
 * @return {AddPostErrorAction}
 */
export const addPostError = post => ({
  data: {
    post,
  },
  type: 'feed/addPostError',
})
