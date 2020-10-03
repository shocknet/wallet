import { Schema } from 'shock-common'
import { createSelector } from 'reselect'

import { State } from '../../reducers'

const getUsers = (state: State) => state.users
const getPublicKey = (_: State, props: Schema.HasPublicKey) => props.publicKey

export const makeGetUser = () =>
  createSelector<
    State,
    Schema.HasPublicKey,
    State['users'],
    string,
    Schema.User
  >(
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
