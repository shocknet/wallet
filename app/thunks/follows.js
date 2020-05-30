// @ts-nocheck
import * as API from '../services/contact-api'
import * as FollowsActions from '../actions/follows'

const follow = publicKey => (dispatch, getState) => {
  dispatch(FollowsActions.beganFollow(publicKey))
  return API.Actions.follow(publicKey)
    .then(() => {
      dispatch(FollowsActions.finishedFollow(publicKey))
    })
    .catch(e => {
      //TODO: Toast
      dispatch(FollowsActions.followError(publicKey))
    })
}

const unfollow = publicKey => (dispatch, getState) => {
  dispatch(FollowsActions.beganUnfollow(publicKey))
  return API.Actions.unfollow(publicKey)
    .then(() => {
      dispatch(FollowsActions.finishedUnfollow(publicKey))
    })
    .catch(e => {
      //TODO:Toast
      dispatch(FollowsActions.unfollowError(publicKey))
    })
}
export { follow, unfollow }
