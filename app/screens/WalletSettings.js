import React from 'react'
import {
  Text,
  View,
  StyleSheet,
  ToastAndroid,
  Switch,
  ScrollView,
  StatusBar,
  TouchableHighlight,
  TextInput,
} from 'react-native'
import { connect } from 'react-redux'
import Logger from 'react-native-file-log'
import { Slider } from 'react-native-elements'
/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}, Params>} Navigation
 */
import * as CSS from '../res/css'
import {
  updateSelectedFee,
  updateFeesSource,
  updateRoutingFeeAbsolute,
  updateRoutingFeeRelative,
} from '../store/actions/FeesActions'
import {
  updateNotifyDisconnect,
  updateNotifyDisconnectAfter,
} from '../store/actions/SettingsActions'
import Nav from '../components/Nav'
import InputGroup from '../components/InputGroup'

export const WALLET_SETTINGS = 'WALLET_SETTINGS'

/**
 * @typedef {object} Fees
 * @prop {import('../store/actions/FeesActions').feeLevel} feesLevel
 * @prop {import('../store/actions/FeesActions').feeSource} feesSource
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
 *  @prop {(feesLevel:import('../store/actions/FeesActions').feeLevel)=>void} updateSelectedFee
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
 * @prop {boolean} somethingChanged
 */

/**
 * @extends React.PureComponent<Props, State, never>
 */

/**
 * @augments React.PureComponent<Props, State, never>
 */
