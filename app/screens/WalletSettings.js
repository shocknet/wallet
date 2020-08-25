import React from 'react'
import { Text, View, StyleSheet, StatusBar } from 'react-native'
import { connect } from 'react-redux'
import Logger from 'react-native-file-log'
import { Slider, CheckBox } from 'react-native-elements'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}, Params>} Navigation
 */
import { updateSelectedFee, updateFeesSource } from '../actions/FeesActions'
import ShockInput from '../components/ShockInput'
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
 */

/**
 * @extends Component<Props, State, never>
 */

/**
 * @augments React.Component<Props, State, never>
 */
class WalletSettings extends React.Component {
  /**
   * @type {import('react-navigation').NavigationScreenOptions}
   */
  static navigationOptions = {
    header: null,
  }

  /** @type {State} */
  state = {
    fetchedFees: {
      fastestFee: 0,
      halfHourFee: 0,
      hourFee: 0,
    },
    tmpSource: this.props.fees.feesSource,
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

  render() {
    const { fees, navigation } = this.props
    const { fetchedFees, tmpSource } = this.state
    let level = 1
    let levelText = 'less than one hour'
    let currentVal = fetchedFees.halfHourFee
    switch (fees.feesLevel) {
      case 'MIN': {
        level = 0
        levelText = 'more than one hour'
        currentVal = fetchedFees.hourFee
        break
      }
      case 'MID': {
        level = 1
        levelText = 'less than one hour'
        currentVal = fetchedFees.halfHourFee
        break
      }
      case 'MAX': {
        level = 2
        levelText = 'fastest'
        currentVal = fetchedFees.fastestFee
        break
      }
    }

    const theme = 'dark'
    const feePreferenceOption = [
      {
        title: '> 1 Hour',
        info: '10 sats/byte',
      },
      {
        title: '< 1 Hour',
        info: '30 sats/byte',
      },
      {
        title: 'ASAP',
        info: '60 sats/byte',
      },
    ]

    if (theme === 'dark') {
      return (
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
            <View style={styles.balanceSettingContainer}>
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
            </View>
          </View>
        </View>
      )
    }
    return (
      <View style={styles.flexCenter}>
        <Text style={styles.bigBold}>Wallet Settings</Text>
        {/*<ShockButton
                color={
                    fees.feesLevel=== 'MAX' ?  CSS.Colors.BLUE_DARK: undefined
                }
                title={`Fastest ${fetchedFees.fastestFee}`}
                onPress={this.setMAX}
            />
            <ShockButton
                color={
                    fees.feesLevel=== 'MID' ?  CSS.Colors.BLUE_DARK: undefined
                }
                title={`Less 1h ${fetchedFees.halfHourFee}`}
                onPress={this.setMID}
            />
            <ShockButton
                color={
                    fees.feesLevel=== 'MIN' ?  CSS.Colors.BLUE_DARK: undefined
                }
                title={`Plus 1h ${fetchedFees.hourFee}`}
                onPress={this.setMIN}
            />*/}
        <Text>
          Selected Fee: <Text style={styles.centerBold}>{levelText}</Text>
        </Text>
        <Text>
          Current Value: <Text style={styles.centerBold}>{currentVal}</Text>
        </Text>
        <Slider
          style={styles.w_80}
          maximumValue={2}
          minimumValue={0}
          step={1}
          onSlidingComplete={this.handleSlider}
          value={level}
          thumbTintColor="#333333"
        />
        <View style={styles.bottom}>
          <Text style={styles.midBold}>Fees Source</Text>
          <View style={styles.d_flex}>
            <View style={styles.w_80}>
              <ShockInput
                onChangeText={this.updateTmpSource}
                value={tmpSource}
              />
            </View>
            <View style={styles.w_20}>
              <FontAwesome5
                name="exchange-alt"
                size={38}
                onPress={this.submitSourceToStore}
              />
            </View>
          </View>
        </View>
      </View>
    )
  }
}

/**
 * @param {{fees:import('../../reducers/FeesReducer').State}} state
 */
const mapStateToProps = ({ fees }) => ({ fees })

const mapDispatchToProps = {
  updateSelectedFee,
  updateFeesSource,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(WalletSettings)

const styles = StyleSheet.create({
  bigBold: {
    marginTop: 25,
    fontWeight: 'bold',
    fontSize: 24,
  },
  midBold: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  flexCenter: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  flexCenterDark: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#16191C',
    paddingTop: 20,
  },
  centerBold: {
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  w_80: {
    width: '80%',
  },
  w_20: {
    alignItems: 'center',
    width: '20%',
  },
  d_flex: {
    display: 'flex',
    flexDirection: 'row',
  },
  bottom: {
    position: 'absolute',
    bottom: 50,
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
  },
})
