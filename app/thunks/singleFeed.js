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
 * @param {string} publicKey
 * @returns {import('redux-thunk').ThunkAction<{}, {}, {}, import('redux').AnyAction>}
 */

const loadSingleFeed = (page, publicKey) => dispatch => {
  dispatch(Actions.SingleFeed.beganLoadSingleFeed(page))
  notificationService.Log('TESTING', 'k8s')
  return API.Actions.loadSingleFeed(page, publicKey)
    .then(({ data: feed }) => {
      notificationService.Log('TESTING', 'PROVA PROVA')
      notificationService.Log('TESTING', JSON.stringify(feed))
      dispatch(Actions.SingleFeed.finishedLoadSingleFeed(feed))
    })
    .catch(e => {
      //TODO: Toast
      notificationService.Log('TESTING', 'aaaaaaah')
      notificationService.Log('TESTING', JSON.stringify(e))
      dispatch(Actions.SingleFeed.loadSingleFeedError(page))
    })
}

export { loadSingleFeed }
