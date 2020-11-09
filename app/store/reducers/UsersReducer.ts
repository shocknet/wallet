import produce from 'immer'
import { Schema } from 'shock-common'
import { Reducer } from 'redux'
import Logger from 'react-native-file-log'

import { Action } from '../actions'

type State = Record<string, Schema.User>

const INITIAL_STATE = {} as State

const reducer: Reducer<State, Action> = (
  state = INITIAL_STATE,
  action: Action,
) => {
  try {
    switch (action.type) {
      case 'users/receivedSingleUserData':
        return produce(state, draft => {
          const { singleUserData } = action.payload

          draft[singleUserData.publicKey] = {
            ...Schema.createEmptyUser(singleUserData.publicKey),
            ...(draft[singleUserData.publicKey] || {}),
            ...singleUserData,
          }
        })

      case 'users/receivedUsersData':
        return produce(state, draft => {
          action.payload.usersData.forEach(partialUser => {
            const { publicKey: pk } = partialUser

            if (!pk) {
              Logger.log('Received partial user without public key???')
              return
            }

            if (pk) {
              draft[pk] = {
                ...Schema.createEmptyUser(pk),
                ...(draft[pk] || {}),
                ...partialUser,
              }
            }
          })
        })

      case 'chats/receivedChats': {
        return produce(state, draft => {
          action.data.chats.forEach(chat => {
            const { recipientPublicKey: pk } = chat

            if (!draft[pk]) draft[pk] = Schema.createEmptyUser(pk)
          })
        })
      }

      case 'requests/received':
        return produce(state, draft => {
          action.data.forEach(receivedRequest => {
            const { pk } = receivedRequest

            if (!draft[pk]) draft[pk] = Schema.createEmptyUser(pk)
          })
        })

      case 'requests/sent':
        return produce(state, draft => {
          action.data.forEach(sentRequest => {
            const { pk } = sentRequest

            if (!draft[pk]) draft[pk] = Schema.createEmptyUser(pk)
          })
        })

      case 'authed':
        return produce(state, draft => {
          const { gunPublicKey } = action.data

          if (!draft[gunPublicKey]) {
            draft[gunPublicKey] = Schema.createEmptyUser(gunPublicKey)
          }
        })

      case 'follows/finishedFollow':
        return produce(state, draft => {
          const { publicKey } = action.data

          if (!draft[publicKey]) {
            draft[publicKey] = Schema.createEmptyUser(publicKey)
          }
        })

      case 'follows/receivedFollow':
        return produce(state, draft => {
          const { follows } = action.data

          for (const publicKey of Object.keys(follows)) {
            if (!draft[publicKey]) {
              draft[publicKey] = Schema.createEmptyUser(publicKey)
            }
          }
        })

      default:
        return state
    }
  } catch (e) {
    Logger.log(`Error inside users reducer: ${e.message}`)
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
