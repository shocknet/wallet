import { Schema } from 'shock-common'

export const receivedMeData = (data: Partial<Schema.User>) =>
  ({
    type: 'me/receivedMeData',
    data,
  } as const)

export type MeAction = ReturnType<typeof receivedMeData>
