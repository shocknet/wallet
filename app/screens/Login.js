/**
 * @prettier
 */
import React from 'react'
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
  ImageBackground,
  TouchableOpacity,
} from 'react-native'
/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}>} Navigation
 */

import * as API from '../services/contact-api'
import * as Cache from '../services/cache'
import * as Auth from '../services/auth'
import * as CSS from '../css'
import ShockDialog from '../components/ShockDialog'
import { APP } from '../navigators/Root'
import { CREATE_WALLET_OR_ALIAS } from '../navigators/WalletManager/CreateWalletOrAlias'

export const LOGIN = 'LOGIN'

const SHOCK_LOGO_STYLE = { width: 100, height: 100 }

/** @type {number} */
// @ts-ignore
const shockBG = require('../assets/images/shock-bg.png')
/** @type {number} */
// @ts-ignore
const shockLogo = require('../assets/images/shocklogo.png')

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
 */

/**
 * @augments React.PureComponent<Props, State>
 */
export default class Login extends React.PureComponent {
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
  }

  didFocusSub = {
    remove() {},
  }

  componentDidMount() {
    this.getCachedAlias()
    this.didFocusSub = this.props.navigation.addListener(
      'didFocus',
      this.getCachedAlias,
    )
  }

  componentWillUnmount() {
    this.didFocusSub.remove()
  }

  getCachedAlias = async () => {
    this.setState({
      cachedAlias: null,
      fetchingCachedAlias: true,
    })

    const sad = await Cache.getStoredAuthData()

    if (sad !== null && sad.authData !== null) {
      this.setState({
        cachedAlias: sad.authData.alias,
      })
    }

    this.setState({
      fetchingCachedAlias: false,
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
    this.props.navigation.navigate(CREATE_WALLET_OR_ALIAS)
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
    } = this.state

    const loading = awaitingRes || fetchingCachedAlias

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
            this.setState({
              err: e.message,
            })
          })
      },
    )
  }

  render() {
    const {
      alias,
      awaitingRes,
      cachedAlias,
      fetchingCachedAlias,
      pass,
    } = this.state
    const loading = awaitingRes || fetchingCachedAlias
    const enableUnlockBtn =
      !loading && (alias.length > 0 || cachedAlias !== null) && pass.length > 0

    return (
      <ImageBackground source={shockBG} style={styles.container}>
        <View style={styles.shockWalletLogoContainer}>
          <Image style={SHOCK_LOGO_STYLE} source={shockLogo} />
          <Text style={styles.logoText}>S H O C K W A L L E T</Text>
        </View>

        {loading ? <ActivityIndicator animating size="large" /> : null}

        {!loading ? (
          <View style={styles.shockWalletCallToActionContainer}>
            <Text style={styles.callToAction}>Unlock Wallet</Text>
          </View>
        ) : null}

        {!loading ? (
          <View style={styles.formContainer}>
            {cachedAlias && (
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
            )}
            {!cachedAlias && (
              <React.Fragment>
                <Text style={styles.textInputFieldLabel}>Alias</Text>
                <View style={styles.textInputFieldContainer}>
                  <TextInput
                    editable={!loading}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={this.onChangeAlias}
                    style={styles.textInputField}
                    value={alias}
                  />
                </View>
              </React.Fragment>
            )}
            <Text style={styles.textInputFieldLabel}>Password</Text>
            <View style={styles.textInputFieldContainer}>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                onChangeText={this.onChangePass}
                style={styles.textInputField}
                secureTextEntry
                value={pass}
              />
            </View>

            <TouchableOpacity
              disabled={!enableUnlockBtn}
              onPress={this.onPressUnlock}
              style={styles.connectBtn}
            >
              <Text style={styles.connectBtnText}>Connect</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <Text
          onPress={this.onPressCreateNewAlias}
          style={xStyles.createAliasText}
        >
          Create a new Alias
        </Text>

        <ShockDialog
          message={this.state.err}
          onRequestClose={this.dismissDialog}
          visible={!!this.state.err}
        />
      </ImageBackground>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CSS.Colors.BLUE_DARK,
    justifyContent: 'space-around',
    minHeight: 600,
    paddingLeft: 30,
    paddingRight: 30,
  },
  shockWalletLogoContainer: {
    alignItems: 'center',
  },
  shockWalletCallToActionContainer: {
    alignItems: 'center',
  },
  formContainer: {
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
  textInputFieldLabel: {
    marginBottom: 10,
    marginLeft: 15,
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-600',
  },
  textInputFieldContainer: {
    flexDirection: 'row',
    backgroundColor: CSS.Colors.TEXT_WHITE,
    height: 50,
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
  logoText: {
    color: CSS.Colors.TEXT_WHITE,
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 10,
  },
  callToAction: {
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-700',
    fontSize: 28,
  },
})

const xStyles = {
  cachedAliasContainer: [CSS.styles.justifySpaceBetween, CSS.styles.flexRow],
  createAliasText: [styles.textInputFieldLabel, CSS.styles.textAlignCenter],
  changeText: [CSS.styles.textUnderlined, styles.textInputFieldLabel],
}
