/**
 * @prettier
 */
import React from 'react'
import { StyleSheet, Text, TextInput, View, ToastAndroid } from 'react-native'
/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}>} Navigation
 */

import * as API from '../services/contact-api'
import * as Cache from '../services/cache'
import * as Auth from '../services/auth'
import * as CSS from '../res/css'
import ShockDialog from '../components/ShockDialog'
import { APP } from '../navigators/Root'
import { CREATE_WALLET_OR_ALIAS } from '../navigators/WalletManager/CreateWalletOrAlias'
import * as Wallet from '../services/wallet'
import OnboardingScreen, {
  titleTextStyle,
  ITEM_SPACING,
  linkTextStyle,
} from '../components/OnboardingScreen'
import { WALLET_MANAGER } from '../navigators/WalletManager'
import Pad from '../components/Pad'
import OnboardingInput from '../components/OnboardingInput'
import OnboardingBtn from '../components/OnboardingBtn'
import * as Navigation from '../services/navigation'
import { CONNECT_TO_NODE } from '../screens/ConnectToNode'

export const LOGIN = 'LOGIN'

/** @type {number} */
// @ts-ignore
const shockBG = require('../assets/images/shock-bg.png')

/**
 * @typedef {object} Props
 * @prop {Navigation} navigation
 */

/**
 * @typedef {object} State
 * @prop {string} alias
 * @prop {string|null} cachedAlias
 * @prop {boolean} awaitingRes
 * @prop {boolean} fetchingCachedAlias
 * @prop {string} err
 * @prop {string} pass
 * @prop {Wallet.WalletStatus|null} walletStatus Null when fetching.
 * @prop {boolean} deletingNodeIP
 */

/**
 * @augments React.Component<Props, State>
 */
export default class Login extends React.Component {
  /**
   * @type {import('react-navigation').NavigationScreenOptions}
   */
  static navigationOptions = {
    header: null,
  }

  /** @type {State} */
  state = {
    alias: '',
    cachedAlias: null,
    awaitingRes: false,
    fetchingCachedAlias: true,
    err: '',
    pass: '',
    walletStatus: null,
    deletingNodeIP: false,
  }

  /** @type {React.RefObject<TextInput>} */
  passwordRef = React.createRef()

  afterAlias = () => {
    const { current } = this.passwordRef

    current && current.focus()
  }

  didFocusSub = {
    remove() {},
  }

  componentDidMount() {
    this.setup()
    this.didFocusSub = this.props.navigation.addListener('didFocus', this.setup)
  }

  componentWillUnmount() {
    this.didFocusSub.remove()
  }

  setup = async () => {
    this.setState({
      cachedAlias: null,
      fetchingCachedAlias: true,
      deletingNodeIP: false,
    })

    const walletStatus = await Wallet.walletStatus()

    if (walletStatus === 'noncreated') {
      this.props.navigation.navigate(WALLET_MANAGER)
    }

    const sad = await Cache.getStoredAuthData()

    if (sad !== null && sad.authData !== null) {
      this.setState({
        cachedAlias: sad.authData.alias,
      })
    }

    this.setState({
      fetchingCachedAlias: false,
      walletStatus,
    })
  }

  /**
   * @private
   */
  dismissDialog = () => {
    this.setState({
      err: '',
    })
  }

  /** @private */
  dismissCachedAlias = () => {
    this.setState({
      cachedAlias: null,
    })
  }

  /**
   * @private
   * @param {string} alias
   * @returns {void}
   */
  onChangeAlias = alias => {
    this.setState({ alias })
  }

  /**
   * @private
   * @param {string} pass
   * @returns {void}
   */
  onChangePass = pass => {
    this.setState({ pass })
  }

  /** @private */
  onPressCreateNewAlias = () => {
    if (this.state.walletStatus === 'unlocked') {
      this.setState({
        err:
          'LND must be in a locked state to pair a new alias, please restart LND and try again.',
      })
    } else {
      this.props.navigation.navigate(CREATE_WALLET_OR_ALIAS)
    }
  }

