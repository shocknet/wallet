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
  Switch,
} from 'react-native'
import Logger from 'react-native-file-log'
// @ts-expect-error
import { Dropdown } from 'react-native-material-dropdown'
// @ts-expect-error
import SwipeVerify from 'react-native-swipe-verify'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { connect } from 'react-redux'
import Big from 'big.js'
import wavesBG from '../../assets/images/shock-bg.png'
import wavesBGDark from '../../assets/images/shock-bg-dark.png'
import Nav from '../../components/Nav'
import InputGroup from '../../components/InputGroup'
import ContactsSearch from '../../components/Search/ContactsSearch'
import Suggestion from '../../components/Search/Suggestion'
import QRScanner from '../QRScanner'
import BitcoinAccepted from '../../assets/images/bitcoin-accepted.png'

import * as CSS from '../../res/css'
import * as Wallet from '../../services/wallet'
import * as API from '../../services/contact-api/index'
import {
  selectContact,
  resetSelectedContact,
} from '../../store/actions/ChatActions'
import {
  resetInvoice,
  decodePaymentRequest,
} from '../../store/actions/InvoiceActions'
import { WALLET_OVERVIEW } from '../WalletOverview'
export const SEND_SCREEN = 'SEND_SCREEN'
/**
 * @typedef {import('../../services/validators').ExtractedBTCAddress} ExtractedBTCAddress
 * @typedef {import('../../services/validators').ExtractedLNInvoice} ExtractedLNInvoice
 * @typedef {import('../../services/validators').ExtractedKeysend} ExtractedKeysend
 */
/**
 * @typedef {object} FromChat
 * @prop {string=} recipientAvatar
 * @prop {string=} recipientDisplayName
 * @prop {string=} recipientPublicKey
 */
/**
 * @typedef {object} Params
 * @prop {boolean|undefined} isRedirect
 * @prop {ExtractedBTCAddress|(ExtractedLNInvoice & FromChat)|ExtractedKeysend} data
 */

/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}, Params>} Navigation
 */

/**
 * @typedef {import('../../store/actions/ChatActions').Contact | import('../../store/actions/ChatActions').BTCAddress | import('../../store/actions/ChatActions').Keysend} ContactTypes
 */

/**
 * @typedef {({ type: 'error', error: Error }|undefined)} DecodeResponse
 */

/**
 * @typedef {object} Props
 * @prop {Navigation} navigation
 * @prop {import('../../store/reducers/ChatReducer').State} chat
 * @prop {import('../../store/reducers/InvoiceReducer').State} invoice
 * @prop {(contact: ContactTypes) => ContactTypes} selectContact
 * @prop {() => void} resetSelectedContact
 * @prop {() => void} resetInvoice
 * @prop {(invoice: string) => Promise<DecodeResponse>} decodePaymentRequest
 * @prop {import('../../store/reducers/FeesReducer').State} fees
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
 * @prop {boolean} sendAll
 * @prop {Error|null} error
 * @prop {boolean} isDecoding
 * @prop {string=} paymentAvatar
 * @prop {string=} paymentName
 */

/**
 * @extends Component<Props, State, never>
 */
class SendScreen extends Component {
  /**@type State */
  state = {
    description: '',
    unitSelected: 'sats',
    amount: '0',
    contactsSearch: '',
    paymentSuccessful: false,
    scanningQR: false,
    sending: false,
    sendAll: false,
    error: null,
    isDecoding: false,
  }

  amountOptionList = React.createRef()

  theme = 'dark'

  /**
   *
   * @param {Params} params
   */
  handleRedirect(params) {
    const { selectContact, decodePaymentRequest } = this.props
    if (params.data) {
      const { data } = params
      this.resetSearchState()
      switch (data.type) {
        case 'btc': {
          selectContact({
            type: 'btc',
            address: data.address,
          })
          if (data.amount) {
            this.setState({ amount: data.amount.toString() })
          }
          break
        }
        case 'keysend': {
          selectContact({
            type: 'keysend',
            dest: data.address,
          })
          break
        }
        case 'ln': {
          this.startDecoding()
          decodePaymentRequest(data.request)
          if (data.recipientDisplayName) {
            this.setState({
              paymentName: data.recipientDisplayName,
              paymentAvatar: data.recipientAvatar,
            })
          }
          break
        }
      }
      this.props.navigation.setParams({
        isRedirect: undefined,
        data: undefined,
      })
    }
    this.props.navigation.setParams({ isRedirect: undefined })
  }

