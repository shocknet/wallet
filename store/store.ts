import { createStore, applyMiddleware, Store as ReduxStore } from 'redux'
import { persistStore, persistCombineReducers } from 'redux-persist'
import * as Common from 'shock-common'
import createSagaMiddleware from 'redux-saga'
// @ts-ignore
import createSensitiveStorage from 'redux-persist-sensitive-storage'
import thunk from 'redux-thunk'

import { setStore } from '../app/services/contact-api/socket'
import SocketManager from '../app/services/socket'
import reducers, { State } from '../reducers'
import { Action as _Action } from '../app/actions'

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
  blacklist: ['follows', 'feed'],
  storage,
}

// @ts-ignore TODO
const persistedReducers = persistCombineReducers(config, reducers)

// eslint-disable-next-line init-declarations
let store: Store

export default () => {
  // TODO: Fix typings for createStore()
  // @ts-ignore
  store = createStore(persistedReducers, applyMiddleware(thunk, sagaMiddleware))
  // @ts-ignore
  const persistor = persistStore(store)
  // @ts-ignore
  setStore(store)
  // @ts-ignore
  SocketManager.setStore(store)

  sagaMiddleware.run(Common.Store.rootSaga)

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
