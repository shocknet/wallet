import Logger from 'react-native-file-log'
import notificationService from '../../notificationService'

export const ACTIONS = {
  ADD_POST: 'feed/addPost',
  LOAD_FEED: 'feed/loadFeed',
}

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
 * @param {PartialFeed} post
 * @returns {import('redux-thunk').ThunkAction<PartialFeed, {}, {}, import('redux').AnyAction>}
 */
export const addPost = post => dispatch => {
  Logger.log('adding new post')
  dispatch({
    type: ACTIONS.ADD_POST,
    data: post,
  })
  return post
}
/**
 * @param {PartialFeed[]} feed
 * @returns {import('redux-thunk').ThunkAction<feed, {}, {}, import('redux').AnyAction>}
 */
export const loadFeed = feed => dispatch => {
  notificationService.Log('TESTING', JSON.stringify(feed))
  Logger.log('loading feed')
  dispatch({
    type: ACTIONS.LOAD_FEED,
    data: feed,
  })
  return feed
}
