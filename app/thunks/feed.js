// @ts-nocheck
import * as API from '../services/contact-api'
import * as Actions from '../actions'

const loadFeed = page => (dispatch, getState) => {
  dispatch(Actions.Feed.beganLoadFeed(page))
  return API.Actions.loadFeed(page)
    .then(() => {
      dispatch(Actions.Feed.finishedLoadFeed(page))
    })
    .catch(e => {
      //TODO: Toast
      dispatch(Actions.Feed.loadFeedError(page))
    })
}

const addPost = post => (dispatch, getState) => {
  dispatch(Actions.Feed.beganAddPost(post))
  return API.Actions.addPost(post)
    .then(() => {
      dispatch(Actions.Feed.finishedAddPost(post))
    })
    .catch(e => {
      //TODO:Toast
      dispatch(Actions.Feed.addPostError(post))
    })
}
export { loadFeed, addPost }
