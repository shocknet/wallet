import produce from 'immer'

/**
 * @typedef {import('../app/actions').Action} Action
 * @typedef {import('../app/schema').User} User
 */

/**
 * @typedef {Record<string, User|undefined>} State
 */

/** @type {State} */
const INITIAL_STATE = {}

/**
 * @param {string} publicKey
 * @returns {User}
 */
const createEmptyUser = publicKey => ({
  avatar: null,
  bio: null,
  displayName: null,
  lastSeenApp: 0,
  lastSeenNode: 0,
  publicKey,
})

/**
 * @param {State} state
 * @param {Action} action
 * @returns {State}
 */
const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'users/receivedUsersData':
      return produce(state, draft => {
        action.data.usersData.forEach(partialUser => {
          const { publicKey: pk } = partialUser

          draft[pk] = {
            ...createEmptyUser(pk),
            ...(draft[pk] || {}),
            ...partialUser,
          }
        })
      })

    case 'chats/receivedChats':
      return produce(state, draft => {
        action.data.chats.forEach(chat => {
          const { recipientPublicKey: pk } = chat

          draft[pk] = {
            ...createEmptyUser(pk),
            ...(draft[pk] || {}),
            avatar: chat.recipientAvatar,
            displayName: chat.recipientDisplayName,
            lastSeenApp: chat.lastSeenApp || 0,
          }
        })
      })

    case 'requests/received':
      return produce(state, draft => {
        action.data.forEach(receivedRequest => {
          const { pk } = receivedRequest

          draft[pk] = {
            ...createEmptyUser(pk),
            ...(draft[pk] || {}),
            avatar: receivedRequest.avatar,
            displayName: receivedRequest.displayName,
          }
        })
      })

    case 'requests/sent':
      return produce(state, draft => {
        action.data.forEach(sentRequest => {
          const { pk } = sentRequest

          draft[pk] = {
            ...createEmptyUser(pk),
            ...(draft[pk] || {}),
            avatar: sentRequest.avatar,
            displayName: sentRequest.displayName,
          }
        })
      })

    default:
      return state
  }
}

/**
 * @param {State} users
 * @returns {State}
 */
export const selectAllUsers = users => users

/**
 * @param {State} users
 * @param {{ publicKey: string }} props
 * @returns {User}
 */
export const selectUser = (users, { publicKey }) => {
  const user = users[publicKey]

  return user || createEmptyUser(publicKey)
}

export default reducer
