import React from 'react'
import {
  Text,
  View,
  StyleSheet,
  ToastAndroid,
  Switch,
  ScrollView,
  StatusBar,
  Animated,
} from 'react-native'
import { connect } from 'react-redux'
import Logger from 'react-native-file-log'
import { Slider } from 'react-native-elements'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
// import IconDrawerWalletSettings from '../assets/images/drawer-icons/icon-drawer-wallet.svg'
/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}, Params>} Navigation
 */
import * as CSS from '../res/css'
import {
  updateSelectedFee,
  updateFeesSource,
  updateRoutingFeeAbsolute,
  updateRoutingFeeRelative,
} from '../actions/FeesActions'
import {
  updateNotifyDisconnect,
  updateNotifyDisconnectAfter,
  //@ts-ignore
} from '../actions/SettingsActions'
import ShockInput from '../components/ShockInput'
import Pad from '../components/Pad'
import Nav from '../components/Nav'
import InputGroup from '../components/InputGroup'
/** @type {number} */
// @ts-ignore
const shockBG = require('../assets/images/shock-bg.png')

export const WALLET_SETTINGS = 'WALLET_SETTINGS'

/**
 * @typedef {object} Fees
 * @prop {import('../actions/FeesActions').feeLevel} feesLevel
 * @prop {import('../actions/FeesActions').feeSource} feesSource
 */

/**
 * @typedef {object} Params
 * @prop {string|null} err
 */
/**
 * @typedef {ReturnType<typeof mapStateToProps>} ConnectedRedux
 */
/**
 * @typedef {object} TmpProps
 *  @prop {(feeSource:string)=>void} updateFeesSource
 *  @prop {(feesLevel:import('../actions/FeesActions').feeLevel)=>void} updateSelectedFee
 *  @prop {(val:string)=>void} updateRoutingFeeAbsolute
 *  @prop {(val:string)=>void} updateRoutingFeeRelative
 *  @prop {(val:boolean)=>void} updateNotifyDisconnect
 *  @prop {(val:number)=>void} updateNotifyDisconnectAfter
 *  @prop {Navigation} navigation
 */
/**
 * @typedef {ConnectedRedux & TmpProps} Props
 *
 */

/**
 * @typedef {object} feesVal
 * @prop {number} fastestFee
 * @prop {number} halfHourFee
 * @prop {number} hourFee
 */

/**
 * @typedef {object} State
 * @prop {feesVal} fetchedFees
 * @prop {string} tmpSource
 * @prop {string} tmpAbsoluteFee
 * @prop {string} tmpRelativeFee
 * @prop {boolean} tmpNotifyDisconnect
 * @prop {string} tmpNotifyDisconnectAfter
 */

import notificationService from '../../notificationService'

/**
 * @extends Component<Props, State, never>
 */

/**
 * @augments React.Component<Props, State, never>
 */
class WalletSettings extends React.Component {
  /**
   * @type {import('react-navigation-stack').NavigationStackOptions}
   */
  static navigationOptions = {
    header: () => null,
    // drawerIcon: () => {
    //   return (<IconDrawerWalletSettings />)
    // },
  }

  fadeAnim = new Animated.Value(-75)

  /** @type {State} */
  state = {
    fetchedFees: {
      fastestFee: 0,
      halfHourFee: 0,
      hourFee: 0,
    },
    tmpSource: this.props.fees.feesSource,
    tmpAbsoluteFee: this.props.fees.absoluteFee,
    tmpRelativeFee: this.props.fees.relativeFee,
    tmpNotifyDisconnect: this.props.settings.notifyDisconnect,
    tmpNotifyDisconnectAfter: this.props.settings.notifyDisconnectAfterSeconds.toString(),
  }

  componentDidMount() {
    const { fees } = this.props

    fetch(fees.feesSource)
      .then(res => res.json())
      /**@param {feesVal} j*/
      .then(j =>
        this.setState({
          fetchedFees: j,
        }),
      )
      .catch(e => Logger.log(e))
  }

  /**
   * @param {string} s
   */
  updateTmpSource = s => {
    this.setState({ tmpSource: s })
    this.somethingChanged()
  }

