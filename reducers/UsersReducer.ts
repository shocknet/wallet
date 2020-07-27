import produce from 'immer'
import { Schema } from 'shock-common'
import uniqBy from 'lodash/uniqBy'
import { Reducer } from 'redux'

import { Action } from '../app/actions'

type State = Record<string, Schema.User | undefined>

/** @type {State} */
const INITIAL_STATE = {}

const createEmptyUser = (publicKey: string): Schema.User => ({
  avatar: null,
  bio: null,
  displayName: null,
  lastSeenApp: 0,
  lastSeenNode: 0,
  publicKey,
})

const reducer: Reducer<State, Action> = (
  state = INITIAL_STATE,
  action: Action,
) => {
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

    case 'feedWall/finishedLoadFeed':
      return produce(state, draft => {
        /** @type {Schema.Post[]} */
        const posts = Object.values(action.data.data)
        const authors = posts.map(p => p.author)
        const users = uniqBy(authors, a => a.publicKey)

        users.forEach(u => {
          draft[u.publicKey] = {
            ...createEmptyUser(u.publicKey),
            ...(draft[u.publicKey] || {}),
            ...u,
          }
        })
      })

    case 'feed/finishedAddPost':
      return produce(state, draft => {
        const { author: user } = action.data.post

        draft[user.publicKey] = {
          ...user,
        }
      })

    default:
      return state
  }
}

/**
 * @param {State} users
 * @returns {State}
 */
export const selectAllUsers = (users: State) => users

export const selectUser = (
  users: State,
  { publicKey }: { publicKey: string },
): Schema.User => {
  const user = users[publicKey]

  return user || createEmptyUser(publicKey)
}

export default reducer
