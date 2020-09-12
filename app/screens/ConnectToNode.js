/* eslint-disable no-console */
/**
 * @prettier
 */
import React from 'react'
import { Text, View, Linking } from 'react-native'
import { connect } from 'react-redux'
import Logger from 'react-native-file-log'
import InAppBrowser from 'react-native-inappbrowser-reborn'
/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}, Params>} Navigation
 */

import * as CSS from '../res/css'
import * as Cache from '../services/cache'
import * as Conn from '../services/connection'
import Pad from '../components/Pad'
import QRScanner from './QRScanner'
import { WALLET_MANAGER } from '../navigators/WalletManager'
import OnboardingScreen, {
  ITEM_SPACING,
  titleTextStyle,
  linkTextStyle,
} from '../components/OnboardingScreen'
import { throttledExchangeKeyPair } from '../actions/ConnectionActions'
import InvitationLogin from '../components/InvitationLogin'

/** @type {number} */
// @ts-ignore
const shockBG = require('../assets/images/shock-bg.png')

export const CONNECT_TO_NODE = 'CONNECT_TO_NODE'

/**
 * @typedef {object} Params
 * @prop {string|null} err
 */

/**
 * @typedef {object} Props
 * @prop {Navigation} navigation
 */

/**
 * @typedef {object} QRData
 * @prop {string} internalIP
 * @prop {string} externalIP
 * @prop {(number)=} walletPort
 */

/**
 * @typedef {object} State
 * @prop {boolean} checkingCacheForNodeURL
 * @prop {string} nodeURL
 * @prop {string} externalURL
 * @prop {boolean} pinging
 * @prop {boolean} wasBadPing
 * @prop {boolean} scanningQR
 * @prop {boolean} isUsingInvitation
 * @prop {string} invitationCode
 */

/** @type {State} */
const DEFAULT_STATE = {
  checkingCacheForNodeURL: true,
  nodeURL: '',
  externalURL: '',
  pinging: false,
  wasBadPing: false,
  scanningQR: false,
  isUsingInvitation: false,
  invitationCode: '',
}

/**
 * @augments React.Component<Props, State, never>
 */
class ConnectToNode extends React.Component {
  /**
   * @type {import('react-navigation').NavigationScreenOptions}
   */
  static navigationOptions = {
    header: null,
  }

  theme = 'dark'

  /** @type {State} */
  state = DEFAULT_STATE

  mounted = false

  didFocusSub = {
    remove() {},
  }

  componentDidMount() {
    this.mounted = true
    this.checkCacheForNodeURL()
    this.didFocusSub = this.props.navigation.addListener(
      'didFocus',
      this.checkCacheForNodeURL,
    )
  }

  componentWillUnmount() {
    this.mounted = true
    this.didFocusSub.remove()
  }

  checkCacheForNodeURL = async () => {
    this.setState(DEFAULT_STATE)
    try {
      const nodeURL = await Cache.getNodeURL()
      const err = this.props.navigation.getParam('err')

      if (nodeURL !== null && !err) {
        this.props.navigation.navigate(WALLET_MANAGER)
      } else {
        this.setState({
          checkingCacheForNodeURL: false,
          nodeURL: nodeURL || '',
        })
      }
    } catch (err) {
      this.props.navigation.setParams({
        err: err.message,
      })
    } finally {
      this.setState({
        checkingCacheForNodeURL: false,
      })
    }
  }

  connectURL = async (url = '') => {
    Logger.log('WILL NOW PING URL: ' + url)
    const wasGoodPing = await Conn.pingURL(url)
    Logger.log('PING COMPLETED WITH RESULT: ' + wasGoodPing.success)

    if (wasGoodPing.success) {
      Logger.log('WRITING NODE URL TO CACHE')
      await Cache.writeNodeURLOrIP(url)
      this.mounted &&
        this.setState({
          nodeURL: url,
        })
      Logger.log('NAVIGATING TO WALLET MANAGER')
      this.props.navigation.navigate(WALLET_MANAGER)
    } else {
      Logger.log('PING FAILED')
      throw new Error('Ping failed')
    }
  }

  /** @private */
  onPressConnect = () => {
    const { nodeURL, externalURL } = this.state

    this.mounted &&
      this.setState(
        {
          pinging: true,
        },
        async () => {
          try {
            await this.connectURL(nodeURL)
          } catch (err) {
            try {
              Logger.log(
                'CONNECTURL FAILED, TRYING ONCE MORE TIME, ERR: ' + err.message,
              )
              await this.connectURL(externalURL)
            } catch (err) {
              this.mounted &&
                this.setState({
                  pinging: false,
                  wasBadPing: true,
                })
            }
          }
        },
      )
  }

  onPressTryAgain = () => {
    this.props.navigation.setParams({
      err: null,
    })
    this.mounted &&
      this.setState({
        wasBadPing: false,
      })
  }

  toggleQRScreen = () => {
    this.setState(({ scanningQR }) => ({
      scanningQR: !scanningQR,
    }))
  }

  /**
   * @param {(QRData | string)=} data
   */
  onQRRead = data => {
    if (data && typeof data === 'object') {
      const { internalIP, externalIP, walletPort } = data
      this.setState(
        {
          scanningQR: false,
          nodeURL: internalIP + ':' + walletPort,
          externalURL: `${externalIP}:${walletPort}`,
        },
        () => {
          this.onPressConnect()
        },
      )
    }
  }

  openDocsLink = async () => {
    const url = 'https://github.com/shocknet/wizard#readme'
    try {
      const available = await InAppBrowser.isAvailable()
      if (available) {
        await InAppBrowser.open(url, {
          toolbarColor: CSS.Colors.BACKGROUND_BLUE,
          secondaryToolbarColor: CSS.Colors.TEXT_ORANGE,
        })
      } else {
        Linking.openURL(url)
      }
    } catch (err) {
      Logger.log(JSON.stringify(err))
      Linking.openURL(url)
    }
  }

  render() {
    const {
      checkingCacheForNodeURL,
      wasBadPing,
      pinging,
      scanningQR,
    } = this.state

    const err = this.props.navigation.getParam('err')

    if (scanningQR) {
      return (
        <View style={CSS.styles.flex}>
          <QRScanner
            onQRSuccess={this.onQRRead}
            toggleQRScreen={this.toggleQRScreen}
            type="nodeIP"
          />
        </View>
      )
    }

    return (
      <OnboardingScreen loading={checkingCacheForNodeURL || pinging}>
        <Text style={titleTextStyle}>
          {this.state.isUsingInvitation ? 'Invitation Code' : 'Node Address'}
        </Text>

        <Pad amount={ITEM_SPACING} />

        <InvitationLogin
          navigation={this.props.navigation}
          mounted={this.mounted}
        />

        {wasBadPing && (
          <Text style={titleTextStyle}>
            Connection to the specified address failed.
          </Text>
        )}

        {err && <Text style={titleTextStyle}>{err}</Text>}

        <Pad amount={ITEM_SPACING} />

        {(wasBadPing || !!err) && (
          <Text onPress={this.onPressTryAgain} style={linkTextStyle}>
            Try Again
          </Text>
        )}
      </OnboardingScreen>
    )
  }
}

/**
 * @param {typeof import('../../reducers/index').default} state
 */
const mapStateToProps = ({ connection }) => ({ connection })

const mapDispatchToProps = {
  throttledExchangeKeyPair,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConnectToNode)
