import { State } from '../reducers'

import { isOnline } from './connection'
import { isAuth } from './auth'

export * from './connection'
export * from './invoices'
export * from './payments'
export * from './tx'
export * from './users'
export * from './chats'
export * from './chain-txs'
export * from './tips'
export * from './auth'
export * from './posts'
export * from './follows'
export * from './contact'
export * from './wallet'
export * from './shared-posts'
export * from './mediaLib'

export const isReady = (state: State) =>
  isOnline(state) && isAuth(state) && !!state.auth.host

/**
 * For use inside sagas, allows typing of the return value from the select
 * effect.
 * @param state
 */
export const getStateRoot = (state: State) => state
