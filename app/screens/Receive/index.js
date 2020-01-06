/**
 * @format
 */
import React, { Component } from 'react'
import {
  // Clipboard,
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
} from 'react-native'
import { withNavigationFocus } from 'react-navigation'
import Big from 'big.js'
import { connect } from 'react-redux'
import AmountStep from './components/AmountStep'
import SendStep from './components/SendStep'
import wavesBG from '../../assets/images/shock-bg.png'
import Nav from '../../components/Nav'
import { resetInvoice } from '../../actions/InvoiceActions'

import * as CSS from '../../res/css'
import Ionicons from 'react-native-vector-icons/Ionicons'
// import InputGroup from '../../components/InputGroup'
export const RECEIVE_SCREEN = 'RECEIVE_SCREEN'

/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}, {}>} Navigation
 */

/**
 * @typedef {ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps} ConnectedRedux
 */

/**
 * @typedef {ConnectedRedux & object} Props
 * @prop {(Navigation)=} navigation
 * @prop {boolean} isFocused
 */

/**
 * @augments React.Component<Props, {}, never>
 */
class ReceiveScreen extends Component {
  state = {
    step: 1,
    maxStep: 2,
  }

  componentDidMount() {
    const { invoice, resetInvoice } = this.props
    if (invoice.paymentRequest) {
      resetInvoice()
    }
  }

  /**
   * @param {Props} prevProps
   */
  componentDidUpdate(prevProps) {
    const { isFocused, invoice, resetInvoice } = this.props
    if (prevProps.isFocused !== isFocused && invoice.paymentRequest) {
      resetInvoice()
    }
  }

  isFilled = () => {
    const { amount } = this.props.invoice
    if (!amount.trim()) {
      return false
    }

    const parsedAmount = new Big(amount)

    return parsedAmount.gt(0)
  }

  nextStep = () => {
    const { step, maxStep } = this.state
    if (step === maxStep) {
      return
    }

    this.setState({
      step: step + 1,
    })
  }

  /**
   * @param {number} step
   */
  setStep = step => () => {
    const { maxStep } = this.state
    if (step > maxStep || step <= 0) {
      return
    }

    this.setState({
      step,
    })
  }

  renderStep = () => {
    const { step } = this.state
    const { navigation } = this.props
    if (step === 1) {
      return <AmountStep navigation={navigation} />
    }

    if (step === 2) {
      return <SendStep navigation={navigation} editInvoice={this.setStep(1)} />
    }

    return null
  }

  getStepsRange = () => {
    const { maxStep } = this.state
    return Array.from({ length: maxStep }).map((_, key) => key + 1)
  }

  render() {
    const { navigation } = this.props
    const { step, maxStep } = this.state
    const { width, height } = Dimensions.get('window')
    return (
      <ImageBackground
        source={wavesBG}
        resizeMode="cover"
        style={styles.container}
      >
        <Nav backButton title="Receive" navigation={navigation} />
        <View
          style={[
            styles.sendContainer,
            {
              width: width - 50,
              height: height - 134,
            },
          ]}
        >
          {this.renderStep()}
          <View style={styles.nextStepContainer}>
            {step < maxStep ? (
              <TouchableOpacity onPress={this.nextStep}>
                <Text style={styles.nextBtn}>
                  {this.isFilled() ? 'Next' : 'Skip'}{' '}
                  <Ionicons
                    name="ios-arrow-forward"
                    color={CSS.Colors.GRAY}
                    size={16}
                  />
                </Text>
              </TouchableOpacity>
            ) : null}
            <View style={styles.dotsContainer}>
              {this.getStepsRange().map(item => (
                <TouchableOpacity
                  style={[styles.dot, item === step ? styles.dotActive : null]}
                  key={item}
                  onPress={this.setStep(item)}
                />
              ))}
            </View>
          </View>
        </View>
      </ImageBackground>
    )
  }
}

/**
 * @param {typeof import('../../../reducers/index').default} state
 */
const mapStateToProps = ({ invoice }) => ({ invoice })

const mapDispatchToProps = {
  resetInvoice,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withNavigationFocus(ReceiveScreen))

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  sendContainer: {
    height: '100%',
    width: '100%',
    marginTop: 5,
    paddingVertical: 40,
    paddingHorizontal: 35,
    backgroundColor: CSS.Colors.BACKGROUND_WHITE,
    borderRadius: 40,
    justifyContent: 'space-between',
  },
  nextStepContainer: {
    width: '100%',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  nextBtn: {
    fontFamily: 'Montserrat-700',
    color: CSS.Colors.GRAY,
    textAlign: 'right',
  },
  dot: {
    width: 16,
    height: 16,
    backgroundColor: CSS.Colors.GRAY_DARKER,
    borderRadius: 100,
    marginRight: 10,
    elevation: 3,
  },
  dotActive: {
    backgroundColor: CSS.Colors.BUTTON_BLUE,
  },
})
