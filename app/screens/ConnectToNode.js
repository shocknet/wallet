/**
 * @prettier
 */
import React from 'react'
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ImageBackground,
} from 'react-native'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import Ionicons from 'react-native-vector-icons/Ionicons'

/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}>} Navigation
 */

import * as CSS from '../css'
import * as Cache from '../services/cache'
import * as Conn from '../services/connection'
import { isValidURL as isValidIP } from '../services/utils'
import Pad from '../components/Pad'
import QRScanner from './QRScanner'
import Loading from './Loading'
import { WALLET_MANAGER } from '../navigators/WalletManager'
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
    this.setState({
      pinging: true,
    })

    Conn.pingURL(this.state.nodeURL).then(res => {
      if (res) {
        this.props.navigation.navigate(WALLET_MANAGER)
      } else {
        this.setState({
          pinging: false,
          wasBadPing: !res,
        })
      }
    })
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

    if (checkingCacheForNodeURL) {
      return <Loading />
    }

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
      <ImageBackground
        resizeMode="cover"
        resizeMethod="scale"
        source={shockBG}
        style={styles.container}
      >
        <View style={styles.shockWalletLogoContainer}>
          <Image style={styles.shockLogo} source={shockLogo} />
          {!pinging && !wasBadPing && (
            <Text style={styles.logoText}>SHOCKWALLET</Text>
          )}
        </View>

        <View>
          {!pinging && !wasBadPing && (
            <Text style={styles.callToAction}>WELCOME</Text>
          )}

          <View style={styles.textInputFieldContainer}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              editable={!pinging && !wasBadPing}
              keyboardType="numeric"
              onChangeText={this.onChangeNodeURL}
              placeholder="Specify Node IP"
              placeholderTextColor="grey"
              style={styles.textInputField}
              value={nodeURL}
            />
            <TouchableOpacity
              style={styles.scanBtn}
              onPress={this.toggleQRScreen}
            >
              <Ionicons
                name="ios-barcode"
                style={styles.positionAbsolute}
                size={10}
                color="#eee"
              />
              <Ionicons
                name="md-qr-scanner"
                style={styles.positionAbsolute}
                size={20}
                color="#eee"
              />
            </TouchableOpacity>
          </View>

          <View>
            <Text style={styles.msg}>
              {(() => {
                if (pinging) {
                  return 'Checking...'
                }

                if (wasBadPing) {
                  return "Could not connect, you can still continue if you're sure this is your node's ip."
                }

                return null
              })()}
            </Text>
            <Pad amount={10} />
            {wasBadPing && (
              <Text onPress={this.onPressTryAgain} style={styles.msgLink}>
                Try Again
              </Text>
            )}
          </View>

          {wasBadPing && (
            <TouchableOpacity onPress={this.onPressContinue}>
              <View style={styles.shockBtn}>
                <Text style={styles.shockBtnText}>Continue</Text>
              </View>
            </TouchableOpacity>
          )}

          {!pinging && !wasBadPing && (
            <TouchableOpacity
              disabled={!isValidIP(nodeURL) || pinging}
              onPress={this.onPressConnect}
              style={styles.connectBtn}
            >
              <Text style={styles.connectBtnText}>Connect</Text>
            </TouchableOpacity>
          )}

          {!pinging && !wasBadPing && (
            <TouchableOpacity disabled>
              <View style={styles.shockBtn}>
                <EntypoIcon name="cloud" size={20} color="#274f94" />
                <Text style={styles.shockBtnText}>Use ShockCloud</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ImageBackground>
    )
  }
}

const styles = StyleSheet.create({
  positionAbsolute: {
    position: 'absolute',
  },
  container: {
    flex: 1,
    backgroundColor: CSS.Colors.BLUE_DARK,
    justifyContent: 'space-around',
    paddingLeft: 30,
    paddingRight: 30,
  },
  shockLogo: {
    width: 70,
    height: 70,
    marginBottom: 17,
  },
  shockWalletLogoContainer: {
    alignItems: 'center',
  },
  textInputFieldContainer: {
    flexDirection: 'row',
    backgroundColor: CSS.Colors.TEXT_WHITE,
    height: 60,
    borderRadius: 100,
    paddingLeft: 25,
    marginBottom: 25,
    elevation: 3,
    alignItems: 'center',
  },
  textInputField: {
    fontSize: 14,
    fontFamily: 'Montserrat-600',
    flex: 1,
  },
  scanBtn: {
    width: 35,
    height: 35,
    flexShrink: 0,
    backgroundColor: CSS.Colors.GRAY_MEDIUM,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: {
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-700',
    fontSize: 18,
    letterSpacing: 2.5,
  },
  callToAction: {
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-900',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 30,
  },
  msg: {
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-500',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
  },
  msgLink: {
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-700',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginBottom: 30,
  },
  connectBtn: {
    height: 60,
    backgroundColor: CSS.Colors.ORANGE,
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
  shockBtn: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: CSS.Colors.TEXT_WHITE,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
    opacity: 0.7,
  },
  shockBtnText: {
    fontSize: 15,
    letterSpacing: 1,
    color: CSS.Colors.BLUE_DARK,
    fontFamily: 'Montserrat-700',
    marginLeft: 10,
  },
})
