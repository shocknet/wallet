/**
 * @format
 */
import React, { Component } from 'react'
import {
  // Clipboard,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ImageBackground,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native'
// @ts-ignore
import { Dropdown } from 'react-native-material-dropdown'
// @ts-ignore
import SwipeVerify from 'react-native-swipe-verify'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { connect } from 'react-redux'
import wavesBG from '../../assets/images/shock-bg.png'
import Nav from '../../components/Nav'
import InputGroup from '../../components/InputGroup'
import ContactsSearch from '../../components/Search/ContactsSearch'
import Suggestion from '../../components/Search/Suggestion'
import BitcoinAccepted from '../../assets/images/bitcoin-accepted.png'

import * as CSS from '../../res/css'
import * as Wallet from '../../services/wallet'
import { selectContact, resetSelectedContact } from '../../actions/ChatActions'
export const SEND_SCREEN = 'SEND_SCREEN'

/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}, {}>} Navigation
 */

/**
 * @typedef {import('../../actions/ChatActions').Contact | import('../../actions/ChatActions').BTCAddress} ContactTypes
 */

/**
 * @typedef {object} Props
 * @prop {(Navigation)=} navigation
 * @prop {import('../../../reducers/ChatReducer').State} chat
 * @prop {(contact: ContactTypes) => ContactTypes} selectContact
 * @prop {() => void} resetSelectedContact
 */

/**
 * @typedef {object} State
 * @prop {string} description
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
    description: '',
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
    const { amount } = this.state
    const { selectedContact } = this.props.chat
    return (
      selectedContact.address &&
      selectedContact.address.length > 0 &&
      parseFloat(amount) > 0
    )
  }

  sendBTCRequest = async () => {
    try {
      const { selectedContact } = this.props.chat
      const { amount } = this.state

      if (!selectedContact.address) {
        return
      }

      this.setState({
        sending: true,
      })

      const transactionId = await Wallet.sendCoins({
        addr: selectedContact.address,
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

  // Reserved
  payLightningInvoice = async () => {}

  resetSearchState = () => {
    const { resetSelectedContact } = this.props
    resetSelectedContact()
    this.setState({
      contactsSearch: '',
    })
  }

  renderContactsSearch = () => {
    const { chat } = this.props
    const { contactsSearch } = this.state

    if (!chat.selectedContact) {
      return (
        <ContactsSearch
          onChange={this.onChange('contactsSearch')}
          value={contactsSearch}
          style={styles.contactsSearch}
        />
      )
    }

    if (chat.selectedContact.type === 'btc') {
      return (
        <Suggestion
          name={chat.selectedContact.address}
          onPress={this.resetSearchState}
          type="btc"
          style={styles.suggestion}
        />
      )
    }

    return (
      <Suggestion
        name={chat.selectedContact.displayName}
        avatar={chat.selectedContact.avatar}
        onPress={this.resetSearchState}
        style={styles.suggestion}
      />
    )
  }

  render() {
    const { description, unitSelected, amount, sending, error } = this.state
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
              maxHeight: height - 200,
            },
          ]}
        >
          <ScrollView>
            <View style={styles.scrollInnerContent}>
              {error ? (
                <View style={styles.errorRow}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
              <View style={styles.scanBtn}>
                <Text style={styles.scanBtnText}>SCAN QR</Text>
                <Ionicons name="md-qr-scanner" color="gray" size={24} />
              </View>
              {this.renderContactsSearch()}
              <View style={styles.amountContainer}>
                <InputGroup
                  label="Enter Amount"
                  value={amount}
                  onChange={this.onChange('amount')}
                  style={styles.amountInput}
                  type="numeric"
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
              <InputGroup
                label="Description"
                value={description}
                multiline
                onChange={this.onChange('description')}
                inputStyle={styles.descInput}
              />
              {sending ? (
                <View
                  style={[
                    styles.sendingOverlay,
                    {
                      width: width - 50,
                      height: height - 194,
                    },
                  ]}
                >
                  <ActivityIndicator color={CSS.Colors.FUN_BLUE} size="large" />
                  <Text style={styles.sendingText}>Sending Transaction...</Text>
                </View>
              ) : null}
            </View>
          </ScrollView>
        </View>
        <View style={styles.sendSwipeContainer}>
          {this.isFilled() ? (
            <SwipeVerify
              width="100%"
              buttonSize={60}
              height={50}
              style={styles.swipeBtn}
              buttonColor={CSS.Colors.BACKGROUND_WHITE}
              borderColor={CSS.Colors.TRANSPARENT}
              backgroundColor={CSS.Colors.BACKGROUND_WHITE}
              textColor="#37474F"
              borderRadius={100}
              swipeColor={CSS.Colors.GOLD}
              icon={
                <Image
                  source={BitcoinAccepted}
                  resizeMethod="resize"
                  resizeMode="contain"
                  style={styles.btcIcon}
                />
              }
              disabled={!this.isFilled()}
              onVerified={this.sendBTCRequest}
            >
              <Text style={styles.swipeBtnText}>SLIDE TO SEND</Text>
            </SwipeVerify>
          ) : null}
        </View>
      </ImageBackground>
    )
  }
}

/** @param {import('../../../reducers/index').default} state */
const mapStateToProps = ({ chat }) => ({ chat })

const mapDispatchToProps = {
  selectContact,
  resetSelectedContact,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SendScreen)

const styles = StyleSheet.create({
  container: {
    height: 170,
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  contactsSearch: { marginBottom: 20 },
  sendContainer: {
    marginTop: 5,
    backgroundColor: CSS.Colors.BACKGROUND_WHITE,
    height: 'auto',
    borderRadius: 40,
  },
  scrollInnerContent: {
    height: '100%',
    width: '100%',
    paddingVertical: 23,
    paddingHorizontal: 35,
    paddingBottom: 0,
  },
  suggestion: { marginVertical: 10 },
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
  sendingText: {
    color: CSS.Colors.TEXT_GRAY,
    fontSize: 14,
    fontFamily: 'Montserrat-700',
    marginTop: 10,
  },
  errorRow: {
    width: '100%',
    paddingVertical: 5,
    borderRadius: 100,
    backgroundColor: CSS.Colors.BACKGROUND_RED,
    alignItems: 'center',
    marginBottom: 10,
  },
  errorText: {
    fontFamily: 'Montserrat-700',
    color: CSS.Colors.TEXT_WHITE,
  },
  scanBtn: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: CSS.Colors.BACKGROUND_WHITE,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    marginBottom: 30,
    elevation: 10,
  },
  scanBtnText: {
    color: CSS.Colors.GRAY,
    fontSize: 14,
    fontFamily: 'Montserrat-700',
    marginRight: 10,
  },
  amountContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
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
    width: '100%',
    height: 70,
    paddingHorizontal: 35,
    justifyContent: 'center',
    marginTop: 10,
  },
  swipeBtn: {
    marginBottom: 10,
  },
  btcIcon: {
    height: 30,
  },
  swipeBtnText: {
    fontSize: 12,
    fontFamily: 'Montserrat-700',
    color: CSS.Colors.TEXT_GRAY,
  },
  descInput: {
    height: 90,
    borderRadius: 15,
    textAlignVertical: 'top',
  },
})
