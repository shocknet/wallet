/**
 * @typedef {import('../schema').PartialUser} PartialUser
 * @typedef {import('../schema').User} User
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
