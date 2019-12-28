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
  ActivityIndicator,
} from 'react-native'
// @ts-ignore
import { Dropdown } from 'react-native-material-dropdown'
// @ts-ignore
import SwipeVerify from 'react-native-swipe-verify'
import wavesBG from '../../assets/images/shock-bg.png'
import Nav from '../../components/Nav'
import InputGroup from '../../components/InputGroup'
import ContactsSearch from '../../components/Search/ContactsSearch'

import * as CSS from '../../css'
import * as Wallet from '../../services/wallet'
import Ionicons from 'react-native-vector-icons/Ionicons'
export const SEND_SCREEN = 'SEND_SCREEN'

/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}, {}>} Navigation
 */

/**
 * @typedef {object} Props
 * @prop {(Navigation)=} navigation
 */

/**
 * @typedef {object} State
 * @prop {string} destination
 * @prop {string} unitSelected
 * @prop {string} amount
 * @prop {string} contactsSearch
 * @prop {boolean} sending
 * @prop {string|null} error
 */

/**
 * @augments React.Component<Props, State, never>
 */
class SendScreen extends Component {
  state = {
    destination: '',
    unitSelected: 'Sats',
    amount: '0',
    contactsSearch: '',
    sending: false,
    error: null,
  }

  amountOptionList = React.createRef()

  /**
   * @param {keyof State} key
   */
  onChange = key => (value = '') => {
    /**
     * @type {Pick<State, keyof State>}
     */
    // @ts-ignore TODO: fix typing
    const updatedState = {
      [key]: value,
    }
    this.setState(updatedState)
  }

  isFilled = () => {
    const { destination, amount } = this.state
    return destination.length > 0 && parseFloat(amount) > 0
  }

  sendRequest = async () => {
    try {
      const { destination, amount } = this.state

      if (destination.length === 0) {
        return
      }

      this.setState({
        sending: true,
      })

      const transactionId = await Wallet.sendCoins({
        addr: destination,
        amount: parseInt(amount, 10),
      })

      console.log('New Transaction ID:', transactionId)

      this.setState({
        sending: false,
      })
      if (this.props.navigation) {
        this.props.navigation.goBack()
      }
    } catch (e) {
      console.error(e)
      this.setState({
        sending: false,
        error: e.message,
      })
    }
  }

