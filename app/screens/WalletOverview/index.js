// @ts-check
import React from 'react'
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  ImageBackground,
  StatusBar,
} from 'react-native'
import Logger from 'react-native-file-log'

import { connect } from 'react-redux'
import { Schema } from 'shock-common'
// @ts-expect-error
import bech32 from 'bech32'

import * as Navigation from '../../services/navigation'
import Nav from '../../components/Nav'
import wavesBG from '../../assets/images/waves-bg.png'
import wavesBGDark from '../../assets/images/waves-bg-dark.png'
import ShockIcon from '../../res/icons'
import btcConvert from '../../services/convertBitcoin'
import * as CSS from '../../res/css'
import { fetchNodeInfo } from '../../store/actions/NodeActions'
import { subscribeOnChats } from '../../store/actions/ChatActions'
import {
  invoicesRefreshForced,
  paymentsRefreshForced,
  getMoreFeed,
  chainTXsRefreshForced,
} from '../../store/actions'
import { SEND_SCREEN } from '../Send'
import { RECEIVE_SCREEN } from '../Receive'
import notificationService from '../../../notificationService'
import * as Cache from '../../services/cache'
import * as Store from '../../store'
/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}, {}>} Navigation
 */

import UnifiedTrx from './UnifiedTrx'
import { Color } from 'shock-common/dist/constants'

/**
 * @typedef {ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps} ConnectedRedux
 */

/**
 * @typedef {object} Props
 * @prop {Navigation} navigation
 * @prop {string|null} totalBalance
 * @prop {number} USDRate
 * @prop {boolean} testnet
 * @prop {() => Promise<import('../../store/actions/NodeActions').GetInfo>} fetchNodeInfo
 * @prop {() => Promise<Schema.Chat[]>} subscribeOnChats
 * @prop {{notifyDisconnect:boolean, notifyDisconnectAfterSeconds:number}} settings
 * @prop {() => void} forceInvoicesRefresh
 * @prop {boolean} isOnline
 * @prop {() => void} forcePaymentsRefresh // TODO: do at auth
 * @prop {() => void} getMoreFeed
 * @prop {() => void} forceChainTXsRefresh
 */

/**
 * @typedef {{ displayName: string|null , avatar: string|null, pk: string }} ShockUser
 */

const { height } = Dimensions.get('window')

export const WALLET_OVERVIEW = 'WALLET_OVERVIEW'

/**
 * @augments React.PureComponent<Props, {}, never>
 */
class WalletOverview extends React.PureComponent {
  /**
   * @type any
   */
  webview = null

  /**
   * @type {import('react-navigation-tabs').NavigationBottomTabOptions}
   */
  static navigationOptions = {
    tabBarIcon: ({ focused }) => ((
      <ShockIcon
        name="thin-wallet"
        size={32}
        color={focused ? Color.BUTTON_BLUE : Color.TEXT_WHITE}
      />
    )),
  }

  didFocus = { remove() {} }

  subs = [() => {}]

  theme = 'dark'

  componentDidMount = async () => {
    const {
      fetchNodeInfo,
      subscribeOnChats,
      forceInvoicesRefresh,
      forcePaymentsRefresh,
      forceChainTXsRefresh,
    } = this.props

    forcePaymentsRefresh()
    forceInvoicesRefresh()
    forceChainTXsRefresh()

    this.startNotificationService()

    subscribeOnChats()
    await fetchNodeInfo()
  }

  onPressRequest = () => {
    const { totalBalance } = this.props

    if (totalBalance === null) {
      return
    }

    Navigation.navigate(RECEIVE_SCREEN)
  }

  onPressSend = () => {
    const { totalBalance } = this.props

    if (totalBalance === null) {
      return
    }

    Navigation.navigate(SEND_SCREEN)
  }

