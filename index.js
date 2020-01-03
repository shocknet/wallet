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
import * as NavigationService from './app/services/navigation'
import * as Cache from './app/services/cache'
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

Http.interceptors.response.use(
  res => res,
  async err => {
    // catch reference/Cache errors
    try {
      if (401 === err.response.status) {
        Socket.disconnect()
        await Cache.writeStoredAuthData(null)
      }
    } catch (e) {
      console.warn(`Error inside response interceptor: ${e.message}`)
    }

    return err
  },
)

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
    console.log('Interceptor running')
    if (!config.headers.Authorization) {
      const { nodeURL, token } = await Cache.getNodeURLTokenPair()

      // eslint-disable-next-line require-atomic-updates
      config.baseURL = `http://${nodeURL}`
      // eslint-disable-next-line require-atomic-updates
      config.headers.common.Authorization = `Bearer ${token}`
    }

    return config
  } catch (err) {
    console.log(err ? err.response : err)
    return config
  }
})