class WalletSettings extends React.PureComponent {
  /**
   * @type {import('react-navigation-stack').NavigationStackOptions}
   */
  static navigationOptions = {
    header: () => null,
    // drawerIcon: () => {
    //   return (<IconDrawerWalletSettings />)
    // },
  }

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
    somethingChanged: false,
  }

  goBack = () => {
    this.setState({
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
      somethingChanged: false,
    })
    this.props.navigation.goBack()
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
    const fee = val.slice(1)
    let nextVal = '0'
    if (fee[fee.length - 1] !== '.' && parseFloat(fee) !== 0) {
      nextVal = (parseFloat(fee) / 100).toString()
    } else {
      nextVal = fee
    }
    this.setState({ tmpRelativeFee: nextVal })
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
  }

  submitSourceToStore = () => {
    const { updateFeesSource } = this.props
    const { tmpSource } = this.state
    updateFeesSource(tmpSource)
    this.submitRoutingFees()
    this.submitNotificationsSettings()

    ToastAndroid.show('Settings Updated', 800)
    this.goBack()
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
     * @type {import('../store/actions/FeesActions').feeLevel} level
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
    this.setState({ somethingChanged: true })
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
      somethingChanged,
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

    let relativeValue = '%0'
    const parsed = parseFloat(tmpRelativeFee)
    if (tmpRelativeFee[tmpRelativeFee.length - 1] !== '.' && parsed !== 0) {
      const fixed = ((parsed ? parsed : 0) * 100).toFixed(2)
      relativeValue = '%' + parseFloat(fixed).toString()
    } else {
      relativeValue = '%' + tmpRelativeFee
    }
    //if (theme === 'dark') {
    return (
      <View style={styles.mainView}>
        <ScrollView>
          <View style={styles.flexCenterDark}>
            <StatusBar hidden />
            <Nav backButton title="Wallet Settings" navigation={navigation} />
            <View style={styles.mainContainer}>
              <Text style={styles.feePreferenceText}>
                Fee Preference (Chain)
              </Text>
              <View style={styles.feePreferenceContainer}>
                <View style={styles.feePreferenceOption}>
                  <Text style={styles.feePreferenceOptionTitle}>
                    {feePreferenceOption[0].title}
                  </Text>
                  <Text style={styles.feePreferenceOptionInfo}>
                    {feePreferenceOption[0].info} sats/byte
                  </Text>
                </View>
                <View style={styles.feePreferenceOption}>
                  <Text style={styles.feePreferenceOptionTitle}>
                    {feePreferenceOption[1].title}
                  </Text>
                  <Text style={styles.feePreferenceOptionInfo}>
                    {feePreferenceOption[1].info} sats/byte
                  </Text>
                </View>
                <View style={styles.feePreferenceOption}>
                  <Text style={styles.feePreferenceOptionTitle}>
                    {feePreferenceOption[2].title}
                  </Text>
                  <Text style={styles.feePreferenceOptionInfo}>
                    {feePreferenceOption[2].info} sats/byte
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
                    labelStyle={styles.feeSourceLabel}
                    value={tmpSource}
                    style={styles.feeSourceContainerInputGroup}
                    onChange={this.updateTmpSource}
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
                  Routing Fee Limits (Lightning)
                </Text>
                <View style={styles.balanceSetting}>
                  <View style={styles.balanceSettingContent}>
                    <Text style={styles.balanceSettingContentTitle}>
                      Base Fee
                    </Text>
                    <Text style={styles.balanceSettingContentDescription}>
                      Fixed rate per payment measured in sats, allowed
                      regardless of payment size
                    </Text>
                  </View>
                  <View style={styles.balanceSettingCheckBoxContainer}>
                    <TextInput
                      onChangeText={this.updateTmpAbsoluteFee}
                      value={tmpAbsoluteFee}
                      keyboardType="numeric"
                      style={styles.inputDark}
                    />
                  </View>
                </View>
                <View style={styles.balanceSetting}>
                  <View style={styles.balanceSettingContent}>
                    <Text style={styles.balanceSettingContentTitle}>
                      Percentage Fee
                    </Text>
                    <Text style={styles.balanceSettingContentDescription}>
                      Maximum fee as a percentage of payment (if higher than
                      base fee)
                    </Text>
                  </View>
                  <View style={styles.balanceSettingCheckBoxContainer}>
                    <TextInput
                      onChangeText={this.updateTmpRelativeFee}
                      value={relativeValue}
                      keyboardType="numeric"
                      style={styles.inputDark}
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
                      Disconnect Alerts
                    </Text>
                    <Text style={styles.balanceSettingContentDescription}>
                      Triggering a notification if wallet is unable to connect
                      to the node
                    </Text>
                  </View>
                  <View style={styles.balanceSettingCheckBoxContainer}>
                    <Switch
                      value={tmpNotifyDisconnect}
                      onValueChange={this.updateTmpNotifyDisconnect}
                      thumbColor="#4285b9"
                      trackColor={{
                        true: 'rgba(66,133,185,0.8)',
                        false: 'black',
                      }}
                    />
                  </View>
                </View>
                {tmpNotifyDisconnect && (
                  <View style={styles.balanceSetting}>
                    <View style={styles.balanceSettingContent}>
                      <Text style={styles.balanceSettingContentTitle}>
                        Disconnect Sensitivity
                      </Text>
                      <Text style={styles.balanceSettingContentDescription}>
                        Seconds elapsed before triggering disconnect alert
                      </Text>
                    </View>
                    <View style={styles.balanceSettingCheckBoxContainer}>
                      <TextInput
                        value={tmpNotifyDisconnectAfter}
                        onChangeText={this.updateTmpNotifyDisconnectAfter}
                        keyboardType="numeric"
                        style={styles.inputDark}
                      />
                    </View>
                  </View>
                )}
              </View>
            </View>

            {somethingChanged && (
              <View style={styles.actionButtonsDark}>
                <TouchableHighlight
                  underlayColor="transparent"
                  style={styles.actionButtonDark1}
                  onPress={this.goBack}
                >
                  <Text style={styles.actionButtonTextDark1}>Cancel</Text>
                </TouchableHighlight>
                <TouchableHighlight
                  underlayColor="transparent"
                  style={styles.actionButtonDark2}
                  onPress={this.submitSourceToStore}
                >
                  <Text style={styles.actionButtonTextDark2}>Save</Text>
                </TouchableHighlight>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    )
    //}
  }
}

/**
 * @param {{
 * fees:import('../store/reducers/FeesReducer').State
 * settings:import('../store/reducers/SettingsReducer').State
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
  mainView: {
    backgroundColor: '#16191C',
    height: '100%',
  },
  flexCenterDark: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#16191C',
  },
  feePreferenceText: {
    fontFamily: 'Montserrat-600',
    fontSize: 15,
    color: '#EBEBEB',
    fontWeight: '700',
  },
  balanceSettingTitle: {
    fontFamily: 'Montserrat-600',
    fontSize: 15,
    color: '#EBEBEB',
    fontWeight: '700',
  },
  feePreferenceOption: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  feePreferenceContainer: {
    flexDirection: 'row',
    marginTop: 10,
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
    paddingTop: 3,
  },
  mainContainer: {
    paddingHorizontal: 20,
    paddingTop: 5,
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
    marginTop: 2,
    marginBottom: 2,
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
    marginBottom: 5,
  },
  feeSourceLabel: {
    fontFamily: 'Montserrat-600',
    fontSize: 15,
    color: '#EBEBEB',
    fontWeight: '700',
  },
  balanceSettingContainer: {
    width: '100%',
    marginBottom: 10,
  },
  balanceSetting: {
    flexDirection: 'row',
    marginTop: 5,
  },
  balanceSettingCheckBoxContainer: {
    height: 30,
    width: 50,
    marginTop: 25,
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
  feeSourceInputGroupContainer: {
    flexDirection: 'row',
  },
  actionButtonsDark: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  actionButtonDark1: {
    width: '43%',
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#001220',
    borderColor: '#4285B9',
    borderWidth: 1,
    marginHorizontal: 5,
  },
  actionButtonDark2: {
    width: '43%',
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#4285B9',
    borderColor: CSS.Colors.BACKGROUND_WHITE,
    borderWidth: 1,
    marginHorizontal: 5,
  },
  actionButtonTextDark1: {
    color: '#4285B9',
    fontFamily: 'Montserrat-700',
    fontSize: 14,
  },
  actionButtonTextDark2: {
    color: '#212937',
    fontFamily: 'Montserrat-700',
    fontSize: 14,
  },
  inputDark: {
    flex: 1,
    fontFamily: 'Montserrat-600',
    textAlignVertical: 'center',
    textAlign: 'center',
    fontSize: 12,
    color: CSS.Colors.TEXT_WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    paddingHorizontal: 2,
    paddingVertical: 0,
    //height: 5,
    //marginBottom: 5,
    backgroundColor: '#212937',
    borderWidth: 1,
    borderColor: '#4285B9',
    overflow: 'hidden',
    opacity: 0.7,
  },
  /*balanceSettingCheckBoxView: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },*/
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
