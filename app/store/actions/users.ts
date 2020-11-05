import { Schema } from 'shock-common'

export const receivedUsersData = (usersData: Schema.PartialUser[]) =>
  ({
    payload: {
      usersData,
    },
    type: 'users/receivedUsersData',
  } as const)

export const receivedSingleUserData = (
  singleUserData: Schema.PartialUser & Schema.HasPublicKey,
) =>
  ({
    payload: {
      singleUserData,
    },
    type: 'users/receivedSingleUserData',
  } as const)

export type UsersAction =
  | ReturnType<typeof receivedUsersData>
  | ReturnType<typeof receivedSingleUserData>
