import React from 'react'
import Logger from 'react-native-file-log'

/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}>} Navigation
 */

import * as Auth from '../../services/auth'
import * as Wallet from '../../services/wallet'
import * as Cache from '../../services/cache'
import { LOGIN, APP, CONNECT_TO_NODE } from '../../routes'
import { CREATE_WALLET_OR_ALIAS } from './CreateWalletOrAlias'
import OnboardingScreen from '../../components/OnboardingScreen'
import { getStore } from '../../store'
import * as Actions from '../../store/actions'

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
   * @type {import('react-navigation-stack').NavigationStackOptions}
   */
  static navigationOptions = {
    header: () => null,
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
      Logger.log('GETTING AUTH DATA')
      const authData = await Cache.getStoredAuthData()
      if (authData && authData.authData) {
        const host = await Cache.getNodeURL()
        getStore().dispatch(
          Actions.hostWasSet(
            // @ts-expect-error
            host,
          ),
        )
        getStore().dispatch(
          Actions.authed({
            alias: authData.authData.alias,
            gunPublicKey: authData.authData.publicKey,
            token: authData.authData.token,
          }),
        )
      } else {
        getStore().dispatch(Actions.tokenDidInvalidate())
      }
      Logger.log('GETTING WALLET STATUS')
      const walletStatus = await Wallet.walletStatus()
      Logger.log('FETCHING NODE URL')
      const nodeURL = await Cache.getNodeURL()
      if (nodeURL === null) {
        throw new Error('NODE URL IS NULL BEFORE IS_GUN_AUTH')
      }
      Logger.log('GETTING IS_GUN_AUTH')
      const isGunAuth = await Auth.isGunAuthed()

      if (walletStatus === 'noncreated') {
        Logger.log('WALLET NON CREATED INVALIDATING CACHED AUTH DATA')
        await Cache.writeStoredAuthData(null)
        Logger.log('NAVIGATING TO CREATE WALLET OR ALIAS SCREEN')
        this.props.navigation.navigate(CREATE_WALLET_OR_ALIAS)
      }

      if (walletStatus === 'unlocked') {
        if (authData !== null && isGunAuth) {
          Logger.log('GUN IS AUTHED AND AUTH DATA IS CACHED')
          Logger.log('NAVIGATING TO APP')
          this.props.navigation.navigate(APP)
        } else {
          Logger.log(
            'NO AUTH DATA CACHED OR GUN IS NOT AUTH, NAVIGATING TO LOGIN',
          )
          this.props.navigation.navigate(LOGIN)
        }
      }

      if (walletStatus === 'locked') {
        Logger.log('WALLET IS LOCKED')
        if (authData === null) {
          Logger.log(
            'WALLET LOCKED AND NO CACHED AUTH, NAVIGATING TO CREATE WALLET OR ALIAS',
          )
          this.props.navigation.navigate(CREATE_WALLET_OR_ALIAS)
        } else {
          Logger.log(
            'WALLET LOCKED BUT GOT CACHED AUTH DATA, NAVIGATING TO LOGIN',
          )
          this.props.navigation.navigate(LOGIN)
        }
      }
    } catch (e) {
      Logger.log(
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
