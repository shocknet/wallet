import { createStore, applyMiddleware } from 'redux'
import { persistStore, persistCombineReducers } from 'redux-persist'
// @ts-ignore
import createSensitiveStorage from 'redux-persist-sensitive-storage'
import thunk from 'redux-thunk'
import { setStore } from '../app/services/contact-api/socket'
import SocketManager from '../app/services/socket'
import reducers from '../reducers'
import * as Common from 'shock-common'

const storage = createSensitiveStorage({
  keychainService: 'ShockWalletKeychain',
  sharedPreferencesName: 'ShockWalletKeyStore',
})

const config = {
  key: 'root',
  // blacklist: ['connection'],
  blacklist: ['follows'],
  storage,
}

// @ts-ignore TODO
const persistedReducers = persistCombineReducers(config, reducers)

export default () => {
  const store = createStore(persistedReducers, applyMiddleware(thunk))
  const persistor = persistStore(store)
  setStore(store)
  SocketManager.setStore(store)

  let lastState = store.getState().follows
  store.subscribe(() => {
    const newState = store.getState().follows

    if (newState !== lastState) {
      console.warn(newState)
    }
  })

  return { persistor, store }
}

/**
 * @typedef {object} State
 * @prop {ReturnType<typeof reducers.users>} users
 * @prop {ReturnType<typeof reducers['follows']>} follows
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
