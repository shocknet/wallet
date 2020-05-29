//import { Schema } from 'shock-common'

//TODO: add @typedef {Schema.Follow} Follow
/**
 * @typedef {object} Follow
 * @prop {string} user
 * @prop {boolean} private
 * @prop {'processing'|'ok'} status
 */

/**
 * @typedef {object} BeganFollowAction
 * @prop {{ publicKey: string }} data
 * @prop {'follows/beganFollow'} type
 */
/**
 * @typedef {object} FinishedFollowAction
 * @prop {{ publicKey: string }} data
 * @prop {'follows/finishedFollow'} type
 */
/**
 * @typedef {object} FollowErrorAction
 * @prop {{ publicKey: string }} data
 * @prop {'follows/followError'} type
 */
/**
 * @typedef {object} BeganUnfollowAction
 * @prop {{ publicKey: string }} data
 * @prop {'follows/beganUnfollow'} type
 */
/**
 * @typedef {object} FinishedUnfollowAction
 * @prop {{ publicKey: string }} data
 * @prop {'follows/finishedUnfollow'} type
 */
/**
 * @typedef {object} UnfollowErrorAction
 * @prop {{ publicKey: string }} data
 * @prop {'follows/unfollowError'} type
 */
/**
 * @typedef {object} ReceivedFollowAction
 * @prop {{ follows: Map<string,Follow> }} data
 * @prop {'follows/receivedFollow'} type
 */

/**
 * @typedef {BeganFollowAction|FinishedFollowAction|FollowErrorAction|BeganUnfollowAction|FinishedUnfollowAction|UnfollowErrorAction|ReceivedFollowAction} followsActions
 */

/**
 *
 * @param {string} publicKey
 * @returns {BeganFollowAction}
 */
export const beganFollow = publicKey => ({
  data: {
    publicKey,
  },
  type: 'follows/beganFollow',
})
/**
 *
 * @param {string} publicKey
 * @returns {FinishedFollowAction}
 */
export const finishedFollow = publicKey => ({
  data: {
    publicKey,
  },
  type: 'follows/finishedFollow',
})
/**
 *
 * @param {string} publicKey
 * @returns {FollowErrorAction}
 */
export const followError = publicKey => ({
  data: {
    publicKey,
  },
  type: 'follows/followError',
})
/**
 *
 * @param {string} publicKey
 * @returns {BeganUnfollowAction}
 */
export const beganUnfollow = publicKey => ({
  data: {
    publicKey,
  },
  type: 'follows/beganUnfollow',
})
/**
 *
 * @param {string} publicKey
 * @returns {FinishedUnfollowAction}
 */
export const finishedUnfollow = publicKey => ({
  data: {
    publicKey,
  },
  type: 'follows/finishedUnfollow',
})
/**
 *
 * @param {string} publicKey
 * @returns {UnfollowErrorAction}
 */
export const unfollowError = publicKey => ({
  data: {
    publicKey,
  },
  type: 'follows/unfollowError',
})
/**
 *
 * @param {Map<string,Follow>} follows
 * @returns {ReceivedFollowAction}
 */
export const receivedfollowAction = follows => ({
  data: {
    follows,
  },
  type: 'follows/receivedFollow',
})
