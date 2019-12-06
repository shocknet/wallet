/**
 * @format
 */
import { AppRegistry } from 'react-native'
import moment from 'moment'

import React from 'react'

import RootStack from './app/navigators/Root'

import RNBootSplash from 'react-native-bootsplash'

import * as NavigationService from './app/services/navigation'

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
 * @augments React.Component<{},{},never>
 */
export default class ShockWallet extends React.Component {
  // eslint-disable-next-line class-methods-use-this
  componentDidMount() {
    RNBootSplash.hide({ duration: 250 })
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

  render() {
    return (
      <RootStack onNavigationStateChange={this.onNavChange} ref={this.onRef} />
    )
  }
}
