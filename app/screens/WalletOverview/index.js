import React, { Component } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  ImageBackground,
  InteractionManager,
  StatusBar,
} from 'react-native'
import Logger from 'react-native-file-log'
import SocketManager from '../../services/socket'
import { connect } from 'react-redux'
import { Schema } from 'shock-common'
//@ts-ignore
import bech32 from 'bech32'

import * as Navigation from '../../services/navigation'
import Nav from '../../components/Nav'
import wavesBG from '../../assets/images/waves-bg.png'
import wavesBGDark from '../../assets/images/waves-bg-dark.png'
//@ts-ignore
import WalletIcon from '../../assets/images/navbar-icons/wallet.svg'
//@ts-ignore
import WalletIconFocused from '../../assets/images/navbar-icons/wallet-focused.svg'
// @ts-ignore
import IconDrawerHome from '../../assets/images/drawer-icons/icon-drawer-help.svg'
import btcConvert from '../../services/convertBitcoin'
import * as ContactAPI from '../../services/contact-api'
import * as CSS from '../../res/css'
import * as Wallet from '../../services/wallet'
import { getUSDRate, getWalletBalance } from '../../actions/WalletActions'
import { fetchNodeInfo } from '../../actions/NodeActions'
import {
  fetchRecentTransactions,
  fetchRecentPayments,
  fetchRecentInvoices,
  loadNewInvoice,
  loadNewTransaction,
} from '../../actions/HistoryActions'
import { subscribeOnChats } from '../../actions/ChatActions'
import {
  invoicesRefreshForced,
  paymentsRefreshForced,
  getMoreFeed,
} from '../../actions'
import { SEND_SCREEN } from '../Send'
import { RECEIVE_SCREEN } from '../Receive'
import notificationService from '../../../notificationService'
import * as Cache from '../../services/cache'
import * as Store from '../../../store'
/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}, {}>} Navigation
 */

import UnifiedTrx from './UnifiedTrx'

/**
 * @typedef {ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps} ConnectedRedux
 */

/**
 * @typedef {object} Props
 * @prop {Navigation} navigation
 * @prop {{ USDRate: number, totalBalance: string|null }} wallet
 * @prop {{ unifiedTransactions: (Wallet.Invoice|Wallet.Payment|Wallet.Transaction)[] }} history
 * @prop {{ nodeInfo: import('../../actions/NodeActions').GetInfo }} node
 * @prop {() => Promise<void>} fetchRecentTransactions
 * @prop {() => Promise<void>} fetchRecentPayments
 * @prop {() => Promise<void>} fetchRecentInvoices
 * @prop {() => Promise<import('../../actions/WalletActions').WalletBalance>} getWalletBalance
 * @prop {() => Promise<import('../../actions/NodeActions').GetInfo>} fetchNodeInfo
 * @prop {() => Promise<Schema.Chat[]>} subscribeOnChats
 * @prop {() => Promise<number>} getUSDRate
 * @prop {(invoice: Wallet.Invoice) => void} loadNewInvoice
 * @prop {(transaction: Wallet.Transaction) => void} loadNewTransaction
 * @prop {{feesLevel:'MIN'|'MID'|'MAX', feesSource:string}} fees
 * @prop {{notifyDisconnect:boolean, notifyDisconnectAfterSeconds:number}} settings
 * @prop {() => void} forceInvoicesRefresh
 * @prop {boolean} isOnline
 * @prop {() => void} forcePaymentsRefresh // TODO: do at auth
 * @prop {() => void} getMoreFeed
 */

/**
 * @typedef {{ displayName: string|null , avatar: string|null, pk: string }} ShockUser
 */

/**
 * @typedef {object} State
 * @prop {string | null} avatar
 */

const { height } = Dimensions.get('window')

export const WALLET_OVERVIEW = 'WALLET_OVERVIEW'

/**
 * @augments Component<Props, State, never>
 */
class WalletOverview extends Component {
  /**
   * @type any
   */
  webview = null

  /**
   * @type {import('react-navigation').NavigationBottomTabScreenOptions}
   */
  static navigationOptions = {
    tabBarIcon: ({ focused }) => {
      return (focused ? (
        <WalletIconFocused size={32} />
      ) : (
        <WalletIcon size={32} />
      ))
    },
    // @ts-ignore
    drawerIcon: ({ focused }) => {
      return (<WalletIconFocused />)
    },
  }

  /**
   * @type {State}
   */
  state = {
    avatar: ContactAPI.Events.getAvatar(),
  }

  /** @type {null|ReturnType<typeof setInterval>} */
  balanceIntervalID = null

  /** @type {null|ReturnType<typeof setInterval>} */
  exchangeRateIntervalID = null

  didFocus = { remove() {} }

  subs = [() => {}]

  theme = 'dark'

  /**
   * @param {Schema.InvoiceWhenListed} invoice
   */
  loadNewInvoice = invoice => {
    // @ts-ignore
    this.props.loadNewInvoice(invoice)
  }

