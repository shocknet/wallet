import React from 'react'
import { Text, View, StyleSheet, ToastAndroid } from 'react-native'
import { connect } from 'react-redux'
import Logger from 'react-native-file-log'
import { Slider } from 'react-native-elements'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}, Params>} Navigation
 */
import {
  updateSelectedFee,
  updateFeesSource,
  updateRoutingFeeAbsolute,
  updateRoutingFeeRelative,
} from '../actions/FeesActions'
import ShockInput from '../components/ShockInput'
import Pad from '../components/Pad'
import ShockButton from '../components/ShockButton'
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
    tmpAbsoluteFee: this.props.fees.absoluteFee,
    tmpRelativeFee: this.props.fees.relativeFee,
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

  /**
   * @param {string} val
   */
  updateTmpAbsoluteFee = val => {
    this.setState({ tmpAbsoluteFee: parseInt(val, 10).toString() })
  }

  /**
   * @param {string} val
   */
  updateTmpRelativeFee = val => {
    this.setState({ tmpRelativeFee: parseFloat(val).toString() })
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

  render() {
    const { fees } = this.props
    const {
      fetchedFees,
      tmpSource,
      tmpAbsoluteFee,
      tmpRelativeFee,
    } = this.state
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
    const disableSubmitRoutingFees =
      tmpAbsoluteFee === fees.absoluteFee && tmpRelativeFee === fees.relativeFee
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
        <View>
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
        <Pad amount={20} />
        <View style={styles.hr} />
        <Pad amount={20} />
        <View>
          <Text style={styles.midBold}>Lightning Routing Fees Limit</Text>
          <View style={styles.d_flex}>
            <View style={styles.w_70}>
              <Text style={styles.smallBold}>Absolute Fee</Text>
              <Text>Fix rate, doesn't depend on amount</Text>
            </View>
            <View style={styles.w_30}>
              <ShockInput
                onChangeText={this.updateTmpAbsoluteFee}
                value={tmpAbsoluteFee}
              />
            </View>
          </View>
          <Pad amount={20} />
          <View style={styles.d_flex}>
            <View style={styles.w_70}>
              <Text style={styles.smallBold}>Relative Fee</Text>
              <Text>% based on the payment amount</Text>
            </View>
            <View style={styles.w_30}>
              <ShockInput
                onChangeText={this.updateTmpRelativeFee}
                value={tmpRelativeFee}
              />
            </View>
          </View>
          <Pad amount={20} />
          <ShockButton
            onPress={this.submitRoutingFees}
            title="Update Routing Fees"
            disabled={disableSubmitRoutingFees}
          />
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
  updateRoutingFeeAbsolute,
  updateRoutingFeeRelative,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(WalletSettings)

const styles = StyleSheet.create({
  hr: {
    height: 1,
    backgroundColor: '#222',
    width: '80%',
  },
  bigBold: {
    marginTop: 25,
    fontWeight: 'bold',
    fontSize: 24,
  },
  midBold: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  smallBold: {
    fontWeight: 'bold',
  },
  flexCenter: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: 10,
  },
  centerBold: {
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  w_80: {
    width: '80%',
  },
  w_70: {
    width: '70%',
  },
  w_20: {
    alignItems: 'center',
    width: '20%',
  },
  w_30: {
    alignItems: 'center',
    width: '30%',
  },
  d_flex: {
    display: 'flex',
    flexDirection: 'row',
  },
})
