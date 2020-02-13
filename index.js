/**
 * @format
 */

import { AppRegistry } from 'react-native'
import moment from 'moment'
import Http from 'axios'

import { Provider } from 'react-redux'

import Loading from './app/screens/Loading'
import React from 'react'
import RNBootSplash from 'react-native-bootsplash'

import { Socket } from './app/services/contact-api'
import { exchangeKeyPair } from './app/actions/ConnectionActions'
import * as NavigationService from './app/services/navigation'
import * as Cache from './app/services/cache'
import * as Encryption from './app/services/encryption'
import configureStore from './store'
import { PersistGate } from 'redux-persist/integration/react'

import { ConnectionProvider } from './app/ctx/Connection'
import RootStack from './app/navigators/Root'

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
//       console.warn(`Error inside response interceptor: ${e.message}`)
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
    console.log('Interceptor running', config.url)
    const { connection } = store.getState()
    try {
      const nodeURL = await Cache.getNodeURL()
      if (config.url && config.url.indexOf('http') === -1 && nodeURL) {
        // eslint-disable-next-line require-atomic-updates
        config.baseURL = `http://${nodeURL}`
      }
    } catch (err) {
      console.log('Unable to retrieve base URL')
    }
    if (!config.headers.Authorization) {
      try {
        const token = await Cache.getToken()
        // eslint-disable-next-line require-atomic-updates
        config.headers.common.Authorization = `Bearer ${token}`
      } catch (err) {
        console.log('Unable to retrieve token')
      }
    }

    console.log('Device ID:', connection.deviceId)
    if (!config.headers['X-ShockWallet-Device-ID'] && connection.deviceId) {
      // eslint-disable-next-line require-atomic-updates
      config.headers.common['X-ShockWallet-Device-ID'] = connection.deviceId
    }

    const path =
      config.url && config.baseURL ? config.url.replace(config.baseURL, '') : ''

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
    }

    // Logging for Network requests
    try {
      if (config) {
        const method = config.method ? config.method.toUpperCase() : 'common'
        console.log('Config:', config)
        console.log(`---> ${method} ${config.url}`)
        console.log(
          'Headers:',
          config.headers
            ? JSON.stringify({
                ...config.headers.common,
                ...config.headers[method],
              })
            : 'N/A',
        )
        console.log(
          'Params:',
          config.params ? JSON.stringify(config.params) : 'N/A',
        )
        console.log('Body:', config.data ? JSON.stringify(config.data) : 'N/A')
      }
    } catch (err) {
      console.error(err)
    }

    return config
  } catch (err) {
    console.log(err && err.response ? err.response : err)
    return config
  }
})

/**
 * @param {import('axios').AxiosResponse<any>} response
 * @returns {Promise<import('axios').AxiosResponse<any>>}
 */
const decryptResponse = async response => {
  try {
    const decryptionTime = Date.now()
    const { connection } = store.getState()
    const path =
      response.config && response.config.url && response.config.baseURL
        ? response.config.url.replace(response.config.baseURL, '')
        : ''
    console.log('Path:', path)

    if (
      connection.APIPublicKey &&
      !nonEncryptedRoutes.includes(path) &&
      response.data.encryptedData &&
      connection.sessionId
    ) {
      console.log('Decryptable route!')
      const decryptedKey = await Encryption.decryptKey(
        response.data.encryptedKey,
        connection.sessionId,
      )
      console.log('decryptedKey:', decryptedKey)
      const { decryptedData } = await Encryption.decryptData({
        encryptedData: response.data.encryptedData,
        key: decryptedKey,
        iv: response.data.iv,
      })
      console.log('API Public Key:', connection.APIPublicKey)
      console.log('Decrypted data:', decryptedData)
      console.log(`Decrypted data in: ${Date.now() - decryptionTime}ms`)
      return {
        ...response,
        data: JSON.parse(decryptedData),
      }
    } else if (
      path !== '/api/security/exchangeKeys' &&
      response.headers['x-session-id']
    ) {
      console.log('Exchanging Keys...')
      await exchangeKeyPair({
        deviceId: connection.deviceId,
        sessionId: response.headers['x-session-id'],
        cachedSessionId: connection.sessionId,
        baseURL: response.config.baseURL,
      })(store.dispatch, store.getState, {})
    }

    return response
  } catch (err) {
    console.error(err)
    throw err
  }
}

// Logging for HTTP responses
Http.interceptors.response.use(
  async response => {
    console.log('Encrypted Response:', response.data)
    const decryptedResponse = await decryptResponse(response)

    try {
      if (decryptedResponse && decryptedResponse.status !== undefined) {
        const method = decryptedResponse.config.method
          ? decryptedResponse.config.method
          : 'common'
        console.log(
          `<--- ${method.toUpperCase()} ${decryptedResponse.config.url} (${
            decryptedResponse.status
          })`,
        )
        console.log(
          'Response:',
          decryptedResponse.data
            ? JSON.stringify(decryptedResponse.data)
            : null,
        )
        console.log(
          'Server Headers:',
          decryptedResponse.headers
            ? JSON.stringify(decryptedResponse.headers)
            : null,
        )
      }
      return decryptedResponse
    } catch (err) {
      console.error(err)
      return decryptedResponse
    }
  },
  async error => {
    console.log('Response error!', JSON.stringify(error))
    if (error && error.response) {
      if (error.response.status === 401) {
        Socket.disconnect()
        await Cache.writeStoredAuthData(null)
      }

      const decryptedResponse = await decryptResponse(error.response)
      console.log('decryptedResponse:', decryptedResponse)

      try {
        if (decryptedResponse) {
          const method = decryptedResponse.config.method
            ? decryptedResponse.config.method
            : 'GET'
          console.log('Response:', decryptedResponse)
          if (decryptedResponse.status !== undefined) {
            console.log(
              `<--- ${method.toUpperCase()} ${decryptedResponse.config.url} (${
                decryptedResponse.status
              })`,
            )
            console.log(
              'Response:',
              decryptedResponse.data
                ? JSON.stringify(decryptedResponse.data)
                : null,
            )
            console.log(
              'Server Headers:',
              decryptedResponse.headers
                ? JSON.stringify(decryptedResponse.headers)
                : null,
            )
          }
        }
        return Promise.reject({ ...error, response: decryptedResponse })
      } catch (err) {
        console.error(err)
        return Promise.reject({ ...error, response: decryptedResponse })
      }
    }

    return Promise.reject(error)
  },
)
