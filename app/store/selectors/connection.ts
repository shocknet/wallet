import { State } from '../reducers'

export const isOnline = (state: State): boolean =>
  Date.now() - state.connection.lastPing < 6000