  /**
   * @param {string} val
   */
  updateTmpAbsoluteFee = val => {
    this.setState({ tmpAbsoluteFee: parseInt(val, 10).toString() })
    this.somethingChanged()
  }

  /**
   * @param {string} val
   */
  updateTmpRelativeFee = val => {
    this.setState({ tmpRelativeFee: parseFloat(val).toString() })
    this.somethingChanged()
  }

  /**
   * @param {boolean} val
   */
  updateTmpNotifyDisconnect = val => {
    this.setState({ tmpNotifyDisconnect: val })
    this.somethingChanged()
  }

  /**
   *
   * @param {string} val
   */
  updateTmpNotifyDisconnectAfter = val => {
    this.setState({ tmpNotifyDisconnectAfter: val })
    this.somethingChanged()
  }

  submitNotificationsSettings = () => {
    const { updateNotifyDisconnect, updateNotifyDisconnectAfter } = this.props
    const { tmpNotifyDisconnect, tmpNotifyDisconnectAfter } = this.state
    updateNotifyDisconnect(tmpNotifyDisconnect)
    const afterN = Number(tmpNotifyDisconnectAfter)
    if (!afterN) {
      this.setState({ tmpNotifyDisconnectAfter: 'NaN' })
    } else {
      updateNotifyDisconnectAfter(afterN)
    }
  }

  submitRoutingFees = () => {
    const { updateRoutingFeeAbsolute, updateRoutingFeeRelative } = this.props
    const { tmpAbsoluteFee, tmpRelativeFee } = this.state
    updateRoutingFeeAbsolute(tmpAbsoluteFee)
    updateRoutingFeeRelative(tmpRelativeFee)
    ToastAndroid.show('Updating routing fee limit', 800)
  }

  submitSourceToStore = () => {
    const { updateFeesSource } = this.props
    const { tmpSource } = this.state
    updateFeesSource(tmpSource)
  }

  setMID = () => {
    this.props.updateSelectedFee('MID')
  }

  setMAX = () => {
    this.props.updateSelectedFee('MAX')
  }

  setMIN = () => {
    this.props.updateSelectedFee('MIN')
  }

  /**
   * @param {number} n
   */
  handleSlider = n => {
    /**
     * @type {import('../actions/FeesActions').feeLevel} level
     */
    let level = 'MID'
    switch (n) {
      case 0: {
        level = 'MIN'
        break
      }
      case 1: {
        level = 'MID'
        break
      }
      case 2: {
        level = 'MAX'
        break
      }
    }
    this.props.updateSelectedFee(level)
  }

  somethingChanged = () => {
    notificationService.Log('TESTING', 'DOIIDSF')
    Animated.timing(this.fadeAnim, { toValue: 20, duration: 500 }).start()
  }

