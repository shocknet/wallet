import { createStore, applyMiddleware } from 'redux'
import { persistStore, persistCombineReducers } from 'redux-persist'
// @ts-ignore
import createSensitiveStorage from 'redux-persist-sensitive-storage'
import thunk from 'redux-thunk'
import { setStore } from '../app/services/contact-api/socket'
import SocketManager from '../app/services/socket'
import reducers from '../reducers'

import * as Common from 'shock-common'
import createSagaMiddleware from 'redux-saga'
const sagaMiddleware = createSagaMiddleware()

/**
 * @typedef {import('../app/actions').Action} Action
 */

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

/**
 * @type {import('redux').Store<State, Action>}
 */
// eslint-disable-next-line init-declarations
let store

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

/**
 * @typedef {object} State
 * @prop {ReturnType<typeof reducers.users>} users
 * @prop {ReturnType<typeof reducers['follows']>} follows
 * @prop {ReturnType<typeof reducers['feed']>} feed
 * @prop {ReturnType<typeof reducers['tips']>} tips
 * @prop {any} connection
 */

export const Selectors = {
  Follows: {
    /**
     * @param {State} state
     * @param {string} publicKey
     * @returns {Common.Schema.Follow | null}
     */
    getFollow(state, publicKey) {
      return state.follows[publicKey] || null
    },
  },
}