  render() {
    const {
      destination,
      unitSelected,
      amount,
      sending,
      error,
      contactsSearch,
    } = this.state
    const { navigation } = this.props
    const { width, height } = Dimensions.get('window')
    return (
      <ImageBackground
        source={wavesBG}
        resizeMode="cover"
        style={styles.container}
      >
        <Nav backButton title="Send" navigation={navigation} />
        <View
          style={[
            styles.sendContainer,
            {
              width: width - 50,
              height: height - 134,
            },
          ]}
        >
          {error ? (
            <View style={styles.errorRow}>
              <Text>{error}</Text>
            </View>
          ) : null}
          <View style={styles.scanBtn}>
            <Text style={styles.scanBtnText}>SCAN QR</Text>
            <Ionicons name="md-qr-scanner" color="white" size={24} />
          </View>
          <InputGroup
            label="Recipient Address"
            value={destination}
            onChange={this.onChange('destination')}
          />
          <ContactsSearch
            onChange={this.onChange('contactsSearch')}
            value={contactsSearch}
            style={styles.contactsSearch}
          />
          <View style={styles.amountContainer}>
            <InputGroup
              label="Amount"
              value={amount}
              onChange={this.onChange('amount')}
              style={styles.amountInput}
            />
            <Dropdown
              data={[
                {
                  value: 'Sats',
                },
                {
                  value: 'Bits',
                },
                {
                  value: 'BTC',
                },
              ]}
              onChangeText={this.onChange('unitSelected')}
              containerStyle={styles.amountSelect}
              value={unitSelected}
              lineWidth={0}
              inputContainerStyle={styles.amountSelectInput}
              rippleOpacity={0}
              pickerStyle={styles.amountPicker}
              dropdownOffset={{ top: 8, left: 0 }}
              rippleInsets={{ top: 8, bottom: 0, right: 0, left: 0 }}
            />
          </View>
          <View style={styles.sendSwipeContainer}>
            <SwipeVerify
              width={width - 50}
              buttonSize={52}
              buttonColor={CSS.Colors.BUTTON_BLUE}
              borderColor={CSS.Colors.BUTTON_BLUE}
              backgroundColor={CSS.Colors.FUN_BLUE}
              textColor="#37474F"
              borderRadius={100}
              style={
                this.isFilled() ? styles.swipeContainer : styles.disabledSwipe
              }
              disabled={!this.isFilled()}
              onVerified={this.sendRequest}
            >
              <View style={styles.sendSwipeTextContainer}>
                <Text style={styles.sendSwipeText}>Send Transaction</Text>
                <View style={styles.sendSwipeTextArrows}>
                  <Ionicons
                    name="ios-arrow-forward"
                    color={CSS.Colors.TEXT_WHITE}
                    size={20}
                  />
                  <Ionicons
                    name="ios-arrow-forward"
                    color={CSS.Colors.TEXT_WHITE}
                    size={20}
                  />
                  <Ionicons
                    name="ios-arrow-forward"
                    color={CSS.Colors.TEXT_WHITE}
                    size={20}
                  />
                </View>
              </View>
            </SwipeVerify>
          </View>
          {sending ? (
            <View
              style={[
                styles.sendingOverlay,
                {
                  width: width - 50,
                  height: height - 134,
                },
              ]}
            >
              <ActivityIndicator color={CSS.Colors.FUN_BLUE} size="large" />
              <Text style={styles.sendingText}>Sending Transaction...</Text>
            </View>
          ) : null}
        </View>
      </ImageBackground>
    )
  }
}

export default SendScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  contactsSearch: { marginBottom: 42, height: 45 },
  sendContainer: {
    height: '100%',
    width: '100%',
    marginTop: 5,
    paddingVertical: 25,
    paddingHorizontal: 35,
    backgroundColor: CSS.Colors.BACKGROUND_WHITE,
    borderRadius: 40,
    overflow: 'hidden',
  },
  sendingOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CSS.Colors.BACKGROUND_WHITE_TRANSPARENT95,
    elevation: 10,
    zIndex: 1000,
  },
  swipeContainer: {
    opacity: 1,
  },
  disabledSwipe: {
    opacity: 0.1,
  },
  sendingText: {
    color: CSS.Colors.TEXT_GRAY,
    fontSize: 14,
    fontFamily: 'Montserrat-700',
    marginTop: 10,
  },
  errorRow: {
    width: '100%',
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: CSS.Colors.BACKGROUND_RED,
  },
  scanBtn: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: CSS.Colors.BUTTON_BLUE,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    marginBottom: 60,
    elevation: 10,
  },
  sendSwipeTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBtnText: {
    color: CSS.Colors.TEXT_WHITE,
    fontSize: 14,
    fontFamily: 'Montserrat-700',
    marginRight: 10,
  },
  sendSwipeTextArrows: {
    position: 'absolute',
    right: -30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.2,
  },
  amountContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  amountInput: {
    width: '60%',
    marginBottom: 0,
  },
  amountSelect: {
    width: '35%',
    marginBottom: 0,
    height: 45,
  },
  amountSelectInput: {
    borderBottomColor: CSS.Colors.TRANSPARENT,
    elevation: 4,
    paddingHorizontal: 15,
    borderRadius: 100,
    height: 45,
    alignItems: 'center',
    backgroundColor: CSS.Colors.BACKGROUND_WHITE,
  },
  amountPicker: { borderRadius: 15 },
  sendSwipeContainer: {
    position: 'absolute',
    bottom: 25,
    left: 35,
    width: '100%',
    height: 60,
    justifyContent: 'center',
  },
  sendSwipeText: {
    flexDirection: 'row',
    alignItems: 'center',
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-700',
    opacity: 0.7,
    fontSize: 12,
  },
})
