import React from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Keyboard,
  ScrollView,
  Dimensions,
} from 'react-native'
import EntypoIcon from 'react-native-vector-icons/Entypo'
/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}>} Navigation
 */

import ShockDialog from '../../components/ShockDialog'

import * as Auth from '../../services/auth'
import * as Cache from '../../services/cache'
import * as CSS from '../../res/css'
import * as Wallet from '../../services/wallet'
import { LOGIN } from '../../screens/Login'
import { Socket } from '../../services/contact-api'
import { APP } from '../Root'

export const CREATE_WALLET_OR_ALIAS = 'CREATE_WALLET_OR_ALIAS'

/**
 * @typedef {object} Props
 * @prop {Navigation} navigation
 */

/**
 * @typedef {object} State
 * @prop {string} alias
 * @prop {boolean} creatingAlias
 * @prop {boolean} creatingWallet
 * @prop {boolean} fetchingWalletStatus
 * @prop {string|null} msg
 * @prop {string} pass
 * @prop {boolean} keyboardOpen
 * @prop {string} repeatPass
 * @prop {Wallet.WalletStatus|null} walletStatus
 */

/**
 * @augments React.PureComponent<Props, State>
 */
export default class CreateWallet extends React.PureComponent {
  /**
   * @type {State}
   */
  state = {
    alias: '',
    creatingAlias: false,
    creatingWallet: false,
    fetchingWalletStatus: true,
    keyboardOpen: false,
    msg: null,
    pass: '',
    repeatPass: '',
    walletStatus: null,
  }

  /** @type {{ remove: () => void; } | null} */
  keyboardDidShowListener = null

  /** @type {{ remove: () => void; } | null} */
  keyboardDidHideListener = null

  /** @type {import('react-native').TextInput|null} */
  passwordRef = null

  /** @type {import('react-native').TextInput|null} */
  confirmPassword = null

  onFocusSub = {
    remove() {},
  }

  componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this.keyboardDidShow,
    )
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this.keyboardDidHide,
    )
    this.onFocusSub = this.props.navigation.addListener(
      'didFocus',
      this.checkWalletStatus,
    )
  }

  componentWillUnmount() {
    if (this.keyboardDidShowListener) this.keyboardDidShowListener.remove()
    if (this.keyboardDidHideListener) this.keyboardDidHideListener.remove()
  }

  checkWalletStatus = () => {
    this.setState(
      {
        fetchingWalletStatus: true,
        walletStatus: null,
      },
      async () => {
        try {
          const walletStatus = await Wallet.walletStatus()

          this.setState({
            fetchingWalletStatus: false,
            walletStatus,
          })
        } catch (e) {
          this.setState({
            fetchingWalletStatus: false,
            walletStatus: null,
          })
        }
      },
    )
  }

  keyboardDidShow = () => {
    this.setState({
      keyboardOpen: true,
    })
  }

  keyboardDidHide = () => {
    this.setState({
      keyboardOpen: false,
    })
  }

  /**
   * @private
   */
  dismissDialog = () => {
    this.setState({
      msg: null,
    })
  }

  /**
   * @private
   * @param {string} alias
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

  /**
   * @private
   * @param {string} repeatPass
   * @returns {void}
   */
  onChangeRepeatPass = repeatPass => {
    this.setState({ repeatPass })
  }

  /**
   * @private
   * @returns {void}
   */
  onPressCreateWallet = () => {
    const { alias, pass } = this.state
    this.setState(
      {
        creatingWallet: true,
      },
      () => {
        Auth.createWallet(alias, pass)
          .then(({ publicKey, token }) =>
            Cache.writeStoredAuthData({
              alias: this.state.alias,
              publicKey,
              token,
            }),
          )
          .then(Socket.connect)
          .then(() => this.props.navigation.navigate(APP))
          .catch(e => {
            this.setState({
              msg: e.message,
            })
          })
          .finally(() => {
            this.setState({
              creatingWallet: false,
            })
          })
      },
    )
  }

  /** @private */
  onPressCreateAlias = () => {
    const { alias, pass } = this.state
    this.setState({
      alias: '',
      creatingAlias: true,
      pass: '',
    })

    Auth.newGUNAlias(alias, pass)
      .then(({ publicKey, token }) =>
        Cache.writeStoredAuthData({
          alias,
          publicKey,
          token,
        }),
      )
      .then(() => {
        this.setState({
          creatingAlias: false,
        })

        this.props.navigation.goBack()
      })
      .catch(err => {
        this.setState({
          creatingAlias: false,
          msg: err.message,
        })
      })
  }

  afterAlias = () => {
    if (this.passwordRef) {
      this.passwordRef.focus()
    }
  }

  afterPass = () => {
    if (this.confirmPasswordRef) {
      this.confirmPasswordRef.focus()
    }
  }

  /**
   * @param {import('react-native').TextInput} ref
   */
  onPassRef = ref => {
    this.passwordRef = ref
  }

  /**
   * @param {import('react-native').TextInput} ref
   */
  onConfirmPassRef = ref => {
    this.confirmPasswordRef = ref
  }

  onPressUseExistingAlias = () => {
    this.props.navigation.navigate(LOGIN)
  }

  render() {
    const {
      alias,
      creatingAlias,
      creatingWallet,
      fetchingWalletStatus,
      msg,
      pass,
      repeatPass,
      keyboardOpen,
      walletStatus,
    } = this.state

    return (
      <View
        style={[
          styles.container,
          creatingWallet && styles.noPadding,
          keyboardOpen && styles.bottomPadding30,
        ]}
      >
        {creatingWallet && (
          <View style={[styles.subContainer, styles.creatingWalletDialog]}>
            <View style={styles.formHead}>
              <View style={styles.formHeadIconContainer}>
                <EntypoIcon name="wallet" size={45} color="#4285b9" />
              </View>
            </View>
            <View>
              <Text style={[styles.textInputLabel, styles.textAlignCenter]}>
                Creating wallet... (this can take a while)
              </Text>
              <ActivityIndicator size="large" color="#3775ae" />
            </View>
          </View>
        )}

        {creatingAlias && (
          <View style={[styles.subContainer, styles.creatingWalletDialog]}>
            <View style={styles.formHead}>
              <View style={styles.formHeadIconContainer}>
                <EntypoIcon name="wallet" size={45} color="#4285b9" />
              </View>
            </View>
            <View>
              <Text style={[styles.textInputLabel, styles.textAlignCenter]}>
                Creating alias... (this can take a while)
              </Text>
              <ActivityIndicator size="large" color="#3775ae" />
            </View>
          </View>
        )}

        {!creatingWallet &&
          (fetchingWalletStatus ? (
            <View style={[styles.subContainer, styles.creatingWalletDialog]}>
              <View style={styles.formHead}>
                <View style={styles.formHeadIconContainer}>
                  <EntypoIcon name="wallet" size={45} color="#4285b9" />
                </View>
              </View>
              <View>
                <Text style={[styles.textInputLabel, styles.textAlignCenter]}>
                  Fetching Wallet Status...
                </Text>
                <ActivityIndicator size="large" color="#3775ae" />
              </View>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={[
                styles.subContainer,
                {
                  height: Dimensions.get('window').height - 120,
                },
              ]}
            >
              <View style={styles.formHead}>
                <Text style={styles.formHeadText}>
                  {walletStatus === 'noncreated'
                    ? 'Creating a new Wallet'
                    : 'Creating a new GUN Alias'}
                </Text>
                <View style={styles.formHeadIconContainer}>
                  <EntypoIcon
                    name={walletStatus === 'noncreated' ? 'wallet' : 'user'}
                    size={45}
                    color={CSS.Colors.BLUE_LIGHT}
                  />
                  {walletStatus !== 'noncreated' && (
                    <Text>New GUN Alias (Wallet already created)</Text>
                  )}
                </View>
              </View>
              <View>
                <Text style={styles.textInputLabel}>
                  {walletStatus === 'noncreated'
                    ? 'Alias (This will be your GUN alias)'
                    : 'Alias (This will be your new GUN alias)'}
                </Text>
                <View style={styles.textInputFieldContainer}>
                  <TextInput
                    style={styles.textInputField}
                    onChangeText={this.onChangeAlias}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={alias}
                    returnKeyType="next"
                    onSubmitEditing={this.afterAlias}
                  />
                </View>

                <Text style={styles.textInputLabel}>
                  {walletStatus === 'noncreated'
                    ? `Password (this will be both your GUN and wallet password)`
                    : `Password (has to be the same password as your wallet / previous GUN alias)`}
                </Text>
                <View style={styles.textInputFieldContainer}>
                  <TextInput
                    style={styles.textInputField}
                    onChangeText={this.onChangePass}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="password"
                    secureTextEntry
                    value={pass}
                    returnKeyType={
                      walletStatus === 'noncreated' ? 'next' : 'default'
                    }
                    ref={this.onPassRef}
                    onSubmitEditing={
                      walletStatus === 'noncreated' ? this.afterPass : undefined
                    }
                  />
                </View>

                {walletStatus === 'noncreated' && (
                  <React.Fragment>
                    <Text style={styles.textInputLabel}>Confirm Password</Text>
                    <View style={styles.textInputFieldContainer}>
                      <TextInput
                        style={styles.textInputField}
                        onChangeText={this.onChangeRepeatPass}
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="password"
                        secureTextEntry
                        value={repeatPass}
                        returnKeyType="done"
                        ref={this.onConfirmPassRef}
                      />
                    </View>
                  </React.Fragment>
                )}

                <TouchableOpacity
                  disabled={
                    (pass !== repeatPass && walletStatus === 'noncreated') ||
                    pass.length === 0 ||
                    alias.length === 0
                  }
                  onPress={
                    walletStatus === 'noncreated'
                      ? this.onPressCreateWallet
                      : this.onPressCreateAlias
                  }
                  style={styles.connectBtn}
                >
                  <Text style={styles.connectBtnText}>
                    {walletStatus === 'noncreated'
                      ? 'Create new Wallet/GUN User'
                      : 'Create new GUN Alias'}
                  </Text>
                </TouchableOpacity>

                {walletStatus !== 'noncreated' && (
                  <View style={CSS.styles.deadCenter}>
                    <Text
                      onPress={this.onPressUseExistingAlias}
                      style={styles.textInputLabel}
                    >
                      Use Existing Alias
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          ))}

        <ShockDialog
          message={msg}
          onRequestClose={this.dismissDialog}
          visible={!!msg}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CSS.Colors.BLUE_DARK,
    justifyContent: 'space-around',
    padding: 30,
    paddingTop: 0,
  },

  creatingWalletDialog: {
    height: '100%',
    justifyContent: 'center',
    borderRadius: 0,
  },

  noPadding: {
    padding: 0,
  },

  bottomPadding30: {
    paddingBottom: 30,
  },

  textInputLabel: {
    marginBottom: 10,
    marginLeft: 15,
    fontFamily: 'Montserrat-600',
  },
  connectBtn: {
    height: 60,
    backgroundColor: CSS.Colors.BLUE_LIGHT,
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
  subContainer: {
    justifyContent: 'space-between',
    width: '100%',
    minHeight: 300,
    borderRadius: 15,
    backgroundColor: CSS.Colors.BACKGROUND_WHITE,
    padding: 30,
    overflow: 'hidden',
  },
  formHead: {
    marginBottom: 30,
    alignItems: 'center',
  },
  formHeadText: {
    fontFamily: 'Montserrat-700',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 25,
  },
  formHeadIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    height: 90,
    borderRadius: 100,
    backgroundColor: CSS.Colors.BACKGROUND_NEAR_WHITE,
  },
  textInputFieldContainer: {
    flexDirection: 'row',
    backgroundColor: CSS.Colors.BACKGROUND_NEAR_WHITE,
    height: 40,
    borderRadius: 100,
    paddingLeft: 25,
    marginBottom: 25,
    // marginHorizontal: 10,
    elevation: 3,
    alignItems: 'center',
  },
  textInputField: {
    fontSize: 14,
    fontFamily: 'Montserrat-600',
    flex: 1,
  },
  textAlignCenter: {
    textAlign: 'center',
  },
})
