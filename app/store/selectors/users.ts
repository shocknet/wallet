import { Schema } from 'shock-common'
import { createSelector } from 'reselect'

import { State } from '../reducers'

import { getMyPublicKey } from './auth'
import { getFollowedPublicKeys } from './follows'

export const getUsers = (state: State) => state.users
const getPublicKey = (_: State, props: string) => props
export const getMe = (state: State) =>
  state.users[getMyPublicKey(state)] ||
  Schema.createEmptyUser(getMyPublicKey(state))

export const makeGetUser = () =>
  createSelector<State, string, State['users'], string, Schema.User>(
    getUsers,
    getPublicKey,
    (users, publicKey) => {
      const maybeUser = users[publicKey]

      if (maybeUser) {
        return users[publicKey]
      }

      return Schema.createEmptyUser(publicKey)
    },
  )

export const selectUser = (state: State, publicKey: string) =>
  state.users[publicKey]

export const getAllOtherPublicKeys = createSelector<
  State,
  State['users'],
  string,
  string[]
>(
  getUsers,
  getMyPublicKey,
  (users, myPublicKey) => {
    return Object.keys(users).filter(publicKey => publicKey !== myPublicKey)
  },
)

export const getAllPublicKeys = createSelector<State, State['users'], string[]>(
  getUsers,
  users => {
    return Object.keys(users)
  },
)

export const getFollowedUsers = createSelector<
  State,
  State['users'],
  string[],
  Schema.User[]
>(
  getUsers,
  getFollowedPublicKeys,
  (users, publicKeys) => {
    return Object.values(users).filter(u => publicKeys.includes(u.publicKey))
  },
)
