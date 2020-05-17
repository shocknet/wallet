import { Schema } from 'shock-common'

/**
 * @typedef {Schema.PartialUser} PartialUser
 * @typedef {Schema.User} User
 */

/**
 * @typedef {object} ReceivedUsersDataAction
 * @prop {{ usersData: PartialUser[] }} data
 * @prop {'users/receivedUsersData'} type
 */

/**
 * @param {PartialUser[]} usersData
 * @returns {ReceivedUsersDataAction}
 */
export const receivedUsersData = usersData => ({
  data: {
    usersData,
  },
  type: 'users/receivedUsersData',
})
