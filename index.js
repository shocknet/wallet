/**
 * @format
 */
import { AppRegistry, View, StyleSheet, ToastAndroid } from 'react-native'
import moment from 'moment'
import Http from 'axios'

import once from 'lodash/once'
import debounce from 'lodash/debounce'

import React, { Component } from 'react'

import RootStack, { setup as rootStackSetup } from './app/navigators/Root'

import Loading from './app/screens/Loading'
import RNBootSplash from 'react-native-bootsplash'

import * as NavigationService from './app/services/navigation'
import * as Cache from './app/services/cache'
import * as ContactApi from './app/services/contact-api'
import WithConnWarning from './app/components/WithConnWarning'
import ConnectToNode from './app/screens/ConnectToNode'
import QRScanner from './app/screens/QRScanner'
import { isValidURL } from './app/services/utils'

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

AppRegistry.registerComponent('shockwallet', () => ShockWallet)

/**
 * @typedef {object} State
 * @prop {boolean} fetchingCache
 * @prop {boolean} nodeIPSet
 * @prop {string|null} tryingURL
 * @prop {boolean} scanningQR
 */

/**
 * @augments React.Component<{}, State, never>
 */
export default class ShockWallet extends Component {
  /** @type {State} */
  state = {
    fetchingCache: true,
    nodeIPSet: false,
    tryingURL: null,
    scanningQR: false,
  }

  connectToNodeIP = async () => {
    try {
      const { tryingURL: url } = this.state
      ContactApi.Socket.connect(`http://${url}`)

      /** @type {boolean} */
      const connected = await Promise.race([
        new Promise(res => {
          ContactApi.Events.onConnection(
            debounce(
              once(conn => {
                res(conn)
              }),
              300,
            ),
          )
        }),
        new Promise(res => {
          setTimeout(() => {
            res(false)
          }, 5000)
        }),
      ])

      if (connected) {
        await Cache.writeNodeURLOrIP(url)

        const storedAuthData = await Cache.getStoredAuthData()
        // Sets a base URL for all requests so we won't have to worry
        // concatenating it every time we want to make a request.
        Http.defaults.baseURL = url ? `http://${url}` : undefined

        if (storedAuthData !== null && storedAuthData.nodeIP === url) {
          ContactApi.Events.initAuthData(storedAuthData.authData)

          // Adds a default Authorization header for all requests
          if (storedAuthData.authData) {
            Http.defaults.headers.common.Authorization = `${storedAuthData.authData.token}`
          }
        }

        ContactApi.Events.setupEvents()

        this.setState({
          nodeIPSet: true,
        })
      } else {
        // avoid reconnection attempts, unsubscribe event listeners
        ContactApi.Socket.disconnect()
      }
    } catch (e) {
      // avoid reconnection attempts, unsubscribe event listeners
      ContactApi.Socket.disconnect()

      ToastAndroid.show(
        typeof e === 'object' && e !== null
          ? `Could not connect: ${e.message}`
          : 'Could not connect (unknown error)',
        800,
      )
    } finally {
      this.setState({
        tryingURL: null,
      })
    }
  }

  async componentDidMount() {
    try {
      const nodeURL = await Cache.getNodeURL()

      if (typeof nodeURL === 'string') {
        this.setState({
          tryingURL: nodeURL,
        })
      }

      this.setState({
        fetchingCache: false,
      })
    } catch (err) {
      console.error(err)
    } finally {
      RNBootSplash.hide({ duration: 250 })
    }
  }

  /**
   * @param {never} _
   * @param {State} prevState
   */
  async componentDidUpdate(_, prevState) {
    const navigationContainerComponentRefExists =
      !prevState.nodeIPSet && this.state.nodeIPSet

    if (navigationContainerComponentRefExists) {
      this.setState({
        fetchingCache: true,
      })
      await rootStackSetup()
      this.setState({
        fetchingCache: false,
      })
    }

    const urlToTry =
      prevState.tryingURL === null && this.state.tryingURL !== null

    if (!urlToTry) {
      return
    }

    this.connectToNodeIP()
  }

  /**
   * @private
   * @type {import('react-navigation').NavigationContainerProps['onNavigationStateChange']}
   * @returns {void}
   */
  onNavChange = (_, newState) => {
    this.getCurrentRouteName(newState)
  }

  /**
   * @private
   * @param {import('react-navigation').NavigationState|import('react-navigation').NavigationRoute} navStateOrNavRoute
   * @returns {void}
   */
  getCurrentRouteName = navStateOrNavRoute => {
    // eslint-disable-next-line no-prototype-builtins
    if (navStateOrNavRoute.hasOwnProperty('index')) {
      this.getCurrentRouteName(
        navStateOrNavRoute.routes[navStateOrNavRoute.index],
      )
    } else {
      const currentRoute =
        // @ts-ignore
        /** @type {string} */ (navStateOrNavRoute.routeName)

      NavigationService.setCurrentRoute(currentRoute)
    }
  }

  /**
   * @private
   * @param {import('react-navigation').NavigationContainerComponent|null} ref
   * @returns {void}
   */
  onRef = ref => {
    NavigationService.setTopLevelNavigator(ref)
  }

  /**
   * @private
   * @param {string} urlOrIP
   */
  onPressConnect = urlOrIP => {
    this.setState({
      tryingURL: isValidURL(urlOrIP)
        ? urlOrIP
        : urlOrIP + ':' + Cache.DEFAULT_PORT,
    })
  }

  onPressUseShockCloud = () => {}

  toggleQRScreen = () => {
    const { scanningQR } = this.state
    this.setState({
      scanningQR: !scanningQR,
    })
  }

  render() {
    if (this.state.nodeIPSet && !this.state.fetchingCache) {
      return (
        <WithConnWarning>
          <RootStack
            onNavigationStateChange={this.onNavChange}
            ref={this.onRef}
          />
        </WithConnWarning>
      )
    }

    if (this.state.fetchingCache || this.state.tryingURL) {
      return (
        <View style={styles.flex}>
          <Loading />

          {/* <ShockDialog
            message={this.state.err}
            onRequestClose={this.dismissDialog}
            visible={!!this.state.err}
          /> */}
        </View>
      )
    }

    if (this.state.tryingURL === null && !this.state.scanningQR) {
      return (
        <View style={styles.flex}>
          <ConnectToNode
            disableControls={!!this.state.tryingURL}
            onPressConnect={this.onPressConnect}
            onPressUseShockcloud={this.onPressUseShockCloud}
            toggleQRScreen={this.toggleQRScreen}
          />

          {/* <ShockDialog
            message={this.state.err}
            onRequestClose={this.dismissDialog}
            visible={!!this.state.err}
          /> */}
        </View>
      )
    }

    if (this.state.scanningQR) {
      return (
        <View style={styles.flex}>
          <QRScanner
            connectToNodeIP={this.connectToNodeIP}
            toggleQRScreen={this.toggleQRScreen}
          />

          {/* <ShockDialog
            message={this.state.err}
            onRequestClose={this.dismissDialog}
            visible={!!this.state.err}
          /> */}
        </View>
      )
    }

    return <Loading />
  }
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
})
