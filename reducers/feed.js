//@ts-nocheck
import produce from 'immer'
import { Schema } from 'shock-common'

/**
 * @typedef {import('../app/actions').Action} Action
 * @typedef {Schema.Post} Post
 *
 */
/**
 * @typedef {Record<string, Post>} State
 */

/** @type {State} */
const INITIAL_STATE = {}

/**
 * @returns {Post}
 */
const createEmptyPost = () => ({
  contentItems: {},
  date: 0,
  tags: '',
  title: '',
  status: 'draft',
})

/**
 * @param {State} state
 * @param {Action} action
 * @returns {State}
 */
const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'feed/beganLoadFeed':
      return produce(state, draft => {
        //TODO
      })
    case 'feed/finishedLoadFeed':
      return produce(state, draft => {
        /**
         *
         * @param {Post} feedElement
         * @param {string} id
         */
        const FeedLoader = (feedElement, id) => {
          draft[id] = {
            ...createEmptyPost(),
            ...(draft[id] || {}),
            ...feedElement,
          }
        }
        action.data.feed.forEach(FeedLoader)
      })
    case 'feed/loadFeedError':
      return produce(state, draft => {
        //TODO
      })
    case 'feed/beganAddPost':
      return produce(state, draft => {
        //TODO
      })
    case 'feed/finishedAddPost':
      return produce(state, draft => {
        const { post, id } = action.data
        draft[id] = {
          ...createEmptyPost(),
          ...(draft[id] || {}),
          ...post,
        }
      })
    case 'feed/addPostError':
      return produce(state, draft => {
        //TODO
      })
    default:
      return state
  }
}

export default reducer
