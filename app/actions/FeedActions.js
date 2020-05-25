import Logger from 'react-native-file-log'

export const ACTIONS = {
  ADD_POST: 'feed/addPost',
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
