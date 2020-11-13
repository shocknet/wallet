import React from 'react'
import {
  Text,
  TextInput,
  View,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native'
import Entypo from 'react-native-vector-icons/Entypo'
import { connect } from 'react-redux'
import Logger from 'react-native-file-log'

/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}>} Navigation
 */

import ShockDialog from '../../components/ShockDialog'
import * as Auth from '../../services/auth'
import * as Cache from '../../services/cache'
import * as CSS from '../../res/css'
import * as Wallet from '../../services/wallet'
import { LOGIN, APP } from '../../routes'
import Pad from '../../components/Pad'
import OnboardingScreen, {
  ITEM_SPACING,
  titleTextStyle,
  linkTextStyle,
} from '../../components/OnboardingScreen'
import OnboardingInput from '../../components/OnboardingInput'
import OnboardingBtn from '../../components/OnboardingBtn'
import FlexCenter from '../../components/FlexCenter'
import * as Store from '../../store'

export const CREATE_WALLET_OR_ALIAS = 'CREATE_WALLET_OR_ALIAS'

/**
 * @typedef {object} Props
 * @prop {Navigation} navigation
 * @prop {typeof Store.authed} authed
 */

/**
 * @typedef {object} State
 * @prop {string} alias
 * @prop {boolean} creatingAlias
 * @prop {boolean} creatingWallet
 * @prop {boolean} fetchingWalletStatus
 * @prop {string|null} msg
 * @prop {string} pass
 * @prop {string} repeatPass
 * @prop {Wallet.WalletStatus|null} walletStatus
 */

/**
 * @augments React.PureComponent<Props, State>
 */
class CreateWalletOrAlias extends React.PureComponent {
  /**
   * @type {import('react-navigation-stack').NavigationStackOptions}
   */
  static navigationOptions = ({
    title: 'CREATE WALLET/ALIAS',
  })

  /**
   * @type {State}
   */
  state = {
    alias: '',
    creatingAlias: false,
    creatingWallet: false,
    fetchingWalletStatus: true,
    msg: null,
    pass: '',
    repeatPass: '',
    walletStatus: null,
  }

  /** @type {React.RefObject<TextInput>} */
  passwordRef = React.createRef()

  /** @type {React.RefObject<TextInput>} */
  confirmPassword = React.createRef()

  onFocusSub = {
    remove() {},
  }

  componentDidMount() {
    Logger.log('Hello')
    this.onFocusSub = this.props.navigation.addListener(
      'didFocus',
      this.checkWalletStatus,
    )
  }

  componentWillUnmount() {
    this.onFocusSub.remove()
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

          if (walletStatus === 'unlocked') {
            this.props.navigation.navigate(LOGIN)
          }

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

  dismissDialog = () => {
    this.setState({
      msg: null,
    })

    this.checkWalletStatus()
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
    const { alias, pass, repeatPass } = this.state

    if (pass !== repeatPass) {
      Alert.alert(
        'Password mismatch',
        'The two password fields should match.',
        [
          {
            text: 'Close',
          },
        ],
      )
      return
    }

    this.setState(
      {
        creatingWallet: true,
      },
      () => {
        Auth.createWallet(alias, pass)
          .then(async ({ publicKey, token }) => {
            await Cache.writeStoredAuthData({
              alias: this.state.alias,
              publicKey,
              token,
            })

            return { alias: this.state.alias, publicKey, token }
          })
          .then(({ alias, publicKey, token }) => {
            this.props.authed({
              alias,
              gunPublicKey: publicKey,
              token,
            })
          })
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
      .then(async ({ publicKey, token }) => {
        await Cache.writeStoredAuthData({
          alias,
          publicKey,
          token,
        })

        return { alias, publicKey, token }
      })
      .then(({ alias, publicKey, token }) => {
        this.props.authed({
          alias,
          gunPublicKey: publicKey,
          token,
        })
      })
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
    const { passwordRef } = this
    passwordRef.current && passwordRef.current.focus()
  }

  afterPass = () => {
    if (this.state.walletStatus !== 'noncreated') return
    const { confirmPassword } = this
    confirmPassword.current && confirmPassword.current.focus()
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
      walletStatus,
    } = this.state

    const loading = creatingAlias || fetchingWalletStatus

    if (creatingWallet) {
      return (
        <>
          <StatusBar barStyle="dark-content" />
          <FlexCenter>
            <Entypo name="wallet" size={45} color="#4285b9" />
            <Pad amount={10} />
            <Text
              style={[CSS.styles.textAlignCenter, CSS.styles.fontMontserrat]}
            >
              Creating wallet, hang tight...
            </Text>
            <Pad amount={10} />
            <ActivityIndicator
              size="large"
              color={CSS.Colors.BACKGROUND_BLUE}
            />
          </FlexCenter>
        </>
      )
    }

    return (
      <>
        <OnboardingScreen loading={loading}>
          <>
            <Text style={titleTextStyle}>
              {walletStatus === 'noncreated'
                ? 'Create Network Identity'
                : 'Create Network Identity'}
            </Text>

            <Pad amount={ITEM_SPACING} />

            <OnboardingInput
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onChangeText={this.onChangeAlias}
              onSubmitEditing={this.afterAlias}
              placeholder="Alias"
              value={alias}
              tooltip={
                walletStatus === 'noncreated'
                  ? 'This is a canonical name for your key-pair, and can be seen on the network.'
                  : 'This is a canonical name for your key-pair, and can be seen on the network.'
              }
            />

            <Pad amount={ITEM_SPACING} />

            <OnboardingInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={this.onChangePass}
              onSubmitEditing={this.afterPass}
              placeholder={
                walletStatus === 'noncreated' ? 'Password' : 'Wallet password'
              }
              ref={this.passwordRef}
              returnKeyType={walletStatus === 'noncreated' ? 'next' : 'default'}
              secureTextEntry
              textContentType="password"
              value={pass}
              tooltip={
                walletStatus === 'noncreated'
                  ? 'This password cannot be recovered. Use a password manager.'
                  : 'This password cannot be recovered. Use a password manager.'
              }
            />

            {walletStatus === 'noncreated' && (
              <>
                <Pad amount={ITEM_SPACING} />
                <OnboardingInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={this.onChangeRepeatPass}
                  placeholder="Confirm password"
                  returnKeyType="done"
                  ref={this.confirmPassword}
                  secureTextEntry
                  textContentType="password"
                  value={repeatPass}
                />
              </>
            )}

            <Pad amount={ITEM_SPACING} />

            <OnboardingBtn
              disabled={pass.length === 0 || alias.length === 0}
              onPress={
                walletStatus === 'noncreated'
                  ? this.onPressCreateWallet
                  : this.onPressCreateAlias
              }
              title="Confirm"
            />

            {walletStatus !== 'noncreated' && (
              <>
                <Pad amount={ITEM_SPACING} />
                <View style={CSS.styles.deadCenter}>
                  <Text
                    onPress={this.onPressUseExistingAlias}
                    style={linkTextStyle}
                  >
                    Use Existing Alias
                  </Text>
                </View>
              </>
            )}
          </>
        </OnboardingScreen>

        <ShockDialog
          message={msg}
          onRequestClose={this.dismissDialog}
          visible={!!msg}
        />
      </>
    )
  }
}

/**
 * @param {typeof import('../../store/reducers/index').default} state
 */
const mapStateToProps = ({ connection }) => ({ connection })

const mapDispatchToProps = {
  authed: Store.authed,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CreateWalletOrAlias)
