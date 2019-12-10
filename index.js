/**
 * @format
 */
import { AppRegistry, View, StyleSheet, ToastAndroid } from 'react-native'
import moment from 'moment'
import Http from 'axios'

import once from 'lodash/once'
import debounce from 'lodash/debounce'

import React, { Component } from 'react'
import { Provider } from 'react-redux'

import RootStack, { setup as rootStackSetup } from './app/navigators/Root'

import Loading from './app/screens/Loading'
import RNBootSplash from 'react-native-bootsplash'

import * as NavigationService from './app/services/navigation'
import * as Cache from './app/services/cache'
import * as ContactApi from './app/services/contact-api'
import WithConnWarning from './app/components/WithConnWarning'
import ConnectToNode from './app/screens/ConnectToNode'
import QRScanner from './app/screens/QRScanner'
import configureStore from './store'
import { PersistGate } from 'redux-persist/integration/react'

const CONTACT_SOCKET_PORT = 9835

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
 * @prop {string|null} tryingIP
 * @prop {boolean} scanningQR
 */

const { persistor, store } = configureStore()

/**
 * @augments React.Component<{}, State, never>
 */
export default class ShockWallet extends Component {
  /** @type {State} */
  state = {
    fetchingCache: true,
    nodeIPSet: false,
    tryingIP: null,
    scanningQR: false,
  }

  onNodeIPUnsub = () => {}

  /**
   * @private
   * @readonly
   * @param {string|null} ip
   * @returns {void}
   */
  onNodeIPChange = ip => {
    if (ip === null) {
      this.setState({
        nodeIPSet: false,
      })
    } else {
      this.setState({
        nodeIPSet: true,
      })
    }
  }

  connectToNodeIP = (ip = this.state.tryingIP, port = CONTACT_SOCKET_PORT) => {
    ContactApi.Socket.connect(`http://${ip}:${port}`)

    Promise.race([
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
      .then(async conn => {
        if (conn) {
          await Cache.writeNodeIP(ip)

          const storedAuthData = await Cache.getStoredAuthData()
          // Sets a base URL for all requests so we won't have to worry
          // concatenating it every time we want to make a request.
          Http.defaults.baseURL = ip ? `http://${ip}:${port}` : undefined

          if (storedAuthData !== null && storedAuthData.nodeIP === ip) {
            ContactApi.Events.initAuthData(storedAuthData.authData)

            // Adds a default Authorization header for all requests
            if (storedAuthData.authData) {
              Http.defaults.headers.common.Authorization = `${storedAuthData.authData.token}`
            }
          }

          ContactApi.Events.setupEvents()

          this.onNodeIPUnsub = Cache.onNodeIPChange(this.onNodeIPChange)

          this.setState({
            tryingIP: null,
          })
        } else {
          // avoid reconnection attempts, unsubscribe event listeners
          ContactApi.Socket.disconnect()

          this.setState({
            tryingIP: null,
          })
        }
      })
      .catch(e => {
        console.warn('error')
        // avoid reconnection attempts, unsubscribe event listeners
        ContactApi.Socket.disconnect()

        this.setState({
          tryingIP: null,
        })

        ToastAndroid.show(
          typeof e === 'object' && e !== null
            ? `Could not connect: ${e.message}`
            : 'Could not connect (unknown error)',
          800,
        )
      })
  }

  async componentDidMount() {
    try {
      const nodeIP = await Cache.getNodeIP()

      if (typeof nodeIP === 'string') {
        this.setState({
          tryingIP: nodeIP,
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

  componentWillUnmount() {
    this.onNodeIPUnsub()
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

    const ipToTry = prevState.tryingIP === null && this.state.tryingIP !== null

    if (!ipToTry) {
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
   * @param {string} ip
   */
  onPressConnect = ip => {
    this.setState({
      tryingIP: ip,
    })
  }

  onPressUseShockCloud = () => {}

  toggleQRScreen = () => {
    const { scanningQR } = this.state
    this.setState({
      scanningQR: !scanningQR,
    })
  }

  renderContent = () => {
    const { nodeIPSet, fetchingCache, tryingIP, scanningQR } = this.state
    if (nodeIPSet && !fetchingCache) {
      return (
        <WithConnWarning>
          <RootStack
            onNavigationStateChange={this.onNavChange}
            ref={this.onRef}
          />
        </WithConnWarning>
      )
    }

    if (fetchingCache || tryingIP) {
      return (
        <View style={styles.flex}>
          <Loading />

          {/* <ShockDialog
            message={err}
            onRequestClose={this.dismissDialog}
            visible={!!err}
          /> */}
        </View>
      )
    }

    if (tryingIP === null && !scanningQR) {
      return (
        <View style={styles.flex}>
          <ConnectToNode
            disableControls={!!tryingIP}
            onPressConnect={this.onPressConnect}
            onPressUseShockcloud={this.onPressUseShockCloud}
            toggleQRScreen={this.toggleQRScreen}
          />

          {/* <ShockDialog
            message={err}
            onRequestClose={this.dismissDialog}
            visible={!!err}
          /> */}
        </View>
      )
    }

    if (scanningQR) {
      return (
        <View style={styles.flex}>
          <QRScanner
            connectToNodeIP={this.connectToNodeIP}
            toggleQRScreen={this.toggleQRScreen}
          />

          {/* <ShockDialog
            message={err}
            onRequestClose={this.dismissDialog}
            visible={!!err}
          /> */}
        </View>
      )
    }

    return <Loading />
  }

  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={<Loading />} persistor={persistor}>
          {this.renderContent()}
        </PersistGate>
      </Provider>
    )
  }
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
})

// Adds an Authorization token to the header before sending any request
Http.interceptors.request.use(async config => {
  try {
    console.log('Interceptor running')
    if (!config.headers.Authorization) {
      const { nodeIP, token } = await Cache.getNodeIPTokenPair()

      // eslint-disable-next-line require-atomic-updates
      config.baseURL = `http://${nodeIP}:${CONTACT_SOCKET_PORT}`
      // eslint-disable-next-line require-atomic-updates
      config.headers.common.Authorization = `Bearer ${token}`
    }

    return config
  } catch (err) {
    console.log(err ? err.response : err)
    return config
  }
})
