import { createSelector } from 'reselect'

import { State } from '../store'

const isSocketConnectedSelector = (state: State) =>
  state.connection.socketConnected
const lastPingWasLessThan10SecondsAgoSelector = (state: State) =>
  Date.now() - state.connection.lastPing < 10000

export const isOnline = createSelector(
  isSocketConnectedSelector,
  lastPingWasLessThan10SecondsAgoSelector,
  (isSocketConnected, lastPingWasLessThan10SecondsAgo) =>
    isSocketConnected && lastPingWasLessThan10SecondsAgo,
)
