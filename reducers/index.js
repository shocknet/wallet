import { persistReducer } from 'redux-persist'
// @ts-ignore
import createSensitiveStorage from 'redux-persist-sensitive-storage'
import AuthReducer from './AuthReducer'
import HistoryReducer from './HistoryReducer'
import WalletReducer from './WalletReducer'

const authStorage = createSensitiveStorage({
  keychainService: 'ShockWalletAuthKeychain',
  sharedPreferencesName: 'ShockWalletAuthKeyStore',
})

const storage = createSensitiveStorage({
  keychainService: 'ShockWalletKeychain',
  sharedPreferencesName: 'ShockWalletKeyStore',
})

const authConfig = {
  key: 'auth',
  storage: authStorage,
}

const config = {
  key: 'root',
  storage,
}

const rootReducer = {
  auth: persistReducer(authConfig, AuthReducer),
  history: persistReducer(config, HistoryReducer),
  wallet: persistReducer(config, WalletReducer),
}

export default rootReducer
