import * as API from '../services/contact-api'
import * as Actions from '../actions'
import { Schema } from 'shock-common'
import notificationService from '../../notificationService'

/**
 *
 * @typedef {Schema.Post} Post
 */

/**
 *
 * @param {number} page
 * @returns {import('redux-thunk').ThunkAction<{}, {}, {}, import('redux').AnyAction>}
 */

const loadFeed = page => dispatch => {
  dispatch(Actions.Feed.beganLoadFeed(page))
  notificationService.Log('TESTING', 'k8s')
  return API.Actions.loadFeed(page)
    .then(({ data: feed }) => {
      notificationService.Log('TESTING', 'PROVA PROVA')
      notificationService.Log('TESTING', JSON.stringify(feed))
      dispatch(Actions.Feed.finishedLoadFeed(feed))
    })
    .catch(e => {
      //TODO: Toast
      notificationService.Log('TESTING', 'aaaaaaah')
      notificationService.Log('TESTING', JSON.stringify(e))
      dispatch(Actions.Feed.loadFeedError(page))
    })
}
/**
 *
 * @param {Post} post
 * @returns {import('redux-thunk').ThunkAction<{}, {}, {}, import('redux').AnyAction>}
 */
const addPost = post => dispatch => {
  dispatch(Actions.Feed.beganAddPost(post))
  return API.Actions.addPost(post)
    .then(({ data: id }) => {
      dispatch(Actions.Feed.finishedAddPost(post, id))
    })
    .catch(() => {
      //TODO:Toast
      dispatch(Actions.Feed.addPostError(post))
    })
}
export { loadFeed, addPost }
