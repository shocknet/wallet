import { createStore, applyMiddleware } from 'redux'
import { persistStore, persistCombineReducers } from 'redux-persist'
// @ts-ignore
import createSensitiveStorage from 'redux-persist-sensitive-storage'
import thunk from 'redux-thunk'
import { setStore } from '../app/services/contact-api/socket'
import SocketManager from '../app/services/socket'
import reducers from '../reducers'

const storage = createSensitiveStorage({
  keychainService: 'ShockWalletKeychain',
  sharedPreferencesName: 'ShockWalletKeyStore',
})

const config = {
  key: 'root',
  blacklist: ['connection'],
  storage,
}

// @ts-ignore TODO
const persistedReducers = persistCombineReducers(config, reducers)

export default () => {
  const store = createStore(persistedReducers, applyMiddleware(thunk))
  const persistor = persistStore(store)
  setStore(store)
  SocketManager.setStore(store)

  return { persistor, store }
}

/**
 * @typedef {object} State
 * @prop {ReturnType<typeof reducers.users>} users
 */
