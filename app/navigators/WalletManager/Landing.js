import React from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native'
import EntypoIcon from 'react-native-vector-icons/Entypo'
/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}>} Navigation
 */

import * as API from '../../services/contact-api'
import * as Auth from '../../services/auth'
import * as Wallet from '../../services/wallet'
import * as CSS from '../../css'
import { CREATE_WALLET } from './CreateWallet'

import * as Cache from '../../services/cache'
import { LOGIN } from '../../screens/Login'
import { APP } from '../Root'

export const LANDING = 'LANDING'

/**
 * @typedef {object} Props
 * @prop {Navigation} navigation
 */

/**
 * @typedef {object} State
 * @prop {boolean} fetching
 * @prop {string|null} err
 * @prop {boolean|null} isGunAuth
 * @prop {Wallet.WalletStatus|null} walletStatus
 */

/** @type {State} */
const DEFAULT_STATE = {
  err: null,
  fetching: true,
  isGunAuth: null,
  walletStatus: null,
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
      this.checkWalletStatus,
    )
    this.willBlurSub = this.props.navigation.addListener('didBlur', () => {
      this.setState(DEFAULT_STATE)
    })
  }

  componentWillUnmount() {
    this.willFocusSub.remove()
    this.willBlurSub.remove()
  }

  checkWalletStatus = () => {
    this.setState(DEFAULT_STATE, async () => {
      try {
        const authData = await Cache.getStoredAuthData()
        const walletStatus = await Wallet.walletStatus()
        const isGunAuth = await Auth.isGunAuthed()

        this.setState({
          err: null,
          fetching: false,
          walletStatus,
          isGunAuth,
        })

        if (authData !== null && walletStatus === 'unlocked' && isGunAuth) {
          await API.Socket.connect()
          this.props.navigation.navigate(APP)
        }
      } catch (e) {
        this.setState({
          err: e.message,
          fetching: false,
          isGunAuth: null,
          walletStatus: null,
        })
      }
    })
  }

  onPressCreate = () => {
    this.props.navigation.navigate(CREATE_WALLET)
  }

  onPressUnlock = () => {
    this.props.navigation.navigate(LOGIN)
  }

  render() {
    const { err, fetching, isGunAuth, walletStatus } = this.state
    const needsCreation = walletStatus === 'noncreated'
    const needsUnlock =
      (!isGunAuth && walletStatus !== 'noncreated') ||
      walletStatus === 'unlocked'

    return (
      <View style={styles.container}>
        {fetching && (
          <View style={[styles.subContainer, styles.creatingWalletDialog]}>
            <View style={styles.formHead}>
              <View style={styles.formHeadIconContainer}>
                <EntypoIcon name="wallet" size={145} color="#4285b9" />
              </View>
            </View>
            <View>
              <Text style={[styles.textInputLabel, styles.textAlignCenter]}>
                Checking Wallet Status
              </Text>
              <ActivityIndicator size="large" color="#3775ae" />
            </View>
          </View>
        )}

        {!fetching && (
          <ScrollView
            contentContainerStyle={[
              styles.subContainer,
              {
                height: Dimensions.get('window').height - 120,
              },
            ]}
          >
            <View style={styles.formHead}>
              <Text style={styles.formHeadText}>Wallet</Text>
              <EntypoIcon
                name="wallet"
                size={180}
                color={(() => {
                  if (needsUnlock) {
                    return CSS.Colors.BLUE_LIGHT
                  }

                  if (err) {
                    return CSS.Colors.FAILURE_RED
                  }

                  if (needsCreation) {
                    return CSS.Colors.CAUTION_YELLOW
                  }

                  throw new Error('Unreachable code')
                })()}
              />
              <Text style={styles.msg}>
                {(() => {
                  if (needsUnlock) {
                    return 'Your wallet is already created but needs to be unlocked'
                  }

                  if (err) {
                    return err
                  }

                  if (needsCreation) {
                    return 'You need to create a wallet before proceeding'
                  }

                  throw new Error('Unreachable code')
                })()}
              </Text>
            </View>
            {(() => {
              if (needsUnlock) {
                return (
                  <TouchableOpacity
                    onPress={this.onPressUnlock}
                    style={styles.connectBtn}
                  >
                    <Text style={styles.connectBtnText}>Unlock</Text>
                  </TouchableOpacity>
                )
              }

              if (err) {
                return (
                  <TouchableOpacity
                    onPress={this.checkWalletStatus}
                    style={styles.connectBtn}
                  >
                    <Text style={styles.connectBtnText}>Try Again</Text>
                  </TouchableOpacity>
                )
              }

              if (needsCreation) {
                return (
                  <TouchableOpacity
                    onPress={this.onPressCreate}
                    style={styles.connectBtn}
                  >
                    <Text style={styles.connectBtnText}>Create Wallet</Text>
                  </TouchableOpacity>
                )
              }

              throw new Error('Unreachable code.')
            })()}
          </ScrollView>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CSS.Colors.BLUE_DARK,
    justifyContent: 'space-around',
    padding: 30,
    paddingTop: 0,
  },

  creatingWalletDialog: {
    height: '100%',
    justifyContent: 'center',
    borderRadius: 0,
  },

  textInputLabel: {
    marginBottom: 10,
    marginLeft: 15,
    fontFamily: 'Montserrat-600',
  },
  connectBtn: {
    height: 60,
    backgroundColor: CSS.Colors.BLUE_LIGHT,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  connectBtnText: {
    fontSize: 15,
    letterSpacing: 1.25,
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-700',
  },
  subContainer: {
    justifyContent: 'space-between',
    width: '100%',
    minHeight: 300,
    borderRadius: 15,
    backgroundColor: CSS.Colors.BACKGROUND_WHITE,
    padding: 30,
    overflow: 'hidden',
  },
  formHead: {
    marginBottom: 30,
    alignItems: 'center',
  },
  formHeadText: {
    fontFamily: 'Montserrat-700',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 25,
  },
  formHeadIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    height: 90,
    borderRadius: 100,
    backgroundColor: CSS.Colors.BACKGROUND_NEAR_WHITE,
  },
  textAlignCenter: {
    textAlign: 'center',
  },

  msg: {
    fontFamily: 'Montserrat-700',
    fontSize: 18,
    letterSpacing: 1.25,
  },
})