  componentDidMount = async () => {
    const {
      fetchNodeInfo,
      subscribeOnChats,
      fetchRecentTransactions,
      fetchRecentInvoices,
      loadNewTransaction,
      navigation,
      forceInvoicesRefresh,
      forcePaymentsRefresh,
      getMoreFeed,
    } = this.props

    forcePaymentsRefresh()
    forceInvoicesRefresh()
    getMoreFeed()

    this.didFocus = navigation.addListener('didFocus', () => {
      StatusBar.setBackgroundColor(CSS.Colors.TRANSPARENT)
      StatusBar.setBarStyle('light-content')
      StatusBar.setTranslucent(true)

      this.balanceIntervalID = setTimeout(this.getWalletBalance, 4000)
      this.exchangeRateIntervalID = setTimeout(this.getUSDRate, 4000)
      this.recentPaymentsIntervalID = setTimeout(this.fetchRecentPayments, 4000)
    })

    navigation.addListener('didBlur', () => {
      if (this.balanceIntervalID) {
        clearTimeout(this.balanceIntervalID)
      }

      if (this.exchangeRateIntervalID) {
        clearTimeout(this.exchangeRateIntervalID)
      }

      if (this.recentPaymentsIntervalID) {
        clearTimeout(this.recentPaymentsIntervalID)
      }
    })

    this.startNotificationService()

    if (!SocketManager.socket?.connected) {
      await SocketManager.connectSocket()
    }

    subscribeOnChats()
    await Promise.all([
      fetchRecentInvoices(),
      fetchRecentTransactions(),
      fetchRecentPayments(),
      fetchNodeInfo(),
    ])

    this.subs.push(
      ContactAPI.Events.onAvatar(avatar => {
        this.setState({
          avatar,
        })
      }),
    )

    SocketManager.socket.on(
      'invoice:new',
      /**
       * @param {Schema.InvoiceWhenListed} data
       */
      data => {
        Logger.log('[SOCKET] New Invoice!', data)
        this.loadNewInvoice(data)
      },
    )

    SocketManager.socket.on(
      'transaction:new',
      /**
       * @param {Wallet.Transaction} data
       */
      data => {
        Logger.log('[SOCKET] New Transaction!', data)
        loadNewTransaction(data)
      },
    )
  }

  fetchRecentPayments = () =>
    InteractionManager.runAfterInteractions(() => {
      const { fetchRecentPayments } = this.props
      try {
        fetchRecentPayments()
        this.recentPaymentsIntervalID = setTimeout(
          this.fetchRecentPayments,
          4000,
        )
        return
      } catch (err) {
        this.recentPaymentsIntervalID = setTimeout(
          this.fetchRecentPayments,
          4000,
        )
      }
    })

  getUSDRate = () =>
    InteractionManager.runAfterInteractions(() => {
      const { getUSDRate } = this.props
      try {
        getUSDRate()
        this.exchangeRateIntervalID = setTimeout(this.getUSDRate, 4000)
        return
      } catch (err) {
        this.exchangeRateIntervalID = setTimeout(this.getUSDRate, 4000)
      }
    })

  getWalletBalance = () =>
    InteractionManager.runAfterInteractions(() => {
      const { getWalletBalance } = this.props
      try {
        getWalletBalance()
        this.balanceIntervalID = setTimeout(this.getWalletBalance, 4000)
        return
      } catch (err) {
        this.balanceIntervalID = setTimeout(this.getWalletBalance, 4000)
      }
    })

  componentWillUnmount() {
    if (this.balanceIntervalID) {
      clearInterval(this.balanceIntervalID)
    }

    if (this.exchangeRateIntervalID) {
      clearInterval(this.exchangeRateIntervalID)
    }
    //if (!SocketManager.socket?.connected) {
    //  SocketManager.socket.disconnect()
    //}
  }

  onPressRequest = () => {
    const { totalBalance } = this.props.wallet

    if (totalBalance === null) {
      return
    }

    Navigation.navigate(RECEIVE_SCREEN)
  }

  onPressSend = () => {
    const { totalBalance } = this.props.wallet

    if (totalBalance === null) {
      return
    }

    Navigation.navigate(SEND_SCREEN)
  }

  startNotificationService = async () => {
    const authData = await Cache.getStoredAuthData()
    const nodeInfo = await Cache.getNodeURL()
    if (!authData || !nodeInfo || !authData.authData.token) {
      Logger.log('error starting notifications service, invalid info')
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
    const { USDRate, totalBalance } = this.props.wallet
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
    const { nodeInfo } = this.props.node

    const { avatar } = this.state

    return (
      <View style={styles.container}>
        {/*<LNURL
          LNURLdata={LNURLdata}
          requestClose={this.requestCloseLNURL}
          payInvoice={this.payLightningInvoice}
          resetLNURL={resetLNURL}
          refreshLNURL={this.refreshLNURL}
        />*/}
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
          <Nav title="" showAvatar={avatar} />
          {this.renderBalance()}

          {nodeInfo && nodeInfo.testnet ? (
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
  const { wallet, history, node, fees, settings } = state
  const isOnline = Store.isOnline(state)

  return {
    wallet,
    history,
    node,
    fees,
    settings,
    isOnline,
  }
}

const mapDispatchToProps = {
  getUSDRate,
  getWalletBalance,
  fetchRecentTransactions,
  fetchNodeInfo,
  fetchRecentInvoices,
  fetchRecentPayments,
  subscribeOnChats,
  loadNewInvoice,
  loadNewTransaction,
  forceInvoicesRefresh: invoicesRefreshForced,
  forcePaymentsRefresh: paymentsRefreshForced,
  getMoreFeed,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  // @ts-ignore
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
