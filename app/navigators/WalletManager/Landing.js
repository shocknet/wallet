import React from 'react'

/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}>} Navigation
 */

import * as API from '../../services/contact-api'
import * as Auth from '../../services/auth'
import * as Wallet from '../../services/wallet'

import * as Cache from '../../services/cache'
import { LOGIN } from '../../screens/Login'
import { APP } from '../Root'

import { CREATE_WALLET_OR_ALIAS } from './CreateWalletOrAlias'
import OnboardingScreen from '../../components/OnboardingScreen'
import { CONNECT_TO_NODE } from '../../screens/ConnectToNode'

export const LANDING = 'LANDING'

/**
 * @typedef {object} Props
 * @prop {Navigation} navigation
 */

/**
 * @augments React.PureComponent<Props, {}>
 */
export default class CreateWallet extends React.PureComponent {
  /**
   * @type {import('react-navigation').NavigationScreenOptions}
   */
  static navigationOptions = {
    header: null,
  }

  didFocus = {
    remove() {},
  }

  componentDidMount() {
    this.didFocus = this.props.navigation.addListener('didFocus', this.setup)
  }

  componentWillUnmount() {
    this.didFocus.remove()
  }

  setup = async () => {
    try {
      const authData = await Cache.getStoredAuthData()
      const walletStatus = await Wallet.walletStatus()
      const isGunAuth = await Auth.isGunAuthed()

      if (walletStatus === 'noncreated') {
        await Cache.writeStoredAuthData(null)
        this.props.navigation.navigate(CREATE_WALLET_OR_ALIAS)
      }

      if (walletStatus === 'unlocked') {
        if (authData !== null && isGunAuth) {
          await API.Socket.connect()
          this.props.navigation.navigate(APP)
        } else {
          this.props.navigation.navigate(LOGIN)
        }
      }

      if (walletStatus === 'locked') {
        if (authData === null) {
          this.props.navigation.navigate(CREATE_WALLET_OR_ALIAS)
        } else {
          this.props.navigation.navigate(LOGIN)
        }
      }
    } catch (e) {
      this.props.navigation.navigate(CONNECT_TO_NODE, {
        err: e.message,
      })
    }
  }

  onPressCreate = () => {
    this.props.navigation.navigate(CREATE_WALLET_OR_ALIAS)
  }

  onPressUnlock = () => {
    this.props.navigation.navigate(LOGIN)
  }

  render() {
    return <OnboardingScreen loading />
  }
}
