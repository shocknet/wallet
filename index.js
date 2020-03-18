/**
 * @format
 */

import { AppRegistry, Platform, PermissionsAndroid } from 'react-native'
import moment from 'moment'
import Http from 'axios'
import Logger from 'react-native-file-log'

import { Provider } from 'react-redux'

import Loading from './app/screens/Loading'
import React from 'react'
import RNBootSplash from 'react-native-bootsplash'
// @ts-ignore
import url from 'url'

import { throttledExchangeKeyPair } from './app/actions/ConnectionActions'
import * as NavigationService from './app/services/navigation'
import * as Cache from './app/services/cache'
import * as Encryption from './app/services/encryption'
import configureStore from './store'
import { PersistGate } from 'redux-persist/integration/react'

import { ConnectionProvider } from './app/ctx/Connection'
import RootStack from './app/navigators/Root'

Logger.setTag('ShockWallet')
Logger.setFileLogEnabled(true)
Logger.setConsoleLogEnabled(__DEV__)
if (Platform.OS === 'android') {
  PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  )
  PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
  )
}

// https://github.com/moment/moment/issues/2781#issuecomment-160739129
moment.locale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s',
    s: 'just now',
    ss: '%ss',
    m: '1m',
    mm: '%dm',
    h: '1h',
    hh: '%dh',
    d: '1d',
    dd: '%dd',
    M: 'a month',
    MM: '%dM',
    y: 'a year',
    yy: '%dY',
  },
})

const nonEncryptedRoutes = [
  '/api/security/exchangeKeys',
  '/healthz',
  '/ping',
  '/api/lnd/wallet/status',
]

// Http.interceptors.response.use(
//   res => res,
//   async err => {
//     // catch reference/Cache errors
//     try {
//       if (err.response.status === 401) {
//         Socket.disconnect()
//         await Cache.writeStoredAuthData(null)
//       }
//     } catch (e) {
//       Logger.log(`Error inside response interceptor: ${e.message}`)
//     }

//     return Promise.reject(err)
//   },
// )

AppRegistry.registerComponent('shockwallet', () => ShockWallet)

/**
 * @typedef {object} State
 * @prop {boolean} ready
 */

const { persistor, store } = configureStore()

/**
 * @augments React.Component<{}, State,never>
 */
export default class ShockWallet extends React.Component {
  state = {
    ready: false,
  }

  async componentDidMount() {
    const nodeURL = await Cache.getNodeURL()
    if (nodeURL !== null) {
      Http.defaults.url = `http://${nodeURL}`
    }
    RNBootSplash.hide({ duration: 250 })
    this.setState({
      ready: true,
    })
  }

  render() {
    if (!this.state.ready) {
      return null
    }

    return (
      <Provider store={store}>
        <PersistGate loading={<Loading />} persistor={persistor}>
          <ConnectionProvider>
            <RootStack ref={NavigationService.setTopLevelNavigator} />
          </ConnectionProvider>
        </PersistGate>
      </Provider>
    )
  }
}

// Adds an Authorization token to the header before sending any request
Http.interceptors.request.use(async config => {
  try {
    const { connection } = store.getState()
    try {
      const nodeURL = await Cache.getNodeURL()
      if (config.url && config.url.indexOf('http') === -1 && nodeURL) {
        // eslint-disable-next-line require-atomic-updates
        config.baseURL = `http://${nodeURL}`
      }
    } catch (err) {
      Logger.log('Unable to retrieve base URL')
    }

    if (!config.headers.Authorization) {
      try {
        const token = await Cache.getToken()
        // eslint-disable-next-line require-atomic-updates
        config.headers.common.Authorization = `Bearer ${token}`
      } catch (err) {
        Logger.log('Unable to retrieve token')
      }
    }

    Logger.log('Device ID:', connection.deviceId)
    if (!config.headers['X-ShockWallet-Device-ID'] && connection.deviceId) {
      // eslint-disable-next-line require-atomic-updates
      config.headers.common['X-ShockWallet-Device-ID'] = connection.deviceId
    }

    /**
     * @param {number} status
     */
    Http.defaults.validateStatus = status => status < 300 || status === 304

    const path = url.parse(config.url).pathname

    if (cache.has(path)) {
      const cachedData = cache.get(path)
      // eslint-disable-next-line require-atomic-updates
      config.headers.common.ETag = cachedData.hash
    }

    if (
      connection.APIPublicKey &&
      !nonEncryptedRoutes.includes(path) &&
      config.data
    ) {
      const stringifiedData = JSON.stringify(config.data)
      const { encryptedData, encryptedKey, iv } = await Encryption.encryptData(
        stringifiedData,
        connection.APIPublicKey,
      )
      // eslint-disable-next-line require-atomic-updates
      config.data = {
        data: encryptedData,
        encryptionKey: encryptedKey,
        iv,
      }
      // @ts-ignore
      // eslint-disable-next-line require-atomic-updates
      config.originalData = stringifiedData
    }

    // Logging for Network requests
    try {
      if (config) {
        const method = config.method ? config.method.toUpperCase() : 'common'
        Logger.log('Config:', config)
        Logger.log(`---> ${method} ${config.url}`)
        Logger.log(
          'Headers:',
          config.headers
            ? JSON.stringify({
                ...config.headers.common,
                ...config.headers[method],
              })
            : 'N/A',
        )
        Logger.log(
          'Params:',
          config.params ? JSON.stringify(config.params) : 'N/A',
        )
        Logger.log('Body:', config.data ? JSON.stringify(config.data) : 'N/A')
      }
    } catch (err) {
      Logger.log(err)
    }

    return config
  } catch (err) {
    Logger.log(err && err.response ? err.response : err)
    return config
  }
})