  componentDidMount() {
    const { params } = this.props.navigation.state
    if (params && params.isRedirect) {
      this.handleRedirect(params)
    } else {
      this.resetSearchState()
    }
  }

  /**
   *
   * @param {Props} prevProps
   */
  componentDidUpdate(prevProps) {
    const p1 = this.props.navigation.state.params
    const p2 = prevProps.navigation.state.params
    if (!p1 || !p2) {
      return
    }
    if (p1.isRedirect !== p2.isRedirect) {
      if (p1.isRedirect) {
        this.handleRedirect(p1)
      }
    }
  }

  startDecoding = () => {
    this.setState({ isDecoding: true })
  }

  /**
   * @param {keyof State} key
   * @returns {(value: any) => void}
   */
  onChange = key => value => {
    /**
     * @type {Pick<State, keyof State>}
     */
    // @ts-expect-error TODO: fix typing
    const updatedState = {
      [key]: value,
    }
    this.setState(updatedState)
  }

  isFilled = () => {
    const { amount, sendAll } = this.state
    const { paymentRequest } = this.props.invoice
    const { selectedContact } = this.props.chat
    return (
      // @ts-expect-error
      ((selectedContact?.address?.length > 0 ||
        selectedContact?.type === 'keysend' ||
        selectedContact?.type === 'contact') &&
        parseFloat(amount) > 0) ||
      (selectedContact?.type === 'btc' && sendAll) ||
      !!paymentRequest
    )
  }

  sendBTCRequest = async () => {
    try {
      const { selectedContact } = this.props.chat
      const { amount, sendAll } = this.state

      // @ts-expect-error
      if (!selectedContact.address) {
        return
      }

      this.setState({
        sending: true,
      })

      const transactionId = await Wallet.sendCoins({
        // @ts-expect-error
        addr: selectedContact.address,
        amount: sendAll ? undefined : parseInt(amount, 10),
        send_all: sendAll,
        fees: this.props.fees,
      })

      Logger.log('New Transaction ID:', transactionId)

      this.setState({
        sending: false,
      })
      if (this.props.navigation) {
        this.props.navigation.goBack()
      }
    } catch (e) {
      Logger.log(e)
      this.setState({
        sending: false,
        error: e,
      })
    }
  }

