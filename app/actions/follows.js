//import { Schema } from 'shock-common'

//TODO: add @typedef {Schema.Follow} Follow
/**
 * @typedef {object} Follow
 * @prop {string} user
 * @prop {boolean} private
 * @prop {'processing'|'ok'} status
 */

/**
 * @typedef {object} beganFollowAction
 * @prop {{ publicKey: string }} data
 * @prop {'follows/beganFollow'} type
 */
/**
 * @typedef {object} finishedFollowAction
 * @prop {{ publicKey: string }} data
 * @prop {'follows/finishedFollow'} type
 */
/**
 * @typedef {object} followErrorAction
 * @prop {{ publicKey: string }} data
 * @prop {'follows/followError'} type
 */
/**
 * @typedef {object} finishedUnfollowAction
 * @prop {{ publicKey: string }} data
 * @prop {'follows/finishedUnfollow'} type
 */
/**
 * @typedef {object} receivedfollowAction
 * @prop {{ follows: Map<string,Follow> }} data
 * @prop {'follows/receivedFollow'} type
 */

/**
 * @typedef {beganFollowAction|finishedFollowAction|followErrorAction|finishedUnfollowAction|receivedfollowAction} followsActions
 */

/**
 *
 * @param {string} publicKey
 * @returns {beganFollowAction}
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
 * @returns {finishedFollowAction}
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
 * @returns {followErrorAction}
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
 * @returns {finishedUnfollowAction}
 */
export const finishedUnfollow = publicKey => ({
  data: {
    publicKey,
  },
  type: 'follows/finishedUnfollow',
})
/**
 *
 * @param {Map<string,Follow>} follows
 * @returns {receivedfollowAction}
 */
export const receivedfollowAction = follows => ({
  data: {
    follows,
  },
  type: 'follows/receivedFollow',
})