  render() {
    const { fees, navigation } = this.props
    const {
      fetchedFees,
      tmpSource,
      tmpAbsoluteFee,
      tmpRelativeFee,
      tmpNotifyDisconnect,
      tmpNotifyDisconnectAfter,
    } = this.state
    let level = 1
    switch (fees.feesLevel) {
      case 'MIN': {
        level = 0
        break
      }
      case 'MID': {
        level = 1
        break
      }
      case 'MAX': {
        level = 2
        break
      }
    }
    //const theme = 'dark'
    const feePreferenceOption = [
      {
        title: '> 1 Hour',
        info: fetchedFees.hourFee,
      },
      {
        title: '< 1 Hour',
        info: fetchedFees.halfHourFee,
      },
      {
        title: 'ASAP',
        info: fetchedFees.fastestFee,
      },
    ]

    //if (theme === 'dark') {
    return (
      <View>
        <ScrollView>
          <View style={styles.flexCenterDark}>
            <StatusBar hidden />
            <Nav backButton title="Wallet Settings" navigation={navigation} />
            <View style={styles.mainContainer}>
              <Text style={styles.feePreferenceText}>Fee preference</Text>
              <View style={styles.feePreferenceContainer}>
                <View style={styles.feePreferenceOption}>
                  <Text style={styles.feePreferenceOptionTitle}>
                    {feePreferenceOption[0].title}
                  </Text>
                  <Text style={styles.feePreferenceOptionInfo}>
                    {feePreferenceOption[0].info}
                  </Text>
                </View>
                <View style={styles.feePreferenceOption}>
                  <Text style={styles.feePreferenceOptionTitle}>
                    {feePreferenceOption[1].title}
                  </Text>
                  <Text style={styles.feePreferenceOptionInfo}>
                    {feePreferenceOption[1].info}
                  </Text>
                </View>
                <View style={styles.feePreferenceOption}>
                  <Text style={styles.feePreferenceOptionTitle}>
                    {feePreferenceOption[2].title}
                  </Text>
                  <Text style={styles.feePreferenceOptionInfo}>
                    {feePreferenceOption[2].info}
                  </Text>
                </View>
              </View>
              <View style={styles.feeSliderContainer}>
                <Slider
                  style={styles.feeSlider}
                  thumbStyle={styles.feeSliderThumb}
                  maximumValue={2}
                  minimumValue={0}
                  step={1}
                  onSlidingComplete={this.handleSlider}
                  value={level}
                  thumbTintColor="#F5A623"
                  minimumTrackTintColor="#707070"
                  maximumTrackTintColor="#707070"
                />
              </View>
              <View style={styles.feeSourceContainer}>
                <View style={styles.feeSourceInputGroupContainer}>
                  <InputGroup
                    label="Fee Source"
                    //@ts-ignore
                    labelStyle={styles.feeSourceLabel}
                    value={tmpSource}
                    style={styles.feeSourceContainerInputGroup}
                    onChange={this.updateTmpSource}
                  />
                </View>
                <View style={styles.submitFeeSource}>
                  <FontAwesome5
                    name="exchange-alt"
                    size={20}
                    color="white"
                    onPress={this.submitSourceToStore}
                  />
                </View>
              </View>
              {/*<View style={styles.balanceSettingContainer}>
              <Text style={styles.balanceSettingTitle}>Balance Management</Text>
              <View style={styles.balanceSetting}>
                <View style={styles.balanceSettingContent}>
                  <Text style={styles.balanceSettingContentTitle}>
                    Bootstrap Wallet
                  </Text>
                  <Text style={styles.balanceSettingContentDescription}>
                    Fallback to LNbits untill sufficient channels are
                    established
                  </Text>
                </View>

                <View style={styles.balanceSettingCheckBoxContainer}>
                  <CheckBox
                    checked
                    checkedColor="#F5A623"
                    uncheckedColor="#F5A623"
                    iconRight
                    right
                    containerStyle={styles.balanceSettingCheckBoxView}
                  />
                </View>
              </View>
              <View style={styles.balanceSetting}>
                <View style={styles.balanceSettingContent}>
                  <Text style={styles.balanceSettingContentTitle}>
                    Bootstrap Wallet
                  </Text>
                  <Text style={styles.balanceSettingContentDescription}>
                    Fallback to LNbits untill sufficient channels are
                    established
                  </Text>
                </View>

                <View style={styles.balanceSettingCheckBoxContainer}>
                  <CheckBox
                    checked
                    checkedColor="#F5A623"
                    uncheckedColor="#F5A623"
                    iconRight
                    right
                    containerStyle={styles.balanceSettingCheckBoxView}
                  />
                </View>
              </View>
              <View style={styles.balanceSetting}>
                <View style={styles.balanceSettingContent}>
                  <Text style={styles.balanceSettingContentTitle}>
                    Bootstrap Wallet
                  </Text>
                  <Text style={styles.balanceSettingContentDescription}>
                    Fallback to LNbits untill sufficient channels are
                    established
                  </Text>
                </View>

                <View style={styles.balanceSettingCheckBoxContainer}>
                  <CheckBox
                    checked
                    checkedColor="#F5A623"
                    uncheckedColor="#F5A623"
                    iconRight
                    right
                    containerStyle={styles.balanceSettingCheckBoxView}
                  />
                </View>
              </View>
            </View>*/}
              <View style={styles.balanceSettingContainer}>
                <Text style={styles.balanceSettingTitle}>
                  Lightning Routing Fees Limit
                </Text>
                <View style={styles.balanceSetting}>
                  <View style={styles.balanceSettingContent}>
                    <Text style={styles.balanceSettingContentTitle}>
                      Absolute Fee
                    </Text>
                    <Text style={styles.balanceSettingContentDescription}>
                      Fix rate, doesn't depend on amount
                    </Text>
                  </View>
                  <View style={styles.balanceSettingCheckBoxContainer}>
                    <ShockInput
                      onChangeText={this.updateTmpAbsoluteFee}
                      value={tmpAbsoluteFee}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <Pad amount={20} />
                <View style={styles.balanceSetting}>
                  <View style={styles.balanceSettingContent}>
                    <Text style={styles.balanceSettingContentTitle}>
                      Relative Fee
                    </Text>
                    <Text style={styles.balanceSettingContentDescription}>
                      % based on the payment amount
                    </Text>
                  </View>
                  <View style={styles.balanceSettingCheckBoxContainer}>
                    <ShockInput
                      onChangeText={this.updateTmpRelativeFee}
                      value={tmpRelativeFee}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
              <View style={styles.balanceSettingContainer}>
                <Text style={styles.balanceSettingTitle}>
                  Notifications Settings
                </Text>
                <View style={styles.balanceSetting}>
                  <View style={styles.balanceSettingContent}>
                    <Text style={styles.balanceSettingContentTitle}>
                      Disconnect alert
                    </Text>
                    <Text style={styles.balanceSettingContentDescription}>
                      Make a noise when the connection is lost
                    </Text>
                  </View>
                  <View style={styles.balanceSettingCheckBoxContainer}>
                    <Switch
                      value={tmpNotifyDisconnect}
                      onValueChange={this.updateTmpNotifyDisconnect}
                    />
                  </View>
                </View>
                <Pad amount={20} />
                <View style={styles.balanceSetting}>
                  <View style={styles.balanceSettingContent}>
                    <Text style={styles.balanceSettingContentTitle}>
                      Time to reconnect
                    </Text>
                    <Text style={styles.balanceSettingContentDescription}>
                      Seconds of no connection before assuming connection is
                      lost
                    </Text>
                  </View>
                  <View style={styles.balanceSettingCheckBoxContainer}>
                    <ShockInput
                      value={tmpNotifyDisconnectAfter}
                      onChangeText={this.updateTmpNotifyDisconnectAfter}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
        <Animated.View // Special animatable View
          style={{ ...styles.createBtn, bottom: this.fadeAnim }}
        >
          <FontAwesome5
            name="save"
            size={45}
            color="black"
            onPress={this.submitSourceToStore}
          />
        </Animated.View>
      </View>
    )
    //}
  }
}

