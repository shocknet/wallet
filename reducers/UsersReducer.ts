import produce from 'immer'
import { Schema } from 'shock-common'
import uniqBy from 'lodash/uniqBy'
import { Reducer } from 'redux'
import Logger from 'react-native-file-log'

import { Action } from '../app/actions'

type State = Record<string, Schema.User>

/**
 * Super hacky but works and does not tain the real state.
 */
let myPublicKey = ''

const INITIAL_STATE = {} as State

const reducer: Reducer<State, Action> = (
  state = INITIAL_STATE,
  action: Action,
) => {
  switch (action.type) {
    case 'users/receivedUsersData':
      return produce(state, draft => {
        action.payload.usersData.forEach(partialUser => {
          const { publicKey: pk } = partialUser

          Logger.log('Received partial user without public key???')

          if (pk) {
            draft[pk] = {
              ...Schema.createEmptyUser(pk),
              ...(draft[pk] || {}),
              ...partialUser,
            }
          }
        })
      })

    case 'chats/receivedChats':
      return produce(state, draft => {
        action.data.chats.forEach(chat => {
          const { recipientPublicKey: pk } = chat

          draft[pk] = {
            ...Schema.createEmptyUser(pk),
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
            ...Schema.createEmptyUser(pk),
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
            ...Schema.createEmptyUser(pk),
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
            ...Schema.createEmptyUser(u.publicKey),
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

    case 'me/receivedMeData':
      return produce(state, draft => {
        const { publicKey } = action.data
        myPublicKey = publicKey || myPublicKey

        if (myPublicKey) {
          if (!draft[myPublicKey]) {
            draft[myPublicKey] = Schema.createEmptyUser(myPublicKey)
          }

          Object.assign(draft[myPublicKey], action.data)
        }
      })

    case 'receivedBackfeed':
    case 'receivedFeed':
      return produce(state, draft => {
        const { posts } = action.data
        const authors = posts.map(p => p.author)
        const users = uniqBy(authors, a => a.publicKey)

        users.forEach(u => {
          draft[u.publicKey] = {
            ...Schema.createEmptyUser(u.publicKey),
            ...(draft[u.publicKey] || {}),
            ...u,
          }
        })
      })

    case 'authed':
      return produce(state, draft => {
        const { gunPublicKey } = action.data

        myPublicKey = gunPublicKey

        if (!draft[gunPublicKey]) {
          draft[gunPublicKey] = Schema.createEmptyUser(gunPublicKey)
        }
      })

    case 'myFeed/finishedFetchPage':
      return produce(state, draft => {
        const { posts } = action.data

        posts.forEach(
          ({
            author: {
              avatar,
              bio,
              displayName,
              header,
              lastSeenApp,
              lastSeenNode,
              publicKey,
            },
          }) => {
            if (!draft[publicKey]) {
              // @ts-expect-error
              draft[publicKey] = {}
            }

            draft[publicKey].avatar = avatar
            draft[publicKey].bio = bio
            draft[publicKey].displayName = displayName
            draft[publicKey].header = header
            draft[publicKey].lastSeenApp = lastSeenApp
            draft[publicKey].lastSeenNode = lastSeenNode
          },
        )
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

  return user || Schema.createEmptyUser(publicKey)
}

export default reducer