  startNotificationService = async () => {
    const authData = await Cache.getStoredAuthData()
    const nodeInfo = await Cache.getNodeURL()

    if (!authData) {
      Logger.log('error starting notifications service, no auth data')
      return
    }

    if (!nodeInfo) {
      Logger.log('error starting notifications service, no nodeInfo')
      return
    }

    if (!authData.authData.token) {
      Logger.log(
        'error starting notifications service, empty token: ' +
          authData.authData.token,
      )
      return
    }

    const {
      notifyDisconnect,
      notifyDisconnectAfterSeconds,
    } = this.props.settings
    notificationService.startService(
      nodeInfo,
      authData ? authData.authData.token : 'token err',
      notifyDisconnect,
      1000 * notifyDisconnectAfterSeconds,
    )
  }

  stopNotificationService = () => {
    notificationService.stopService()
  }

  renderBalance = () => {
    const { USDRate, totalBalance } = this.props
    /** @type {boolean} */
    const isConnected = this.props.isOnline
    const convertedBalance = (
      Math.round(
        btcConvert(totalBalance || '0', 'Satoshi', 'BTC') * USDRate * 100,
      ) / 100
    )
      .toFixed(2)
      .toString()

    if (totalBalance === null) {
      return (
        <View>
          <ActivityIndicator size="large" />
        </View>
      )
    }

    return (
      <View
        style={
          this.theme === 'dark'
            ? styles.balanceContainerDark
            : styles.balanceContainer
        }
      >
        <Text
          style={[
            styles.balanceValueContainer,
            !isConnected && styles.yellowText,
          ]}
        >
          <Text style={styles.balanceValue}>
            {totalBalance.replace(/(\d)(?=(\d{3})+$)/g, '$1,')}
          </Text>{' '}
          <Text style={styles.balanceCurrency}>Sats</Text>
        </Text>
        <Text
          style={
            this.theme === 'dark'
              ? [styles.balanceUSDValueDark, !isConnected && styles.blueText]
              : [styles.balanceUSDValue, !isConnected && styles.yellowText]
          }
        >
          {USDRate === null
            ? 'Loading...'
            : `${convertedBalance.replace(/\d(?=(\d{3})+\.)/g, '$&,')} USD`}
        </Text>
      </View>
    )
  }

  render() {
    const { testnet } = this.props
    return (
      <View style={styles.container}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        <ImageBackground
          source={this.theme === 'dark' ? wavesBGDark : wavesBG}
          resizeMode="cover"
          style={styles.overview}
        >
          <Nav title="" showAvatar />
          {this.renderBalance()}

          {testnet ? (
            <Text style={styles.networkNotice}>
              You are using Testnet network
            </Text>
          ) : null}
          <View
            style={
              this.theme === 'dark'
                ? styles.actionButtonsDark
                : styles.actionButtons
            }
          >
            <TouchableHighlight
              underlayColor="transparent"
              onPress={this.onPressSend}
              style={
                this.theme === 'dark'
                  ? styles.actionButtonDark1
                  : styles.actionButton
              }
            >
              <Text
                style={
                  this.theme === 'dark'
                    ? styles.actionButtonTextDark1
                    : styles.actionButtonText
                }
              >
                Send
              </Text>
            </TouchableHighlight>
            <TouchableHighlight
              underlayColor="transparent"
              onPress={this.onPressRequest}
              style={
                this.theme === 'dark'
                  ? [styles.actionButtonDark2, { backgroundColor: '#4285B9' }]
                  : [
                      styles.actionButton,
                      { backgroundColor: CSS.Colors.FUN_BLUE },
                    ]
              }
            >
              <Text
                style={
                  this.theme === 'dark'
                    ? styles.actionButtonTextDark2
                    : styles.actionButtonText
                }
              >
                Request
              </Text>
            </TouchableHighlight>
          </View>
        </ImageBackground>
        <View
          style={
            this.theme === 'dark'
              ? styles.trxContainerDark
              : styles.trxContainer
          }
        >
          <UnifiedTrx />
        </View>
      </View>
    )
  }
}

