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
 * @prop {boolean|null} walletExists
 */

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
  state = {
    walletExists: null,
  }

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
      this.setState({
        walletExists: null,
      })
    })
  }

  componentWillUnmount() {
    this.willFocusSub.remove()
    this.willBlurSub.remove()
  }

  checkWalletStatus = () => {
    this.setState(
      {
        walletExists: null,
      },
      async () => {
        const authData = await Cache.getStoredAuthData()
        let walletExists = false

        try {
          ;({ walletExists } = await Wallet.walletStatus())
          // eslint-disable-next-line no-empty
        } catch (_) {}

        if (authData !== null && walletExists) {
          try {
            await API.Socket.connect()
            this.props.navigation.navigate(APP)
          } catch (e) {
            console.warn(`<Landing /> -> error: ${e.message}`)
          }
        } else {
          this.setState({
            walletExists,
          })
        }
      },
    )
  }

  onPressCreate = () => {
    this.props.navigation.navigate(CREATE_WALLET)
  }

  onPressUnlock = () => {
    this.props.navigation.navigate(LOGIN)
  }

  render() {
    const { walletExists } = this.state
    const fetchingWalletStatus = walletExists === null

    return (
      <View style={styles.container}>
        {fetchingWalletStatus && (
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

        {!fetchingWalletStatus && (
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
                color={
                  walletExists ? CSS.Colors.BLUE_LIGHT : CSS.Colors.FAILURE_RED
                }
              />
              <Text style={styles.msg}>
                {walletExists
                  ? 'Your wallet is already created but needs to be unlocked'
                  : 'You need to create a wallet before proceeding'}
              </Text>
            </View>
            {walletExists ? (
              <TouchableOpacity
                onPress={this.onPressUnlock}
                style={styles.connectBtn}
              >
                <Text style={styles.connectBtnText}>Unlock</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={this.onPressCreate}
                style={styles.connectBtn}
              >
                <Text style={styles.connectBtnText}>Create Wallet</Text>
              </TouchableOpacity>
            )}
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
