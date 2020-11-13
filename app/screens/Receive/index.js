import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  TouchableHighlight,
} from 'react-native'
import { withNavigationFocus } from 'react-navigation'
import Big from 'big.js'
import { connect } from 'react-redux'
import AmountStep from './components/AmountStep'
import SendStep from './components/SendStep'
import wavesBG from '../../assets/images/shock-bg.png'
import wavesBGDark from '../../assets/images/shock-bg-dark.png'
import Nav from '../../components/Nav'
import { resetSelectedContact } from '../../store/actions/ChatActions'
import { resetInvoice } from '../../store/actions/InvoiceActions'

import * as CSS from '../../res/css'
import Ionicons from 'react-native-vector-icons/Ionicons'
// import InputGroup from '../../components/InputGroup'

/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}, {}>} Navigation
 */

/**
 * @typedef {ReturnType<typeof mapStateToProps>} ConnectedRedux
 */

/**
 * @typedef {object} TmpProps
 * @prop {Navigation} navigation
 * @prop {boolean} isFocused
 * @prop {()=>void} resetInvoice
 * @prop {()=>void} resetSelectedContact
 */
/**
 * @typedef {ConnectedRedux & TmpProps & import('react-navigation').NavigationFocusInjectedProps<{}>} Props
 */

/**
 * @extends React.PureComponent<Props, {}, never>
 */
class ReceiveScreen extends React.PureComponent {
  /** @type {import('react-navigation-stack').NavigationStackOptions} */
  static navigationOptions = {
    headerShown: false,
  }

  state = {
    step: 1,
    maxStep: 2,
  }

  theme = 'dark'

  componentDidMount() {
    const { resetInvoice, resetSelectedContact } = this.props
    resetInvoice()
    resetSelectedContact()
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

  /**
   * @param {number} step
   * @param {number} maxStep
   */
  renderNextStepContainer = (step, maxStep) => {
    if (this.theme === 'dark') {
      return (
        <View style={styles.nextStepContainer}>
          {step < maxStep ? (
            <View style={styles.actionButtons}>
              <TouchableHighlight
                underlayColor="transparent"
                onPress={this.nextStep}
                style={
                  this.theme === 'dark'
                    ? styles.actionButtonDark1
                    : styles.actionButton
                }
              >
                <Text
                  style={
                    this.theme === 'dark'
                      ? styles.actionButtonTextDark1
                      : styles.actionButtonText
                  }
                >
                  Skip
                </Text>
              </TouchableHighlight>
              <TouchableHighlight
                underlayColor="transparent"
                onPress={this.nextStep}
                style={
                  this.theme === 'dark'
                    ? [styles.actionButtonDark2, { backgroundColor: '#4285B9' }]
                    : [
                        styles.actionButton,
                        { backgroundColor: CSS.Colors.FUN_BLUE },
                      ]
                }
              >
                <Text
                  style={
                    this.theme === 'dark'
                      ? styles.actionButtonTextDark2
                      : styles.actionButtonText
                  }
                >
                  Next
                </Text>
              </TouchableHighlight>
            </View>
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
      )
    }
    return (
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
    )
  }

  /**
   * @param {number} step
   * @param {number} maxStep
   * @param {number} width
   * @param {number} height
   */
  renderForm = (step, maxStep, width, height) => {
    if (this.theme === 'dark') {
      return (
        <View
          style={[
            styles.sendContainerDark,
            {
              width: width - 50,
              height: height - 134,
            },
          ]}
        >
          {this.renderStep()}
          {this.renderNextStepContainer(step, maxStep)}
        </View>
      )
    }
    return (
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
    )
  }

  render() {
    const { navigation } = this.props
    const { step, maxStep } = this.state
    const { width, height } = Dimensions.get('window')
    return (
      <ImageBackground
        source={this.theme === 'dark' ? wavesBGDark : wavesBG}
        resizeMode="cover"
        style={styles.container}
      >
        <Nav backButton title="Request" navigation={navigation} />
        {this.renderForm(step, maxStep, width, height)}
      </ImageBackground>
    )
  }
}

/**
 * @param {{
 * invoice:import('../../store/reducers/InvoiceReducer').State}} state
 */
const mapStateToProps = ({ invoice }) => ({ invoice })

const mapDispatchToProps = {
  resetInvoice,
  resetSelectedContact,
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
  sendContainerDark: {
    height: '100%',
    width: '100%',
    marginTop: 40,
    paddingVertical: 20,
    paddingHorizontal: 35,
    backgroundColor: CSS.Colors.TRANSPARENT,
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
  actionButton: {
    width: '45%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    backgroundColor: CSS.Colors.ORANGE,
  },
  actionButtonDark1: {
    width: '48%',
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#001220',
    borderColor: '#4285B9',
    borderWidth: 1,
  },
  actionButtonDark2: {
    width: '48%',
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: CSS.Colors.TRANSPARENT,
    borderColor: CSS.Colors.BACKGROUND_WHITE,
    borderWidth: 1,
  },
  actionButtonText: {
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-700',
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 33,
  },
})
