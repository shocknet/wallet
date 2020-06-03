import Http from 'axios'
import { ToastAndroid } from 'react-native'
import Logger from 'react-native-file-log'

import * as API from '../services/contact-api'
import * as FollowsActions from '../actions/follows'

/**
 * @param {string} publicKey
 * @returns {(d: (a: any) => void) => void}
 */
export const follow = publicKey => dispatch => {
  dispatch(FollowsActions.beganFollow(publicKey))

  API.Actions.follow(publicKey)
    .then(() => {
      dispatch(FollowsActions.finishedFollow(publicKey))
    })
    .catch(e => {
      ToastAndroid.show(`Couldn't follow: ${e.message}`, 800)
      Logger.log(`Couldn't unfollow: ${e.message}`)
      dispatch(FollowsActions.followError(publicKey))
    })
}

/**
 * @param {string} publicKey
 * @returns {(d: (a: any) => void) => void}
 */
export const unfollow = publicKey => dispatch => {
  dispatch(FollowsActions.beganUnfollow(publicKey))

  API.Actions.unfollow(publicKey)
    .then(() => {
      dispatch(FollowsActions.finishedUnfollow(publicKey))
    })
    .catch(e => {
      ToastAndroid.show(`Couldn't unfollow: ${e.message}`, 800)
      Logger.log(`Couldn't unfollow: ${e.message}`)
      dispatch(FollowsActions.unfollowError(publicKey))
    })
}

/**
 * @returns {(d: (a: any) => void) => void}
 */
export const fetchFollows = () => async dispatch => {
  const res = await Http.get('/api/gun/follows')

  if (res.status !== 200) {
    ToastAndroid.show(
      `Could not fetch follows: ${res.data.errorMessage || 'Unknown error'}`,
      800,
    )
    Logger.log(
      `Could not fetch follows: ${res.data.errorMessage || 'Unknown error'}`,
    )
    return
  }

  dispatch(FollowsActions.receivedFollows(res.data))
}