const cache = new Map()

/**
 * @param {import('axios').AxiosResponse<any>} response
 * @returns {Promise<import('axios').AxiosResponse<any>>}
 */
const decryptResponse = async response => {
  try {
    const decryptionTime = Date.now()
    const { connection } = store.getState()
    const path = url.parse(response?.config.url).pathname
    Logger.log('[ENCRYPTION] Decrypting Path:', path)

    if (response.status === 304) {
      Logger.log('Using cached response for: ', path)
      const cachedData = cache.get(path)

      if (cachedData?.response) {
        return cachedData.response
      }
    }

    if (
      connection.APIPublicKey &&
      !nonEncryptedRoutes.includes(path) &&
      response.data.encryptedData &&
      connection.sessionId
    ) {
      const decryptedKey = await Encryption.decryptKey(
        response.data.encryptedKey,
        connection.sessionId,
      )
      const { decryptedData } = await Encryption.decryptData({
        encryptedData: response.data.encryptedData,
        key: decryptedKey,
        iv: response.data.iv,
      })
      Logger.log(`[HTTP] Decrypted data in: ${Date.now() - decryptionTime}ms`)
      const decryptedResponse = {
        ...response,
        data: JSON.parse(decryptedData),
      }
      cache.set(path, {
        hash: response.data.metadata.hash,
        response: decryptedResponse,
      })
      return decryptedResponse
    }

    if (
      path !== '/api/security/exchangeKeys' &&
      response.headers['x-session-id']
    ) {
      Logger.log('[HTTP] Exchanging Keys...')
      await throttledExchangeKeyPair({
        deviceId: connection.deviceId,
        sessionId: response.headers['x-session-id'],
        cachedSessionId: connection.sessionId,
        baseURL: response.config.baseURL,
      })(store.dispatch, store.getState, {})
    }

    return response
  } catch (err) {
    Logger.log(err)
    throw err
  }
}

// Logging for HTTP responses
Http.interceptors.response.use(
  async response => {
    const decryptedResponse = await decryptResponse(response)

    try {
      if (decryptedResponse && decryptedResponse.status !== undefined) {
        const method = decryptedResponse.config.method
          ? decryptedResponse.config.method
          : 'common'
        Logger.log(
          `<--- ${method.toUpperCase()} ${decryptedResponse.config.url} (${
            decryptedResponse.status
          })`,
        )
        Logger.log(
          'Server Headers:',
          decryptedResponse.headers
            ? JSON.stringify(decryptedResponse.headers)
            : null,
        )
        Logger.log(
          'Response:',
          decryptedResponse.data
            ? JSON.stringify(decryptedResponse.data)
            : null,
        )
      }
      return decryptedResponse
    } catch (err) {
      Logger.log(err)
      return decryptedResponse
    }
  },
  async error => {
    if (error && error.response) {
      const decryptedResponse = await decryptResponse(error.response)

      if (typeof decryptedResponse.data === 'string') {
        decryptedResponse.data = JSON.parse(decryptedResponse.data)
      }

      const { connection } = store.getState()

      const encryptionErrors = ['deviceId']

      if (
        error.response.status === 401 &&
        !encryptionErrors.includes(decryptedResponse.data.field)
      ) {
        await Cache.writeStoredAuthData(null)
      }

      if (encryptionErrors.includes(decryptedResponse.data.field)) {
        await throttledExchangeKeyPair({
          deviceId: connection.deviceId,
          sessionId: decryptedResponse.headers['x-session-id'],
          cachedSessionId: connection.sessionId,
          baseURL: decryptedResponse.config.baseURL,
        })(store.dispatch, store.getState, {})
        // eslint-disable-next-line require-atomic-updates
        decryptedResponse.config.headers['x-shockwallet-device-id'] =
          connection.deviceId

        if (
          // @ts-ignore
          decryptedResponse.config.originalData
        ) {
          // @ts-ignore
          const response = await Http[
            decryptedResponse.config.method?.toLowerCase() ?? 'get'
          ](
            decryptedResponse.config.url,
            // @ts-ignore
            JSON.parse(decryptedResponse.config.originalData),
            decryptedResponse.config.headers,
          )
          return Promise.resolve(response)
        }
      }

      return Promise.reject({ ...error, response: decryptedResponse })
    }

    return Promise.reject(error)
  },
)
