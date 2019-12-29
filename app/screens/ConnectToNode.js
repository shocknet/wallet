/**
 * @prettier
 */
import React from 'react'
import { Text, View } from 'react-native'

/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}>} Navigation
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
/** @type {number} */
// @ts-ignore
const shockBG = require('../assets/images/shock-bg.png')

/** @type {number} */
// @ts-ignore
const shockLogo = require('../assets/images/shocklogo.png')

export const CONNECT_TO_NODE = 'CONNECT_TO_NODE'

/**
 * @typedef {object} Props
 * @prop {Navigation} navigation
 */

/**
 * @typedef {object} State
 * @prop {boolean} checkingCacheForNodeURL
 * @prop {string} nodeURL
 * @prop {boolean} pinging
 * @prop {boolean} wasBadPing
 * @prop {boolean} scanningQR
 */

/** @type {State} */
const DEFAULT_STATE = {
  checkingCacheForNodeURL: true,
  nodeURL: '',
  pinging: false,
  wasBadPing: false,
  scanningQR: false,
}

/**
 * @augments React.PureComponent<Props, State, never>
 */
export default class ConnectToNode extends React.PureComponent {
  /**
   * @type {import('react-navigation').NavigationScreenOptions}
   */
  static navigationOptions = {
    header: null,
  }

  /** @type {State} */
  state = DEFAULT_STATE

  willFocusSub = {
    remove() {},
  }

  componentDidMount() {
    this.checkCacheForNodeURL()
    this.willFocusSub = this.props.navigation.addListener('didFocus', () => {
      this.setState(DEFAULT_STATE)
    })
  }

  componentWillUnmount() {
    this.willFocusSub.remove()
  }

  checkCacheForNodeURL = () => {
    this.setState(DEFAULT_STATE, async () => {
      const nodeURL = await Cache.getNodeURL()

      if (nodeURL !== null) {
        this.props.navigation.navigate(WALLET_MANAGER)
      } else {
        this.setState({
          checkingCacheForNodeURL: false,
        })
      }
    })
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

  /** @private */
  onPressConnect = () => {
    const { nodeURL } = this.state

    this.setState(
      {
        pinging: true,
      },
      async () => {
        try {
          const wasGoodPing = await Conn.pingURL(nodeURL)

          if (wasGoodPing) {
            await Cache.writeNodeURLOrIP(nodeURL)

            this.props.navigation.navigate(WALLET_MANAGER)
          } else {
            this.setState({
              pinging: false,
              wasBadPing: true,
            })
          }
        } catch (err) {
          this.setState({
            pinging: false,
            wasBadPing: true,
          })

          console.warn(err.message)
        }
      },
    )
  }

  onPressTryAgain = () => {
    this.setState({
      wasBadPing: false,
    })
  }

  toggleQRScreen = () => {
    this.setState(({ scanningQR }) => ({
      scanningQR: !scanningQR,
    }))
  }

  onPressContinue = () => {
    this.setState(
      {
        // show an spinner
        pinging: true,
      },
      async () => {
        await Cache.writeNodeURLOrIP(this.state.nodeURL)

        this.props.navigation.navigate(WALLET_MANAGER)
      },
    )
  }

  /**
   * @param {string} ip
   * @param {number} port
   */
  onQRRead = (ip, port) => {
    this.setState({
      scanningQR: false,
      nodeURL: ip + ':' + port,
    })
  }

  render() {
    const {
      checkingCacheForNodeURL,
      nodeURL,
      wasBadPing,
      pinging,
      scanningQR,
    } = this.state

    if (scanningQR) {
      return (
        <View style={CSS.styles.flex}>
          <QRScanner
            connectToNodeIP={this.onQRRead}
            toggleQRScreen={this.toggleQRScreen}
          />
        </View>
      )
    }

    return (
      <OnboardingScreen loading={checkingCacheForNodeURL || pinging}>
        <Text style={titleTextStyle}>Welcome</Text>

        <Pad amount={ITEM_SPACING} />

        <OnboardingInput
          autoCapitalize="none"
          autoCorrect={false}
          disable={pinging || wasBadPing}
          keyboardType="numeric"
          onChangeText={this.onChangeNodeURL}
          onPressQRBtn={this.toggleQRScreen}
          placeholder="Specify Node IP"
          // placeholderTextColor="grey"
          value={nodeURL}
        />

        <Pad amount={ITEM_SPACING} />

        <OnboardingBtn
          disabled={!isValidIP(nodeURL) || pinging}
          onPress={wasBadPing ? this.onPressTryAgain : this.onPressConnect}
          title={wasBadPing ? 'Continue' : 'Connect'}
        />

        <Pad amount={ITEM_SPACING} />

        {wasBadPing && (
          <Text style={titleTextStyle}>
            Could not connect, you can still continue if you're sure this is
            your node's ip.
          </Text>
        )}

        <Pad amount={ITEM_SPACING} />

        {wasBadPing && (
          <Text onPress={this.onPressTryAgain} style={linkTextStyle}>
            Try Again
          </Text>
        )}
      </OnboardingScreen>
    )
  }
}
