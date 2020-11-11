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
import { throttledExchangeKeyPair } from '../store/actions/ConnectionActions'
/** @type {number} */
// @ts-expect-error
const shockBG = require('../assets/images/shock-bg.png')

export const CONNECT_TO_NODE = 'CONNECT_TO_NODE'
const HOSTING_SERVER = 'pool.shock.network'

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
 * @augments React.PureComponent<Props, State, never>
 */
class ConnectToNode extends React.PureComponent {
  /**
   * @type {import('react-navigation-stack').NavigationStackOptions}
   */
  static navigationOptions = {
    header: () => null,
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
    this.mounted = false
    this.didFocusSub.remove()
  }

  checkCacheForNodeURL = async () => {
    this.mounted && this.setState(DEFAULT_STATE)
    try {
      const nodeURL = await Cache.getNodeURL()
      const err = this.props.navigation.getParam('err')

      if (nodeURL !== null && !err) {
        this.props.navigation.navigate(WALLET_MANAGER)
      } else {
        this.mounted &&
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
      this.mounted &&
        this.setState({
          checkingCacheForNodeURL: false,
        })
    }
  }

  /**
   * @private
   * @param {string} invitationCode
   */
  onChangeInvitationCode = invitationCode => {
    this.mounted &&
      this.setState({
        invitationCode,
      })
  }

  /** @private */
  onPressConnectViaInvite = async () => {
    const { invitationCode, externalURL } = this.state
    try {
      Logger.log('requesting with', invitationCode)
      const resp = await fetch(`http://${HOSTING_SERVER}/mainnet`, {
        headers: {
          Accept: 'application/json',
          Authorization: invitationCode,
        },
      })
      Logger.log(resp)
      this.mounted &&
        this.setState({ nodeURL: (await resp.json()).data.address })
    } catch (error) {
      Logger.log(error)
    }

    setTimeout(() => {
      this.mounted &&
        this.setState(
          {
            pinging: true,
          },
          async () => {
            try {
              Logger.log('received response', this.state.nodeURL)
              await this.connectURL(this.state.nodeURL)
            } catch (err) {
              try {
                Logger.log(
                  'CONNECTURL FAILED, TRYING ONCE MORE TIME, ERR: ' +
                    err.message,
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
    }, 5000)
  }

  /**
   * @private
   * @param {string} nodeURL
   */
  onChangeNodeURL = nodeURL => {
    this.mounted &&
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
    this.mounted &&
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
      this.mounted &&
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

  toggleInvitation = () => {
    this.mounted &&
      this.setState(({ isUsingInvitation }) => ({
        isUsingInvitation: !isUsingInvitation,
      }))
  }

  render() {
    const {
      checkingCacheForNodeURL,
      nodeURL,
      wasBadPing,
      pinging,
      scanningQR,
      isUsingInvitation,
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
          {isUsingInvitation ? 'Invitation Code' : 'Node Address'}
        </Text>

        <Pad amount={ITEM_SPACING} />

        {isUsingInvitation ? (
          <OnboardingInput
            autoCapitalize="none"
            autoCorrect={false}
            disable={pinging || wasBadPing || !!err}
            onChangeText={this.onChangeInvitationCode}
            placeholder="Enter your invitation code"
            value={this.state.invitationCode}
          />
        ) : (
          <OnboardingInput
            autoCapitalize="none"
            autoCorrect={false}
            disable={pinging || wasBadPing || !!err}
            onChangeText={this.onChangeNodeURL}
            onPressQRBtn={this.toggleQRScreen}
            placeholder="Enter your node IP"
            value={nodeURL}
          />
        )}

        <Pad amount={ITEM_SPACING} />

        {!(wasBadPing || !!err) && (
          <>
            {isUsingInvitation ? (
              <OnboardingBtn
                onPress={this.onPressConnectViaInvite}
                title={wasBadPing || err ? 'Continue' : 'Create and Connect'}
              />
            ) : (
              <OnboardingBtn
                disabled={!isValidIP(nodeURL) || pinging}
                onPress={
                  wasBadPing || err ? this.onPressTryAgain : this.onPressConnect
                }
                title={wasBadPing || err ? 'Continue' : 'Connect'}
              />
            )}

            <Pad amount={ITEM_SPACING} />

            {isUsingInvitation ? (
              <Text style={linkTextStyle} onPress={this.toggleInvitation}>
                Use Node Address
              </Text>
            ) : (
              <>
                <Text style={linkTextStyle} onPress={this.openDocsLink}>
                  Don't have a node?
                </Text>

                <Pad amount={ITEM_SPACING} />

                <Text style={linkTextStyle} onPress={this.toggleInvitation}>
                  Use Invitation Code
                </Text>
              </>
            )}
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
 * @param {typeof import('../store/reducers/index').default} state
 */
const mapStateToProps = ({ connection }) => ({ connection })

const mapDispatchToProps = {
  throttledExchangeKeyPair,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConnectToNode)
