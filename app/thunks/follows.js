// @ts-nocheck
import * as API from '../services/contact-api'
import * as FollowsActions from '../actions/follows'

const follow = PublicKey => (dispatch, getState) => {
  dispatch(FollowsActions.beganFollow(PublicKey))
  return API.Actions.follow(PublicKey)
    .then(() => {
      dispatch(FollowsActions.finishedFollow(PublicKey))
    })
    .catch(e => {
      //TODO: Toast
      dispatch(FollowsActions.followError(PublicKey))
    })
}

const unfollow = PublicKey => (dispatch, getState) => {
  return API.Actions.unfollow(PublicKey)
    .then(() => {
      dispatch(FollowsActions.finishedUnfollow(PublicKey))
    })
    .catch(e => {
      //TODO:Toast
      dispatch(FollowsActions.followError(PublicKey))
    })
}
export { follow }