  payLightningInvoice = async () => {
    try {
      const { invoice, navigation, fees } = this.props
      const { amount } = this.state
      this.setState({
        sending: true,
      })
      const hideAmount = !!(
        invoice.paymentRequest &&
        invoice.amount &&
        Big(invoice.amount).gt(0)
      )
      const payload = {
        amt: hideAmount ? parseInt(invoice.amount, 10) : parseInt(amount, 10),
        payreq: invoice.paymentRequest,
        fees,
        hideAmount,
      }
      await Wallet.CAUTION_payInvoice(payload)
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

  payKeysend = async () => {
    try {
      const { navigation, chat, fees } = this.props
      const { selectedContact } = chat
      if (!selectedContact || selectedContact.type !== 'keysend') {
        return
      }
      const { dest } = selectedContact
      const { amount } = this.state
      this.setState({
        sending: true,
      })
      await Wallet.payKeysend({
        amt: parseInt(amount, 10),
        dest,
        fees,
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

  sendPayment = async () => {
    try {
      const { navigation, chat, fees } = this.props
      const { amount, description } = this.state
      const { selectedContact } = chat
      this.setState({
        sending: true,
      })
      await API.Actions.sendPayment(
        // @ts-expect-error
        selectedContact.pk,
        amount,
        description,
        fees,
      )
      this.setState({
        sending: false,
        paymentSuccessful: true,
      })
      setTimeout(() => {
        if (navigation) {
          navigation.navigate(WALLET_OVERVIEW)
        }
      }, 500)
      return true
    } catch (err) {
      this.setState({
        sending: false,
        error: err,
      })

      return false
    }
  }

  resetSearchState = () => {
    const { resetSelectedContact, resetInvoice } = this.props
    resetSelectedContact()
    resetInvoice()
    this.setState({
      contactsSearch: '',
      isDecoding: false,
      paymentName: undefined,
      paymentAvatar: undefined,
    })
  }

  renderContactsSearch = () => {
    const { chat, invoice } = this.props
    const { contactsSearch, paymentName, paymentAvatar } = this.state

    if (invoice.paymentRequest) {
      const showName = paymentName ? paymentName : invoice.paymentRequest
      return (
        <Suggestion
          name={showName}
          avatar={paymentAvatar}
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
          startDecoding={this.startDecoding}
          enabledFeatures={['btc', 'invoice', 'contacts', 'keysend']}
          placeholder="Insert Address / Invoice"
          value={contactsSearch}
          style={styles.contactsSearch}
        />
      )
    }
    if (chat.selectedContact.type === 'keysend') {
      return (
        <Suggestion
          name={chat.selectedContact.dest}
          onPress={this.resetSearchState}
          type="keysend"
          style={styles.suggestion}
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
        // @ts-expect-error
        name={chat.selectedContact.displayName}
        // @ts-expect-error
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

    if (error.message) {
      return error.message
    }
    if (
      // @ts-expect-error
      error.response &&
      // @ts-expect-error
      error.response.data &&
      // @ts-expect-error
      error.response.data.errorMessage
    ) {
      // @ts-expect-error
      return error.response.data.errorMessage
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
   * @param {string} address
   */
  sanitizeAddress = address =>
    address.replace(/(.*):/, '').replace(/\?(.*)/, '')

  /**
   * @param {string} value
   */
  isBTCAddress = value => {
    const sanitizedAddress = this.sanitizeAddress(value)
    const bech32Test = /^(bc(1|r)|[123]|m|n|((t|x)pub)|(tb1))[a-zA-HJ-NP-Z0-9]{25,90}$/.test(
      sanitizedAddress,
    )
    return bech32Test
  }

  /**
   * @param {string} value
   */
  isLightningInvoice = value =>
    /^(ln(tb|bc|bcrt))[0-9][a-z0-9]{180,7089}$/.test(value.toLowerCase())

  /**
   * @param {string} value
   */
  isLnPubKey = value => /^[a-f0-9]{66}$/.test(value.toLowerCase())

  /**
   * @param {string} data
   */
  sanitizeQR = data => data.replace(/((lightning:)|(http(s)?:\/\/))/gi, '')

  onQRRead = async (data = '') => {
    this.resetSearchState()
    const { decodePaymentRequest, selectContact } = this.props
    const sanitizedQR = this.sanitizeQR(data)
    Logger.log('QR Value:', sanitizedQR)
    Logger.log('Lightning Invoice?', this.isLightningInvoice(sanitizedQR))
    Logger.log('BTC Address?', this.isBTCAddress(sanitizedQR))
    Logger.log('LN pub key?', this.isLnPubKey(sanitizedQR))
    this.onChange('error')('')
    if (this.isLightningInvoice(sanitizedQR)) {
      const data = await decodePaymentRequest(sanitizedQR)
      if (data && data.type === 'error') {
        this.onChange('error')(data.error.message)
      }
    } else if (this.isBTCAddress(sanitizedQR)) {
      selectContact({ address: this.sanitizeAddress(sanitizedQR), type: 'btc' })
    } else if (this.isLnPubKey(sanitizedQR)) {
      selectContact({ dest: sanitizedQR, type: 'keysend' })
    } else {
      this.onChange('error')('Invalid QR Code')
    }

    this.toggleQRScreen()
  }

  renderSlideToSendButton = () => {
    if (this.isFilled()) {
      if (this.theme === 'dark') {
        return (
          <SwipeVerify
            width="100%"
            buttonSize={84}
            height={59}
            style={styles.swipeBtnDark}
            buttonColor="#212937"
            borderColor="#4285B9"
            backgroundColor={CSS.Colors.TRANSPARENT}
            textColor={CSS.Colors.TEXT_WHITE}
            borderRadius={42}
            swipeColor="#4285B9"
            icon={
              <Image
                source={BitcoinAccepted}
                resizeMethod="resize"
                resizeMode="contain"
                style={styles.btcIconDark}
              />
            }
            disabled={!this.isFilled()}
            onVerified={this.onSwipe}
          >
            <Text style={styles.swipeBtnTextDark}>SLIDE TO SEND</Text>
          </SwipeVerify>
        )
      }
      return (
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
          onVerified={this.onSwipe}
        >
          <Text style={styles.swipeBtnText}>SLIDE TO SEND</Text>
        </SwipeVerify>
      )
    }
    return null
  }

  onSwipe = async () => {
    try {
      const { invoice, chat } = this.props
      if (chat.selectedContact?.type === 'contact') {
        await this.sendPayment()
        return true
      }
      if (chat.selectedContact?.type === 'keysend') {
        await this.payKeysend()
        return true
      }

      if (invoice.paymentRequest) {
        await this.payLightningInvoice()
        return true
      }

      await this.sendBTCRequest()
      return true
    } catch (err) {
      Logger.log(`SendScreen.prototype.onSwipe() -> ${err.message}`)
      return false
    }
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
      sendAll,
      isDecoding,
    } = this.state
    const { navigation, invoice, chat } = this.props
    const { width, height } = Dimensions.get('window')
    const editable =
      !!(
        invoice.paymentRequest &&
        invoice.amount &&
        Big(invoice.amount).eq(0)
      ) || !invoice.paymentRequest
    const decodingInvoice =
      isDecoding && !invoice.decodeError && invoice.paymentRequest === ''
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
        source={this.theme === 'dark' ? wavesBGDark : wavesBG}
        resizeMode="cover"
        style={this.theme === 'dark' ? styles.containerDark : styles.container}
      >
        <Nav backButton title="Send" navigation={navigation} />
        <View
          style={
            this.theme === 'dark'
              ? [
                  styles.sendContainerDark,
                  {
                    width: width - 50,
                    maxHeight: height - 200,
                  },
                ]
              : [
                  styles.sendContainer,
                  {
                    width: width - 50,
                    maxHeight: height - 200,
                  },
                ]
          }
        >
          <ScrollView>
            <View style={styles.scrollInnerContent}>
              {error ? (
                <View style={styles.errorRow}>
                  <Text style={styles.errorText}>{this.getErrorMessage()}</Text>
                </View>
              ) : null}
              {invoice.decodeError ? (
                <View style={styles.errorRow}>
                  <Text style={styles.errorText}>{invoice.decodeError}</Text>
                </View>
              ) : null}
              <TouchableOpacity
                style={
                  this.theme === 'dark' ? styles.scanBtnDark : styles.scanBtn
                }
                onPress={this.toggleQRScreen}
              >
                {this.theme === 'dark' ? (
                  <>
                    <Ionicons name="md-qr-scanner" color="white" size={24} />
                    <Text style={styles.scanBtnTextDark}>Scan QR</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.scanBtnText}>SCAN QR</Text>
                    <Ionicons name="md-qr-scanner" color="gray" size={24} />
                  </>
                )}
              </TouchableOpacity>

              {this.theme === 'dark' && (
                <Text style={styles.label}>Contacts / Recents</Text>
              )}

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
                  containerStyle={
                    this.theme === 'dark'
                      ? styles.amountSelectDark
                      : styles.amountSelect
                  }
                  value={invoice.paymentRequest ? 'sats' : unitSelected}
                  lineWidth={0}
                  inputContainerStyle={
                    this.theme === 'dark'
                      ? styles.amountSelectInputDark
                      : styles.amountSelectInput
                  }
                  rippleOpacity={0}
                  pickerStyle={
                    this.theme === 'dark'
                      ? styles.amountPickerDark
                      : styles.amountPicker
                  }
                  dropdownOffset={
                    this.theme === 'dark'
                      ? { top: 0, left: 0 }
                      : { top: 8, left: 0 }
                  }
                  rippleInsets={
                    this.theme === 'dark'
                      ? { top: 0, bottom: 0, right: 0, left: 0 }
                      : { top: 8, bottom: 0, right: 0, left: 0 }
                  }
                  textColor={
                    this.theme === 'dark' ? '#EBEBEB' : 'rgba(0,0,0, .87)'
                  }
                  itemColor={
                    this.theme === 'dark' ? '#CBCBCB' : 'rgba(0,0,0, .54)'
                  }
                  selectedItemColor={
                    this.theme === 'dark' ? '#EBEBEB' : 'rgba(0,0,0, .87)'
                  }
                  baseColor={
                    this.theme === 'dark' ? '#4285B9' : 'rgba(0,0,0, .38)'
                  }
                  style={styles.dropdownLabelStyle}
                  itemTextStyle={styles.dropdownLabelStyle}
                />
              </View>
              {chat.selectedContact?.type === 'btc' ? (
                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleTitle}>Send All</Text>
                  <Switch
                    value={sendAll}
                    onValueChange={this.onChange('sendAll')}
                  />
                </View>
              ) : null}
              <InputGroup
                label="Description"
                value={
                  invoice.paymentRequest ? invoice.description : description
                }
                multiline
                onChange={this.onChange('description')}
                inputStyle={
                  this.theme === 'dark'
                    ? styles.descInputDark
                    : styles.descInput
                }
                disabled={!!invoice.paymentRequest}
                placeholder="(Optional)"
              />
              {decodingInvoice ? (
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
                  <Text style={styles.sendingText}>Decoding invoice...</Text>
                </View>
              ) : null}
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
        <View
          style={
            this.theme === 'dark'
              ? styles.sendSwipeContainerDark
              : styles.sendSwipeContainer
          }
        >
          {/*{this.isFilled() ? (*/}
          {/*  <SwipeVerify*/}
          {/*    width="100%"*/}
          {/*    buttonSize={60}*/}
          {/*    height={50}*/}
          {/*    style={styles.swipeBtn}*/}
          {/*    buttonColor={CSS.Colors.BACKGROUND_WHITE}*/}
          {/*    borderColor={CSS.Colors.TRANSPARENT}*/}
          {/*    backgroundColor={CSS.Colors.BACKGROUND_WHITE}*/}
          {/*    textColor="#37474F"*/}
          {/*    borderRadius={100}*/}
          {/*    swipeColor={CSS.Colors.GOLD}*/}
          {/*    icon={*/}
          {/*      <Image*/}
          {/*        source={BitcoinAccepted}*/}
          {/*        resizeMethod="resize"*/}
          {/*        resizeMode="contain"*/}
          {/*        style={styles.btcIcon}*/}
          {/*      />*/}
          {/*    }*/}
          {/*    disabled={!this.isFilled()}*/}
          {/*    onVerified={this.onSwipe}*/}
          {/*  >*/}
          {/*    <Text style={styles.swipeBtnText}>SLIDE TO SEND</Text>*/}
          {/*  </SwipeVerify>*/}
          {/*) : null}*/}

          {this.renderSlideToSendButton()}
        </View>
      </ImageBackground>
    )
  }
}

/** @param {{
 * invoice: import('../../store/reducers/InvoiceReducer').State,
 * chat: import('../../store/reducers/ChatReducer').State,
 * fees: import('../../store/reducers/FeesReducer').State,
 * }} state */
const mapStateToProps = ({ chat, invoice, fees }) => ({ chat, invoice, fees })

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
  containerDark: {
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
  sendContainerDark: {
    marginTop: 5,
    backgroundColor: CSS.Colors.TRANSPARENT,
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
  scanBtnDark: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#001220',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EAEBEB',
    marginBottom: 30,
    elevation: 8,
    shadowColor: '#FFFFFF29',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 6,
  },
  scanBtnText: {
    color: CSS.Colors.GRAY,
    fontSize: 14,
    fontFamily: 'Montserrat-700',
    marginLeft: 10,
  },
  scanBtnTextDark: {
    color: CSS.Colors.TEXT_WHITE,
    fontSize: 14,
    fontFamily: 'Montserrat-700',
    marginLeft: 10,
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
  amountSelectDark: {
    width: '35%',
    marginTop: 0,
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
  amountSelectInputDark: {
    paddingHorizontal: 15,
    height: 45,
    alignItems: 'center',
    backgroundColor: CSS.Colors.TRANSPARENT,
    fontFamily: 'Montserrat-700',
    color: '#EBEBEB',
    fontSize: 20,
  },
  amountPicker: { borderRadius: 15 },
  amountPickerDark: {
    borderRadius: 0,
    backgroundColor: '#212937',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggleTitle: {
    fontFamily: 'Montserrat-700',
  },
  sendSwipeContainer: {
    width: '100%',
    height: 70,
    paddingHorizontal: 35,
    justifyContent: 'center',
    marginTop: 10,
  },
  sendSwipeContainerDark: {
    width: '100%',

    paddingHorizontal: 35,
    justifyContent: 'center',
    marginTop: 10,
  },
  swipeBtn: {
    marginBottom: 10,
  },
  swipeBtnDark: {
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 60,
    borderColor: '#4285B9',
  },
  btcIcon: {
    height: 30,
  },
  btcIconDark: {
    height: 59,
  },
  swipeBtnText: {
    fontSize: 12,
    fontFamily: 'Montserrat-700',
    color: CSS.Colors.TEXT_GRAY,
  },
  swipeBtnTextDark: {
    fontSize: 12,
    fontFamily: 'Montserrat-700',
    color: CSS.Colors.TEXT_WHITE,
  },
  descInput: {
    height: 90,
    borderRadius: 15,
    textAlignVertical: 'top',
  },
  descInputDark: {
    height: 90,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-600',
    marginBottom: 11,
  },
  dropdownLabelStyle: {
    fontFamily: 'Montserrat-600',
    fontSize: 20,
  },
})