/**
 * @param {{
 * fees:import('../../reducers/FeesReducer').State
 * settings:import('../../reducers/SettingsReducer').State
 * }} state
 */
const mapStateToProps = ({ fees, settings }) => ({ fees, settings })

const mapDispatchToProps = {
  updateSelectedFee,
  updateFeesSource,
  updateRoutingFeeAbsolute,
  updateRoutingFeeRelative,
  updateNotifyDisconnect,
  updateNotifyDisconnectAfter,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(WalletSettings)

const styles = StyleSheet.create({
  flexCenterDark: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#16191C',
    paddingTop: 20,
  },
  feePreferenceText: {
    fontFamily: 'Montserrat-600',
    fontSize: 15,
    color: '#EBEBEB',
  },
  balanceSettingTitle: {
    fontFamily: 'Montserrat-600',
    fontSize: 15,
    color: '#EBEBEB',
  },
  feePreferenceOption: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  feePreferenceContainer: {
    flexDirection: 'row',
    marginTop: 25,
  },
  feePreferenceOptionTitle: {
    color: '#4285B9',
    fontFamily: 'Montserrat-600',
    fontSize: 15,
    textAlign: 'center',
  },
  feePreferenceOptionInfo: {
    fontFamily: 'Montserrat-600',
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    paddingTop: 5,
  },
  mainContainer: {
    padding: 38,
    paddingTop: 10,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    flex: 1,
    width: '100%',
  },
  feeSlider: {
    width: '80%',
    flex: 1,
  },
  feeSliderContainer: {
    flexDirection: 'row',
    marginTop: 18,
    marginBottom: 18,
  },
  feeSliderThumb: {
    borderWidth: 1,
    borderColor: 'white',
    width: 22,
    height: 22,
  },
  feeSourceContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 25,
  },
  feeSourceLabel: {
    fontFamily: 'Montserrat-600',
    fontSize: 15,
    color: '#EBEBEB',
  },
  balanceSettingContainer: {
    width: '100%',
    marginBottom: 25,
  },
  balanceSetting: {
    flexDirection: 'row',
    marginTop: 20,
  },
  balanceSettingCheckBoxContainer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    // marginTop: -15,
  },
  balanceSettingContent: {
    flex: 1,
  },
  balanceSettingContentTitle: {
    fontFamily: 'Montserrat-700',
    fontSize: 14,
    color: '#4285B9',
  },
  balanceSettingContentDescription: {
    color: '#EBEBEB',
    fontFamily: 'Montserrat-600',
    fontSize: 11,
    marginTop: 5,
  },
  feeSourceContainerInputGroup: {
    marginBottom: 0,
  },
  submitFeeSource: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginBottom: 20,
    width: '12%',
  },
  feeSourceInputGroupContainer: {
    flexDirection: 'row',
    width: '85%',
  },
  /*balanceSettingCheckBoxView: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },*/
  createBtn: {
    height: 75,
    width: 75,
    borderRadius: 38,
    backgroundColor: CSS.Colors.CAUTION_YELLOW,
    position: 'absolute',
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /*feePreferenceText: {
    fontFamily: 'Montserrat-600',
    fontSize: 15,
    color: '#EBEBEB',
  },
  balanceSettingTitle: {
    fontFamily: 'Montserrat-600',
    fontSize: 15,
    color: '#EBEBEB',
  },
  feePreferenceOption: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  feePreferenceContainer: {
    flexDirection: 'row',
    marginTop: 25,
  },
  feePreferenceOptionTitle: {
    color: '#4285B9',
    fontFamily: 'Montserrat-600',
    fontSize: 15,
    textAlign: 'center',
  },
  feePreferenceOptionInfo: {
    fontFamily: 'Montserrat-600',
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    paddingTop: 5,
  },
  mainContainer: {
    padding: 38,
    paddingTop: 10,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    flex: 1,
    width: '100%',
  },
  feeSlider: {
    width: '80%',
    flex: 1,
  },
  feeSliderContainer: {
    flexDirection: 'row',
    marginTop: 18,
    marginBottom: 18,
  },
  feeSliderThumb: {
    borderWidth: 1,
    borderColor: 'white',
    width: 22,
    height: 22,
  },
  feeSourceContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 25,
  },
  feeSourceLabel: {
    fontFamily: 'Montserrat-600',
    fontSize: 15,
    color: '#EBEBEB',
  },
  balanceSettingContainer: {
    width: '100%',
  },
  balanceSetting: {
    flexDirection: 'row',
    marginTop: 20,
  },
  balanceSettingCheckBoxContainer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    // marginTop: -15,
  },
  balanceSettingContent: {
    flex: 1,
  },
  balanceSettingContentTitle: {
    fontFamily: 'Montserrat-700',
    fontSize: 14,
    color: '#4285B9',
  },
  balanceSettingContentDescription: {
    color: '#EBEBEB',
    fontFamily: 'Montserrat-600',
    fontSize: 11,
    marginTop: 5,
  },
  feeSourceContainerInputGroup: {
    marginBottom: 0,
  },
  submitFeeSource: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginBottom: 20,
    width: '12%',
  },
  feeSourceInputGroupContainer: {
    flexDirection: 'row',
    width: '85%',
  },
  balanceSettingCheckBoxView: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },*/
})
