//import { Schema } from 'shock-common'
import { Follows } from '../thunk'

//TODO: add @typedef {Schema.Follow} Follow
/**
 * @typedef {object} Follow
 * @prop {string} user
 * @prop {boolean} private
 * @prop {'processing'|'ok'|'error'} status
 * @prop {string|null} err
 */

/**
 * @typedef {object} followAction
 * @prop {{ followData: Follow }} data
 * @prop {'follow/follow'} type
 */
/**
 * @typedef {object} unfollowAction
 * @prop {{ unfollowData: Follow }} data
 * @prop {'follow/unfollow'} type
 */

/**
 *
 * @param {string} recipientPublicKey
 */
export const follow = recipientPublicKey => {
  return Follows.followThunk(recipientPublicKey)
}

/*
/**
 * @param {Follow} followData
 * @returns {followAction}
 
export const follow = followData => ({
  data: {
    followData,
  },
  type: 'follow/follow',
})


 * @param {Follow} unfollowData
 * @returns {unfollowAction}
 
export const unfollow = unfollowData => ({
  data: {
    unfollowData,
  },
  type: 'follow/unfollow',
})
*/
