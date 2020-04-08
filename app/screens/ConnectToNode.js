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
import { isValidURL as isValidIP } from '../services/utils'
import Pad from '../components/Pad'
import QRScanner from './QRScanner'
import { WALLET_MANAGER } from '../navigators/WalletManager'
import OnboardingScreen, {
  ITEM_SPACING,
  titleTextStyle,
  linkTextStyle,
} from '../components/OnboardingScreen'
import OnboardingInput from '../components/OnboardingInput'
import OnboardingBtn from '../components/OnboardingBtn'
import { throttledExchangeKeyPair } from '../actions/ConnectionActions'
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
 */

/** @type {State} */
const DEFAULT_STATE = {
  checkingCacheForNodeURL: true,
  nodeURL: '',
  externalURL: '',
  pinging: false,
  wasBadPing: false,
  scanningQR: false,
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

  /** @type {State} */
  state = DEFAULT_STATE

  didFocusSub = {
    remove() {},
  }

  componentDidMount() {
    this.checkCacheForNodeURL()
    this.didFocusSub = this.props.navigation.addListener(
      'didFocus',
      this.checkCacheForNodeURL,
    )
  }

  componentWillUnmount() {
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

  /**
   * @private
   * @param {string} nodeURL
   */
  onChangeNodeURL = nodeURL => {
    this.setState({
      nodeURL,
    })
  }

  connectURL = async (url = '') => {
    Logger.log('WILL NOW PING URL: ' + url)
    const wasGoodPing = await Conn.pingURL(url)
    Logger.log('PING COMPLETED WITH RESULT: ' + wasGoodPing.success)

    if (wasGoodPing.success) {
      Logger.log('WRITING NODE URL TO CACHE')
      await Cache.writeNodeURLOrIP(url)
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
      Linking.openURL(url)
    }
  }

  render() {
    const {
      checkingCacheForNodeURL,
      nodeURL,
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
        <Text style={titleTextStyle}>Node Address</Text>

        <Pad amount={ITEM_SPACING} />

        <OnboardingInput
          autoCapitalize="none"
          autoCorrect={false}
          disable={pinging || wasBadPing || !!err}
          onChangeText={this.onChangeNodeURL}
          onPressQRBtn={this.toggleQRScreen}
          placeholder="Enter your node IP"
          // placeholderTextColor="grey"
          value={nodeURL}
        />

        <Pad amount={ITEM_SPACING} />

        {!(wasBadPing || !!err) && (
          <>
            <OnboardingBtn
              disabled={!isValidIP(nodeURL) || pinging}
              onPress={
                wasBadPing || err ? this.onPressTryAgain : this.onPressConnect
              }
              title={wasBadPing || err ? 'Continue' : 'Connect'}
            />

            <Pad amount={ITEM_SPACING} />

            <Text style={linkTextStyle} onPress={this.openDocsLink}>
              Don't have a node?
            </Text>
          </>
        )}

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
