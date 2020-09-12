/* eslint-disable no-console */
/**
 * @prettier
 */
import React from 'react'
import { Text, Linking } from 'react-native'
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
import { WALLET_MANAGER } from '../navigators/WalletManager'
import { ITEM_SPACING, linkTextStyle } from '../components/OnboardingScreen'
import OnboardingInput from '../components/OnboardingInput'
import OnboardingBtn from '../components/OnboardingBtn'

const HOSTING_SERVER = '167.88.11.204:8080'

/**
 * @typedef {object} Params
 * @prop {string|null} err
 */

/**
 * @typedef {object} Props
 * @prop {Navigation} navigation
 * @prop {boolean} mounted
 */

/**
 * @typedef {object} QRData
 * @prop {string} internalIP
 * @prop {string} externalIP
 * @prop {(number)=} walletPort
 */

/**
 * @typedef {object} State
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
class InvitationLogin extends React.Component {
  /**
   * @type {import('react-navigation').NavigationScreenOptions}
   */
  static navigationOptions = {
    header: null,
  }

  theme = 'dark'

  /** @type {State} */
  state = DEFAULT_STATE

  mounted = this.props.mounted

  /**
   * @private
   * @param {string} nodeURL
   */
  onChangeNodeURL = nodeURL => {
    this.setState({
      nodeURL,
    })
  }

  /**
   * @private
   * @param {string} invitationCode
   */
  onChangeInvitationCode = invitationCode => {
    this.setState({
      invitationCode,
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

  /** @private */
  onPressConnectViaInvite = async () => {
    const { invitationCode, externalURL } = this.state
    try {
      console.log('requesting with', invitationCode)
      const resp = await fetch(`http://${HOSTING_SERVER}/mainnet`, {
        headers: {
          Accept: 'application/json',
          Authorization: invitationCode,
        },
      })
      console.log(resp)
      this.setState({ nodeURL: (await resp.json()).data.address })
    } catch (error) {
      console.log(error)
    }

    setTimeout(() => {
      this.mounted &&
        this.setState(
          {
            pinging: true,
          },
          async () => {
            try {
              console.log('received response', this.state.nodeURL)
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
    const { nodeURL, wasBadPing, pinging } = this.state

    const err = this.props.navigation.getParam('err')

    if (this.state.isUsingInvitation) {
      return (
        <>
          <OnboardingInput
            autoCapitalize="none"
            autoCorrect={false}
            disable={pinging || wasBadPing || !!err}
            onChangeText={this.onChangeInvitationCode}
            placeholder="Enter your invitation code"
            value={this.state.invitationCode}
          />

          <Pad amount={ITEM_SPACING} />

          {!(wasBadPing || !!err) && (
            <>
              <OnboardingBtn
                onPress={this.onPressConnectViaInvite}
                title={wasBadPing || err ? 'Continue' : 'Create and Connect'}
              />

              <Pad amount={ITEM_SPACING} />

              <Text
                style={linkTextStyle}
                // eslint-disable-next-line react/jsx-no-bind
                onPress={() => this.setState({ isUsingInvitation: false })}
              >
                Use Node Address
              </Text>
            </>
          )}
        </>
      )
    }

    return (
      <>
        <OnboardingInput
          autoCapitalize="none"
          autoCorrect={false}
          disable={pinging || wasBadPing || !!err}
          onChangeText={this.onChangeNodeURL}
          onPressQRBtn={this.toggleQRScreen}
          placeholder="Enter your node IP"
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
            <Pad amount={ITEM_SPACING} />
            <Text
              style={linkTextStyle}
              // eslint-disable-next-line react/jsx-no-bind
              onPress={() => this.setState({ isUsingInvitation: true })}
            >
              Use Invitation Code
            </Text>
          </>
        )}
      </>
    )
  }
}

export default InvitationLogin
