import { createSelector } from 'reselect'

import { State } from '../../reducers'

const isSocketConnectedSelector = (state: State) =>
  state.connection.socketConnected
const lastPingWasLessThan10SecondsAgoSelector = (state: State) =>
  Date.now() - state.connection.lastPing < 6000

export const isOnline = createSelector(
  isSocketConnectedSelector,
  lastPingWasLessThan10SecondsAgoSelector,
  (isSocketConnected, lastPingWasLessThan10SecondsAgo) =>
    isSocketConnected && lastPingWasLessThan10SecondsAgo,
)
