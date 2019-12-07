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
/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}, { awaitingRes: boolean }>} Navigation
 */

import ShockDialog from '../components/ShockDialog'

import * as API from '../services/contact-api'
import * as Auth from '../services/auth'
import * as Cache from '../services/cache'
import * as CSS from '../css'
import EntypoIcon from 'react-native-vector-icons/Entypo'

const SUCCESS_MSG = 'Registration Sucessful'

export const REGISTER = 'REGISTER'
export const LOGIN = 'LOGIN'

/**
 * @typedef {object} Props
 * @prop {Navigation} navigation
 */

/**
 * @typedef {object} State
 * @prop {string} alias
 * @prop {boolean} connected
 * @prop {string|null} msg
 * @prop {string} pass
 * @prop {boolean} keyboardOpen
 * @prop {string} repeatPass
 */

/**
 * @augments React.PureComponent<Props, State>
 */
export default class Register extends React.PureComponent {
  /**
   * @param {{ navigation: Navigation }} args
   * @returns {import('react-navigation').NavigationStackScreenOptions}
   */
  static navigationOptions = ({ navigation }) => {
    const awaitingRes = navigation.getParam('awaitingRes', false)

    return awaitingRes
      ? {
          headerLeft: null,
          gesturesEnabled: false,
          headerStyle: {
            backgroundColor: CSS.Colors.BACKGROUND_WHITE,
            elevation: 0,
          },
        }
      : {
          headerStyle: {
            backgroundColor: CSS.Colors.BLUE_LIGHT,
            elevation: 0,
          },
        }
  }

  connUnsubscribe = () => {}

  regUnsubscribe = () => {}

  /**
   * @type {State}
   */
  state = {
    alias: '',
    connected: false,
    keyboardOpen: false,
    msg: null,
    pass: '',
    repeatPass: '',
  }

  /** @type {{ remove: () => void; } | null} */
  keyboardDidShowListener = null

  /** @type {{ remove: () => void; } | null} */
  keyboardDidHideListener = null

  /** @type {import('react-native').TextInput|null} */
  passwordRef = null

  /** @type {import('react-native').TextInput|null} */
  confirmPassword = null

  async componentDidMount() {
    this.connUnsubscribe = API.Events.onConnection(this.onConn)
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this.keyboardDidShow,
    )
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this.keyboardDidHide,
    )
    const storedAuth = await Cache.getStoredAuthData()
    if (storedAuth) {
      this.props.navigation.navigate(LOGIN)
    }
  }

  componentWillUnmount() {
    this.connUnsubscribe()
    if (this.keyboardDidShowListener) this.keyboardDidShowListener.remove()
    if (this.keyboardDidHideListener) this.keyboardDidHideListener.remove()
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
    if (this.state.msg === SUCCESS_MSG) {
      this.props.navigation.goBack()
    }

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
  onPressRegister = () => {
    this.props.navigation.setParams({
      awaitingRes: true,
    })

    Auth.createWallet(this.state.alias, this.state.pass)
      .then(({ publicKey, token }) => {
        this.props.navigation.goBack()

        Cache.writeStoredAuthData({
          alias: this.state.alias,
          publicKey,
          token,
        })
      })
      .catch(e => {
        if (e.message === 'wallet already exists') {
          this.props.navigation.navigate('LOGIN')
        } else {
          this.setState({
            msg: e.message,
          })
        }
      })
      .finally(() => {
        this.props.navigation.setParams({
          awaitingRes: false,
        })
      })
  }

  /**
   * @private
   * @param {boolean} connected
   * @returns {void}
   */
  onConn = connected => {
    this.setState({
      connected,
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

  render() {
    const { alias, connected, msg, pass, repeatPass, keyboardOpen } = this.state
    const awaitingRes = this.props.navigation.getParam('awaitingRes', false)

    return (
      <View
        style={[
          styles.container,
          awaitingRes && styles.noPadding,
          keyboardOpen && styles.bottomPadding30,
        ]}
      >
        {awaitingRes ? (
          <View style={[styles.subContainer, styles.creatingWalletDialog]}>
            <View style={styles.formHead}>
              <View style={styles.formHeadIconContainer}>
                <EntypoIcon name="wallet" size={45} color="#4285b9" />
              </View>
            </View>
            <View>
              <Text style={[styles.textInputLabel, styles.textAlignCenter]}>
                Creating wallet...
              </Text>
              <ActivityIndicator size="large" color="#3775ae" />
            </View>
          </View>
        ) : null}

        {/* {!awaitingRes ? (
          <View style={styles.center}>
            <Text style={styles.callToAction}>Create Wallet</Text>
          </View>
        ) : null} */}

        {!awaitingRes ? (
          <ScrollView
            contentContainerStyle={[
              styles.subContainer,
              {
                height: Dimensions.get('window').height - 120,
              },
            ]}
          >
            <View style={styles.formHead}>
              <Text style={styles.formHeadText}>WELCOME</Text>
              <View style={styles.formHeadIconContainer}>
                <EntypoIcon
                  name="wallet"
                  size={45}
                  color={CSS.Colors.BLUE_LIGHT}
                />
              </View>
            </View>
            <View>
              <Text style={styles.textInputLabel}>Alias</Text>
              <View style={styles.textInputFieldContainer}>
                <TextInput
                  editable={connected}
                  style={styles.textInputField}
                  onChangeText={this.onChangeAlias}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={alias}
                  returnKeyType="next"
                  onSubmitEditing={this.afterAlias}
                />
              </View>

              <Text style={styles.textInputLabel}>Password</Text>
              <View style={styles.textInputFieldContainer}>
                <TextInput
                  editable={connected}
                  style={styles.textInputField}
                  onChangeText={this.onChangePass}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="password"
                  secureTextEntry
                  value={pass}
                  returnKeyType="next"
                  ref={this.onPassRef}
                  onSubmitEditing={this.afterPass}
                />
              </View>

              <Text style={styles.textInputLabel}>Confirm Password</Text>
              <View style={styles.textInputFieldContainer}>
                <TextInput
                  editable={connected}
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

              <TouchableOpacity
                disabled={
                  !connected ||
                  pass !== repeatPass ||
                  pass.length === 0 ||
                  alias.length === 0
                }
                onPress={this.onPressRegister}
                style={styles.connectBtn}
              >
                <Text style={styles.connectBtnText}>Create new Wallet</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : null}

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
