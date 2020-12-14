import './wdyr'

import React from 'react'
import * as RN from 'react-native'
import RNBootSplash from 'react-native-bootsplash'

import App from './app'

export default class ShockWallet extends React.PureComponent {
  componentDidMount() {
    RNBootSplash.hide({ duration: 250 })
  }

  render() {
    return <App />
  }
}

RN.AppRegistry.registerComponent('shockwallet', () => ShockWallet)