  /**
   * @private
   * @returns {void}
   */
  onPressUnlock = () => {
    const {
      alias,
      awaitingRes,
      cachedAlias,
      fetchingCachedAlias,
      pass,
      walletStatus,
    } = this.state

    const loading = awaitingRes || fetchingCachedAlias || walletStatus === null

    const enabled =
      !loading && (alias.length > 0 || cachedAlias !== null) && pass.length > 0

    if (!enabled) {
      return
    }

    const aliasToUse = alias || cachedAlias

    if (typeof aliasToUse !== 'string') {
      throw new TypeError("typeof aliasToUse !== 'string'")
    }

    if (aliasToUse.length === 0) {
      throw new TypeError('aliasToUse.length === 0')
    }

    this.setState(
      {
        awaitingRes: true,
      },
      () => {
        Auth.unlockWallet(aliasToUse, this.state.pass)
          .then(res => {
            Cache.writeStoredAuthData({
              alias: aliasToUse,
              publicKey: res.publicKey,
              token: res.token,
            })

            return API.Socket.connect()
          })
          .then(() => {
            this.setState({
              awaitingRes: false,
            })
            this.props.navigation.navigate(APP)
          })
          .catch(e => {
            this.setState({
              awaitingRes: false,
            })
            /*this.setState({
              err: e.message,
            })*/
            ToastAndroid.show(e.message, 800)
          })
      },
    )
  }

  onPressChangeNode = async () => {
    this.setState({ deletingNodeIP: true })
    await Cache.writeNodeURLOrIP(null)
    Navigation.navigate(CONNECT_TO_NODE)
  }

  render() {
    const {
      alias,
      awaitingRes,
      cachedAlias,
      err,
      fetchingCachedAlias,
      pass,
      walletStatus,
      deletingNodeIP,
    } = this.state
    const loading =
      awaitingRes ||
      fetchingCachedAlias ||
      walletStatus === null ||
      deletingNodeIP
    const enableUnlockBtn =
      !loading && (alias.length > 0 || cachedAlias !== null) && pass.length > 0

    return (
      <>
        <OnboardingScreen loading={loading}>
          <Text style={titleTextStyle}>Unlock Wallet</Text>
          <Pad amount={ITEM_SPACING} />
          {cachedAlias ? (
            <View style={xStyles.cachedAliasContainer}>
              <Text style={styles.textInputFieldLabel}>
                {`Alias:   ${cachedAlias}`}
              </Text>
              <Text
                onPress={this.dismissCachedAlias}
                style={xStyles.changeText}
              >
                Change
              </Text>
            </View>
          ) : (
            <OnboardingInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={this.onChangeAlias}
              onSubmitEditing={this.afterAlias}
              placeholder="Alias"
              returnKeyType="next"
              value={alias}
            />
          )}
          <Pad amount={ITEM_SPACING} />
          <OnboardingInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={this.onChangePass}
            placeholder="Password"
            ref={this.passwordRef}
            secureTextEntry
            textContentType="password"
            value={pass}
          />
          <Pad amount={ITEM_SPACING} />
          <OnboardingBtn
            disabled={!enableUnlockBtn}
            onPress={this.onPressUnlock}
            title="Connect"
          />
          <Pad amount={ITEM_SPACING} />
          <Text onPress={this.onPressCreateNewAlias} style={linkTextStyle}>
            Create new alias
          </Text>
          <Pad amount={ITEM_SPACING / 2} />
          <Text onPress={this.onPressChangeNode} style={linkTextStyle}>
            Use another node
          </Text>
        </OnboardingScreen>

        <ShockDialog
          message={err}
          onRequestClose={this.dismissDialog}
          visible={!!err}
        />
      </>
    )
  }
}

const styles = StyleSheet.create({
  textInputFieldLabel: {
    marginBottom: 10,
    marginLeft: 15,
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-600',
  },
})

const xStyles = {
  cachedAliasContainer: [CSS.styles.justifySpaceBetween, CSS.styles.flexRow],
  createAliasText: [styles.textInputFieldLabel, CSS.styles.textAlignCenter],
  changeText: [CSS.styles.textUnderlined, styles.textInputFieldLabel],
}
