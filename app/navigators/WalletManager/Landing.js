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
import ShockDialog from '../../components/ShockDialog'

export const LANDING = 'LANDING'

/**
 * @typedef {object} Props
 * @prop {Navigation} navigation
 */

/**
 * @typedef {object} State
 * @prop {string|null} err
 */

/** @type {State} */
const DEFAULT_STATE = {
  err: null,
}

/**
 * @augments React.PureComponent<Props, State>
 */
export default class CreateWallet extends React.PureComponent {
  /**
   * @type {import('react-navigation').NavigationScreenOptions}
   */
  static navigationOptions = {
    header: null,
  }

  /**
   * @type {State}
   */
  state = DEFAULT_STATE

  willFocusSub = {
    remove() {},
  }

  willBlurSub = {
    remove() {},
  }

  componentDidMount() {
    this.willFocusSub = this.props.navigation.addListener(
      'didFocus',
      this.setup,
    )
    this.willBlurSub = this.props.navigation.addListener('didBlur', () => {
      this.setState(DEFAULT_STATE)
    })
  }

  componentWillUnmount() {
    this.willFocusSub.remove()
    this.willBlurSub.remove()
  }

  setup = async () => {
    this.setState(DEFAULT_STATE)

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
      this.setState({
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

  dismissDialog = () => {
    this.setState({
      err: null,
    })

    this.setup()
  }

  render() {
    const { err } = this.state

    return (
      <>
        <OnboardingScreen loading />

        <ShockDialog
          message={err}
          onRequestClose={this.dismissDialog}
          visible={!!err}
        />
      </>
    )
  }
}
