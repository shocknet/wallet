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
  TouchableOpacity,
} from 'react-native'
// @ts-ignore
import { Dropdown } from 'react-native-material-dropdown'
// @ts-ignore
import SwipeVerify from 'react-native-swipe-verify'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { connect } from 'react-redux'
import Big from 'big.js'
import wavesBG from '../../assets/images/shock-bg.png'
import Nav from '../../components/Nav'
import InputGroup from '../../components/InputGroup'
import ContactsSearch from '../../components/Search/ContactsSearch'
import Suggestion from '../../components/Search/Suggestion'
import QRScanner from '../QRScanner'
import BitcoinAccepted from '../../assets/images/bitcoin-accepted.png'

import * as CSS from '../../res/css'
import * as Wallet from '../../services/wallet'
import { selectContact, resetSelectedContact } from '../../actions/ChatActions'
import {
  resetInvoice,
  decodePaymentRequest,
} from '../../actions/InvoiceActions'
import { WALLET_OVERVIEW } from '../WalletOverview'
export const SEND_SCREEN = 'SEND_SCREEN'

/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}, {}>} Navigation
 */

/**
 * @typedef {import('../../actions/ChatActions').Contact | import('../../actions/ChatActions').BTCAddress} ContactTypes
 */

/**
 * @typedef {({ type: 'error', error: Error }|undefined)} DecodeResponse
 */

/**
 * @typedef {object} Props
 * @prop {(Navigation)=} navigation
 * @prop {import('../../../reducers/ChatReducer').State} chat
 * @prop {import('../../../reducers/InvoiceReducer').State} invoice
 * @prop {(contact: ContactTypes) => ContactTypes} selectContact
 * @prop {() => void} resetSelectedContact
 * @prop {() => void} resetInvoice
 * @prop {(invoice: string) => Promise<DecodeResponse>} decodePaymentRequest
 */

/**
 * @typedef {object} State
 * @prop {string} description
 * @prop {string} unitSelected
 * @prop {string} amount
 * @prop {string} contactsSearch
 * @prop {boolean} sending
 * @prop {boolean} paymentSuccessful
 * @prop {boolean} scanningQR
 * @prop {Error|null} error
 */

/**
 * @augments React.Component<Props, State, never>
 */
class SendScreen extends Component {
  state = {
    description: '',
    unitSelected: 'sats',
    amount: '0',
    contactsSearch: '',
    paymentSuccessful: false,
    scanningQR: false,
    sending: false,
    error: null,
  }

  amountOptionList = React.createRef()

