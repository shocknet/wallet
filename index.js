/**
 * @format
 */
import { AppRegistry } from 'react-native'
import moment from 'moment'
import Http from 'axios'
import React from 'react'
import RNBootSplash from 'react-native-bootsplash'

import { Socket } from './app/services/contact-api'
import * as NavigationService from './app/services/navigation'
import * as Cache from './app/services/cache'
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
      <ConnectionProvider>
        <RootStack ref={NavigationService.setTopLevelNavigator} />
      </ConnectionProvider>
    )
  }
}
