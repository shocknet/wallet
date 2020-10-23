import { createStore, applyMiddleware, Store as ReduxStore } from 'redux'
import { persistStore, persistCombineReducers } from 'redux-persist'
import * as Common from 'shock-common'
import createSagaMiddleware from 'redux-saga'
// @ts-expect-error
import createSensitiveStorage from 'redux-persist-sensitive-storage'
import thunk from 'redux-thunk'

import SocketManager from '../services/socket'
import reducers, { State } from './reducers'
import { Action as _Action } from './actions'

import rootSaga from './sagas'

const sagaMiddleware = createSagaMiddleware()

export type Action = _Action
export type Store = ReduxStore<State, _Action>

const storage = createSensitiveStorage({
  keychainService: 'ShockWalletKeychain',
  sharedPreferencesName: 'ShockWalletKeyStore',
})

const config = {
  key: 'root',
  // blacklist: ['connection'],
  // Easily handle different gun / ligtning identities
  blacklist: ['follows', 'feed', 'invoicesListed', 'tips', 'paymentsV2s'],
  storage,
}

// @ts-expect-error TODO
const persistedReducers = persistCombineReducers(config, reducers)

// eslint-disable-next-line init-declarations
let store: Store

export default () => {
  // TODO: Fix typings for createStore()

  store = createStore(persistedReducers, applyMiddleware(thunk, sagaMiddleware))

  const persistor = persistStore(store)

  SocketManager.setStore(store)

  sagaMiddleware.run(rootSaga)

  return { persistor, store }
}

export const getStore = () => {
  if (!store) {
    throw new Error(`Called Store.getStore() without first setting it up.`)
  }

  return store
}

export const Selectors = {
  Follows: {
    getFollow(state: State, publicKey: string): Common.Schema.Follow | null {
      return state.follows[publicKey] || null
    },
  },
}