  componentDidMount() {
    this.resetSearchState()
  }

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
    const { paymentRequest } = this.props.invoice
    const { selectedContact } = this.props.chat
    return (
      (selectedContact &&
        selectedContact.address &&
        selectedContact.address.length > 0 &&
        parseFloat(amount) > 0) ||
      !!paymentRequest
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
      console.warn(e)
      this.setState({
        sending: false,
        error: e.message,
      })
    }
  }

  // Reserved
  payLightningInvoice = async () => {
    try {
      const { invoice, navigation } = this.props
      const { amount } = this.state
      this.setState({
        sending: true,
      })
      await Wallet.CAUTION_payInvoice({
        amt:
          invoice.paymentRequest && invoice.amount && Big(invoice.amount).gt(0)
            ? undefined
            : parseInt(amount, 10),
        payreq: invoice.paymentRequest,
      })
      this.setState({
        sending: false,
        paymentSuccessful: true,
      })
      setTimeout(() => {
        if (navigation) {
          navigation.navigate(WALLET_OVERVIEW)
        }
      }, 500)
    } catch (err) {
      this.setState({
        sending: false,
        error: err,
      })
    }
  }

  resetSearchState = () => {
    const { resetSelectedContact, resetInvoice } = this.props
    resetSelectedContact()
    resetInvoice()
    this.setState({
      contactsSearch: '',
    })
  }

  renderContactsSearch = () => {
    const { chat, invoice } = this.props
    const { contactsSearch } = this.state

    if (invoice.paymentRequest) {
      return (
        <Suggestion
          name={invoice.paymentRequest}
          onPress={this.resetSearchState}
          type="invoice"
          style={styles.suggestion}
        />
      )
    }

    if (!chat.selectedContact) {
      return (
        <ContactsSearch
          onChange={this.onChange('contactsSearch')}
          onError={this.onChange('error')}
          enabledFeatures={['btc', 'invoice']}
          placeholder="Enter invoice or address..."
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

  getErrorMessage = () => {
    const { error } = this.state
    if (!error) {
      return null
    }

    // @ts-ignore Typescript is being crazy here
    if (error.message) {
      // @ts-ignore
      return error.message
    }

    return error
  }

  toggleQRScreen = () => {
    const { scanningQR } = this.state

    this.setState({
      scanningQR: !scanningQR,
    })
  }

  /**
   * @param {string} value
   */
  isBTCAddress = value => /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(value)

  /**
   * @param {string} value
   */
  isLightningInvoice = value =>
    /^(ln(tb|bc))[0-9][a-z0-9]{180,7089}$/.test(value)

  /**
   * @param {string} data
   */
  sanitizeQR = data => data.replace(/((lightning:)|(http(s)?:\/\/))/gi, '')

  onQRRead = async (data = '') => {
    this.resetSearchState()
    const { decodePaymentRequest, selectContact } = this.props
    const sanitizedQR = this.sanitizeQR(data)
    console.log('QR Value:', sanitizedQR)
    console.log('Lightning Invoice?', this.isLightningInvoice(sanitizedQR))
    console.log('BTC Address?', this.isBTCAddress(sanitizedQR))
    this.onChange('error')('')
    if (this.isLightningInvoice(sanitizedQR)) {
      const data = await decodePaymentRequest(sanitizedQR)
      if (data && data.type === 'error') {
        this.onChange('error')(data.error.message)
      }
    } else if (this.isBTCAddress(sanitizedQR)) {
      selectContact({ address: sanitizedQR, type: 'btc' })
    } else {
      this.onChange('error')('Invalid QR Code')
    }

    this.toggleQRScreen()
  }

  render() {
    const {
      description,
      unitSelected,
      amount,
      sending,
      error,
      paymentSuccessful,
      scanningQR,
    } = this.state
    const { navigation, invoice } = this.props
    const { width, height } = Dimensions.get('window')
    const editable =
      !!(
        invoice.paymentRequest &&
        invoice.amount &&
        Big(invoice.amount).eq(0)
      ) || !invoice.paymentRequest

    if (scanningQR) {
      return (
        <View style={CSS.styles.flex}>
          <QRScanner
            onQRSuccess={this.onQRRead}
            toggleQRScreen={this.toggleQRScreen}
            type="send"
          />
        </View>
      )
    }

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
                  <Text style={styles.errorText}>{this.getErrorMessage()}</Text>
                </View>
              ) : null}
              <TouchableOpacity
                style={styles.scanBtn}
                onPress={this.toggleQRScreen}
              >
                <Text style={styles.scanBtnText}>SCAN QR</Text>
                <Ionicons name="md-qr-scanner" color="gray" size={24} />
              </TouchableOpacity>
              {this.renderContactsSearch()}
              {invoice.paymentRequest ? (
                <InputGroup
                  label="Destination"
                  value={invoice.recipientAddress}
                  style={styles.destinationInput}
                  inputStyle={styles.destinationInput}
                  disabled
                />
              ) : null}
              <View style={styles.amountContainer}>
                <InputGroup
                  label="Enter Amount"
                  value={!editable ? invoice.amount : amount}
                  onChange={this.onChange('amount')}
                  style={styles.amountInput}
                  disabled={!editable}
                  type="numeric"
                />
                <Dropdown
                  data={[
                    {
                      value: 'sats',
                    },
                    {
                      value: 'BTC',
                    },
                  ]}
                  disabled={!editable}
                  onChangeText={this.onChange('unitSelected')}
                  containerStyle={styles.amountSelect}
                  value={invoice.paymentRequest ? 'sats' : unitSelected}
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
                value={
                  invoice.paymentRequest ? invoice.description : description
                }
                multiline
                onChange={this.onChange('description')}
                inputStyle={styles.descInput}
                disabled={!!invoice.paymentRequest}
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
              {paymentSuccessful ? (
                <View
                  style={[
                    styles.sendingOverlay,
                    {
                      width: width - 50,
                      height: height - 194,
                    },
                  ]}
                >
                  <Ionicons
                    name="md-checkmark-circle-outline"
                    size={60}
                    color={CSS.Colors.FUN_BLUE}
                  />
                  <Text style={styles.sendingText}>
                    Transaction sent successfully!
                  </Text>
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
              onVerified={
                invoice.paymentRequest
                  ? this.payLightningInvoice
                  : this.sendBTCRequest
              }
            >
              <Text style={styles.swipeBtnText}>SLIDE TO SEND</Text>
            </SwipeVerify>
          ) : null}
        </View>
      </ImageBackground>
    )
  }
}

/** @param {{ invoice: import('../../../reducers/InvoiceReducer').State, chat: import('../../../reducers/ChatReducer').State }} state */
const mapStateToProps = ({ chat, invoice }) => ({ chat, invoice })

const mapDispatchToProps = {
  selectContact,
  resetSelectedContact,
  resetInvoice,
  decodePaymentRequest,
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
    overflow: 'hidden',
  },
  scrollInnerContent: {
    height: '100%',
    width: '100%',
    paddingVertical: 23,
    paddingHorizontal: 35,
    paddingBottom: 0,
  },
  destinationInput: {
    marginBottom: 10,
  },
  suggestion: { marginVertical: 10 },
  sendingOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
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
    paddingHorizontal: 15,
    borderRadius: 100,
    backgroundColor: CSS.Colors.BACKGROUND_RED,
    alignItems: 'center',
    marginBottom: 10,
  },
  errorText: {
    fontFamily: 'Montserrat-700',
    color: CSS.Colors.TEXT_WHITE,
    textAlign: 'center',
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