/**
 * @param {Store.State} state
 */
const mapStateToProps = state => {
  const { wallet, node, settings } = state
  const { USDRate, totalBalance } = wallet
  const isOnline = Store.isOnline(state)

  return {
    USDRate,
    totalBalance,
    testnet: node.nodeInfo.testnet,
    settings,
    isOnline,
  }
}

const mapDispatchToProps = {
  fetchNodeInfo,
  subscribeOnChats,
  forceInvoicesRefresh: invoicesRefreshForced,
  forcePaymentsRefresh: paymentsRefreshForced,
  getMoreFeed,
  forceChainTXsRefresh: chainTXsRefreshForced,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  // @ts-expect-error
)(WalletOverview)

const styles = StyleSheet.create({
  networkNotice: {
    backgroundColor: CSS.Colors.BACKGROUND_RED,
    width: '100%',
    height: 30,
    fontSize: 11,
    fontFamily: 'Montserrat-700',
    textAlignVertical: 'center',
    paddingHorizontal: 25,
    color: CSS.Colors.TEXT_WHITE,
  },
  balanceContainer: {
    marginHorizontal: 50,
    marginVertical: 32,
    marginBottom: 57,
  },
  balanceContainerDark: {
    marginHorizontal: 25,
  },
  balanceValueContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    marginBottom: 5,
  },
  balanceValue: {
    fontSize: 36,
    letterSpacing: 3,
    fontFamily: 'Montserrat-700',
    color: CSS.Colors.TEXT_WHITE,
  },
  balanceCurrency: {
    fontSize: 16,
    letterSpacing: 1,
    fontFamily: 'Montserrat-700',
    color: CSS.Colors.TEXT_WHITE,
  },
  balanceUSDValue: {
    fontSize: 16,
    letterSpacing: 2,
    fontFamily: 'Montserrat-600',
    color: CSS.Colors.TEXT_ORANGE,
  },
  balanceUSDValueDark: {
    fontSize: 16,
    letterSpacing: 2,
    fontFamily: 'Montserrat-600',
    color: '#2D92E1',
  },
  container: {
    backgroundColor: CSS.Colors.BACKGROUND_WHITE,
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    margin: 0,
  },
  overview: {
    width: '100%',
    paddingTop: 20,
    backgroundColor: CSS.Colors.FUN_BLUE,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 25,
    marginTop: 25,
    marginBottom: 25,
  },
  actionButtonsDark: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 25,
    paddingVertical: 33,
  },
  actionButton: {
    width: '45%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    backgroundColor: CSS.Colors.ORANGE,
  },
  actionButtonDark1: {
    width: '48%',
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: CSS.Colors.TRANSPARENT,
    borderColor: '#4285B9',
    borderWidth: 1,
  },
  actionButtonDark2: {
    width: '48%',
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: CSS.Colors.TRANSPARENT,
    borderColor: CSS.Colors.BACKGROUND_WHITE,
    borderWidth: 1,
  },
  actionButtonText: {
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-700',
  },
  actionButtonTextDark1: {
    color: '#4285B9',
    fontFamily: 'Montserrat-700',
    fontSize: 14,
  },
  actionButtonTextDark2: {
    color: '#212937',
    fontFamily: 'Montserrat-700',
    fontSize: 14,
  },
  trxContainer: {
    backgroundColor: CSS.Colors.BACKGROUND_WHITE,
    height,
    flex: 1,
    width: '100%',
    paddingHorizontal: 30,
  },
  trxContainerDark: {
    backgroundColor: '#292E35',
    height,
    flex: 1,
    width: '100%',
    paddingHorizontal: 30,
    color: CSS.Colors.TEXT_WHITE,
  },
  yellowText: {
    color: CSS.Colors.CAUTION_YELLOW,
  },
  blueText: {
    color: '#2D92E1',
  },
})
