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
 * @augments React.Component<Props, {}>
 */
export default class CreateWallet extends React.Component {
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
      console.log('GETTING AUTH DATA')
      const authData = await Cache.getStoredAuthData()
      console.log('GETTING WALLET STATUS')
      const walletStatus = await Wallet.walletStatus()
      console.log('FETCHING NODE URL')
      const nodeURL = await Cache.getNodeURL()
      if (nodeURL === null) {
        throw new Error('NODE URL IS NULL BEFORE IS_GUN_AUTH')
      }
      console.log('GETTING IS_GUN_AUTH')
      const isGunAuth = await Auth.isGunAuthed(nodeURL)

      if (walletStatus === 'noncreated') {
        console.log('WALLET NON CREATED INVALIDATING CACHED AUTH DATA')
        await Cache.writeStoredAuthData(null)
        console.log('NAVIGATING TO CREATE WALLET OR ALIAS SCREEN')
        this.props.navigation.navigate(CREATE_WALLET_OR_ALIAS)
      }

      if (walletStatus === 'unlocked') {
        if (authData !== null && isGunAuth) {
          console.log(
            'NOW CONNECTING SOCKET, GUN IS AUTHED AND AUTH DATA IS CACHED',
          )
          await API.Socket.connect()
          console.log('NAVIGATING TO APP')
          this.props.navigation.navigate(APP)
        } else {
          console.log(
            'NO AUTH DATA CACHED OR GUN IS NOT AUTH, NAVIGATING TO LOGIN',
          )
          this.props.navigation.navigate(LOGIN)
        }
      }

      if (walletStatus === 'locked') {
        console.log('WALLET IS LOCKED')
        if (authData === null) {
          console.log(
            'WALLET LOCKED AND NO CACHED AUTH, NAVIGATING TO CREATE WALLET OR ALIAS',
          )
          this.props.navigation.navigate(CREATE_WALLET_OR_ALIAS)
        } else {
          console.log(
            'WALLET LOCKED BUT GOT CACHED AUTH DATA, NAVIGATING TO LOGIN',
          )
          this.props.navigation.navigate(LOGIN)
        }
      }
    } catch (e) {
      console.log(
        'ERROR IN Landing.setup: ' +
          e.message +
          ' -- will navigate to CONNECT SCREEN, with error paramater',
      )
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
