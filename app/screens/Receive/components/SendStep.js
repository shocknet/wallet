import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  Text,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Clipboard,
  ToastAndroid,
  Image,
  ScrollView,
} from 'react-native'
import { connect } from 'react-redux'
import Ionicons from 'react-native-vector-icons/Ionicons'
// @ts-ignore
import SwipeVerify from 'react-native-swipe-verify'
import Logger from 'react-native-file-log'

import Suggestion from '../../../components/Search/Suggestion'
import * as CSS from '../../../res/css'
import * as API from '../../../services/contact-api'
import ContactsSearch from '../../../components/Search/ContactsSearch'
import {
  setInvoiceMode,
  addInvoice,
  newAddress,
} from '../../../actions/InvoiceActions'
import { resetSelectedContact } from '../../../actions/ChatActions'
import QR from './QR'
import BitcoinAccepted from '../../../assets/images/bitcoin-accepted.png'
import { CHATS_ROUTE } from '../../Chats'

/**
 * @typedef {ReturnType<typeof mapStateToProps>} ConnectedRedux
 */
/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}, {}>} Navigation
 */

/**
 * @typedef {object} TmpProps
 * @prop {Navigation} navigation
 * @prop {()=>void} editInvoice
 * @prop {(invoiceMode:boolean)=>void} setInvoiceMode
 * @prop {(invoice:import('../../../services/wallet').AddInvoiceRequest)=>void} addInvoice
 * @prop {()=>void} newAddress
 * @prop {()=>void} resetSelectedContact
 */
/**
 * @typedef {ConnectedRedux & TmpProps} Props
 */

/**
 *
 * @typedef {object} State
 * @prop {string} contactsSearch
 */
/**
 * @extends Component<Props, State, never>
 */
class SendStep extends Component {
  state = {
    contactsSearch: '',
  }

  theme = 'dark'

  componentDidMount = async () => {
    const { addInvoice, newAddress, invoice } = this.props
    const { amount, description } = invoice
    await Promise.all([
      addInvoice({
        value: parseInt(amount, 10),
        memo: description,
        expiry: 1800,
      }),
      newAddress(),
    ])
  }

  renderQR = () => {
    const { invoiceMode, paymentRequest, btcAddress } = this.props.invoice
    if (invoiceMode && paymentRequest) {
      return <QR logoToShow="shock" value={paymentRequest} size={150} />
    }

    if (!invoiceMode && btcAddress) {
      return <QR logoToShow="btc" value={btcAddress} size={150} />
    }

    return <ActivityIndicator size="large" color={CSS.Colors.FUN_BLUE} />
  }

  copyQRCode = () => {
    const { invoiceMode, paymentRequest, btcAddress } = this.props.invoice
    Clipboard.setString(invoiceMode ? paymentRequest : btcAddress)
    ToastAndroid.show('Copied!', 500)
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
    Logger.log(chat.selectedContact)
    if (!chat.selectedContact) {
      return (
        <ContactsSearch
          onChange={this.onChange('contactsSearch')}
          enabledFeatures={['contacts']}
          value={contactsSearch}
          style={styles.contactsSearch}
          type="request_step"
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

    if (chat.selectedContact.type === 'contact') {
      return (
        <Suggestion
          name={chat.selectedContact.displayName}
          avatar={chat.selectedContact.avatar}
          onPress={this.resetSearchState}
          style={styles.suggestion}
        />
      )
    }
    return undefined
  }

  sendInvoice = async () => {
    const { chat, invoice, navigation } = this.props
    const { selectedContact } = chat
    if (selectedContact && selectedContact.type === 'contact') {
      const { paymentRequest } = invoice
      await API.Actions.sendReqWithInitialMsg(
        selectedContact.pk,
        '$$__SHOCKWALLET__INVOICE__' + paymentRequest,
      )
      navigation.navigate(CHATS_ROUTE)
    }
  }

  renderSwipeVerifyButton = () => {
    if (this.theme === 'dark') {
      return (
        <SwipeVerify
          width="100%"
          buttonSize={83}
          height={59}
          style={styles.swipeBtn}
          buttonColor="#212937"
          borderColor="#4285B9"
          swipeColor={CSS.Colors.GOLD}
          backgroundColor="#16191C"
          textColor="#EBEBEB"
          borderRadius={100}
          icon={
            <Image
              source={BitcoinAccepted}
              resizeMethod="resize"
              resizeMode="contain"
              style={styles.btcIconDark}
            />
          }
          onVerified={this.sendInvoice}
        >
          <Text style={styles.swipeBtnTextDark}>SLIDE TO SEND</Text>
        </SwipeVerify>
      )
    }
    return (
      <SwipeVerify
        width="100%"
        buttonSize={48}
        height={40}
        style={styles.swipeBtn}
        buttonColor={CSS.Colors.BACKGROUND_WHITE}
        borderColor={CSS.Colors.TRANSPARENT}
        swipeColor={CSS.Colors.GOLD}
        backgroundColor={CSS.Colors.BACKGROUND_NEAR_WHITE}
        textColor="#37474F"
        borderRadius={100}
        icon={
          <Image
            source={BitcoinAccepted}
            resizeMethod="resize"
            resizeMode="contain"
            style={styles.btcIcon}
          />
        }
        onVerified={this.sendInvoice}
      >
        <Text style={styles.swipeBtnText}>SLIDE TO SEND</Text>
      </SwipeVerify>
    )
  }

  render() {
    const { setInvoiceMode, invoice, chat } = this.props
    Logger.log(
      chat.selectedContact,
      chat.selectedContact ? chat.selectedContact.type : 'No selectedContact',
      invoice.invoiceMode,
    )
    return (
      <View style={styles.invoiceContainer}>
        {this.renderContactsSearch()}
        <ScrollView contentContainerStyle={styles.invoiceInfoContainer}>
          <View style={styles.recipientContainer}>
            <View style={styles.recipientContainer}>
              {this.renderQR()}
              <View style={styles.QRTypeContainer}>
                <Text
                  style={
                    this.theme === 'dark'
                      ? styles.invoiceModeBTC
                      : styles.invoiceMode
                  }
                >
                  BTC
                </Text>
                <Switch
                  trackColor={{
                    false: CSS.Colors.CAUTION_YELLOW,
                    true: CSS.Colors.BUTTON_BLUE,
                  }}
                  onValueChange={setInvoiceMode}
                  value={invoice.invoiceMode}
                  thumbColor={CSS.Colors.BACKGROUND_WHITE}
                />
                <Text
                  style={
                    this.theme === 'dark'
                      ? styles.invoiceModeInvoice
                      : styles.invoiceMode
                  }
                >
                  Invoice
                </Text>
              </View>
              <TouchableOpacity
                style={
                  this.theme === 'dark'
                    ? styles.modalButtonDark
                    : styles.modalButton
                }
                onPress={this.copyQRCode}
              >
                <Text
                  style={
                    this.theme === 'dark'
                      ? styles.modalTextDark
                      : styles.modalText
                  }
                >
                  Copy to clipboard
                </Text>
                <Ionicons
                  name="ios-copy"
                  size={20}
                  color={
                    this.theme === 'dark'
                      ? CSS.Colors.TEXT_WHITE
                      : CSS.Colors.TEXT_GRAY_LIGHTER
                  }
                  style={styles.modalIcon}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.invoiceDetails}>
              <TouchableOpacity
                style={styles.editInvoiceDetailsContainer}
                onPress={this.props.editInvoice}
              >
                <Text
                  style={
                    this.theme === 'dark'
                      ? styles.editInvoiceDark
                      : styles.editInvoice
                  }
                >
                  Change
                </Text>
              </TouchableOpacity>
              <View
                style={
                  this.theme === 'dark'
                    ? styles.invoiceDetailDark
                    : styles.invoiceDetail
                }
              >
                <Text
                  style={
                    this.theme === 'dark'
                      ? styles.invoiceDetailTitleDark
                      : styles.invoiceDetailTitle
                  }
                >
                  Amount
                </Text>
                <Text
                  style={
                    this.theme === 'dark'
                      ? styles.invoiceDetailValueDark
                      : styles.invoiceDetailValue
                  }
                >
                  {invoice.amount ? invoice.amount : 'N/A'}
                </Text>
              </View>

              {invoice.liquidityCheck === false && (
                <Text style={styles.redText}>
                  not enough liquidity to receive this payment{' '}
                </Text>
              )}
              <View
                style={[styles.invoiceDetail, styles.noBorderInvoiceDetail]}
              >
                <Text
                  style={
                    this.theme === 'dark'
                      ? styles.invoiceDetailTitleDark
                      : styles.invoiceDetailTitle
                  }
                >
                  Description
                </Text>
                <Text
                  style={
                    this.theme === 'dark'
                      ? styles.invoiceDetailValueDark
                      : styles.invoiceDetailValue
                  }
                  ellipsizeMode="tail"
                  numberOfLines={1}
                >
                  {invoice.description ? invoice.description : 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
        {chat.selectedContact &&
        chat.selectedContact.type === 'contact' &&
        invoice.invoiceMode
          ? this.renderSwipeVerifyButton()
          : null}
      </View>
    )
  }
}

/**
 * @param {{
 * invoice: import('../../../../reducers/InvoiceReducer').State,
 * chat: import('../../../../reducers/ChatReducer').State
 * }} state
 */
const mapStateToProps = ({ invoice, chat }) => ({ invoice, chat })

const mapDispatchToProps = {
  setInvoiceMode,
  addInvoice,
  resetSelectedContact,
  newAddress,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SendStep)

const styles = StyleSheet.create({
  noBorderInvoiceDetail: {
    borderBottomWidth: 0,
  },
  contactsSearch: { marginBottom: 20 },
  invoiceContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  suggestion: { marginVertical: 10 },
  invoiceInfoContainer: {
    width: '100%',
    alignItems: 'center',
  },
  recipientContainer: {
    width: '95%',
    alignItems: 'center',
  },
  btcIcon: {
    height: 30,
  },
  btcIconDark: {
    height: 59,
  },
  QRTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
    marginVertical: 10,
  },
  invoiceMode: {
    fontSize: 14,
    fontFamily: 'Montserrat-700',
  },
  invoiceModeBTC: {
    fontSize: 14,
    fontFamily: 'Montserrat-700',
    color: '#F5A623',
  },
  invoiceModeInvoice: {
    fontSize: 14,
    fontFamily: 'Montserrat-700',
    color: '#4285B9',
  },
  modalButton: {
    width: '100%',
    paddingVertical: 7,
    backgroundColor: CSS.Colors.BACKGROUND_WHITE,
    elevation: 4,
    marginBottom: 23,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonDark: {
    width: '100%',
    height: 46,
    paddingVertical: 7,
    backgroundColor: '#001220',
    elevation: 4,
    marginBottom: 23,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: CSS.Colors.TEXT_WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: CSS.Colors.TEXT_WHITE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    flexDirection: 'row-reverse',
  },
  modalText: {
    color: CSS.Colors.TEXT_GRAY_LIGHTER,
    fontFamily: 'Montserrat-700',
    fontSize: 13,
  },
  modalTextDark: {
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-700',
    fontSize: 13,
    marginLeft: 16,
  },
  modalIcon: {
    marginLeft: 5,
  },
  invoiceDetails: {
    width: '100%',
  },
  editInvoiceDetailsContainer: {
    width: '100%',
  },
  editInvoice: {
    color: CSS.Colors.FUN_BLUE,
    width: '100%',
    textAlign: 'right',
    fontFamily: 'Montserrat-600',
    fontSize: 12,
  },
  editInvoiceDark: {
    color: '#4285B9',
    width: '100%',
    textAlign: 'right',
    fontFamily: 'Montserrat-600',
    fontSize: 12,
  },
  invoiceDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: CSS.Colors.BORDER_GRAY,
  },
  invoiceDetailDark: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#4285B9',
  },
  invoiceDetailTitle: {
    fontFamily: 'Montserrat-700',
    fontSize: 13,
    color: CSS.Colors.TEXT_GRAY_LIGHTER,
    width: '48%',
  },
  invoiceDetailTitleDark: {
    fontFamily: 'Montserrat-700',
    fontSize: 13,
    color: '#EBEBEB',
    width: '48%',
  },
  invoiceDetailValue: {
    fontFamily: 'Montserrat-600',
    fontSize: 14,
    color: CSS.Colors.TEXT_GRAY_LIGHTER,
    width: '48%',
    textAlign: 'right',
  },
  invoiceDetailValueDark: {
    fontFamily: 'Montserrat-600',
    fontSize: 14,
    color: '#EBEBEB',
    width: '48%',
    textAlign: 'right',
  },
  swipeBtn: {
    marginVertical: 15,
    borderColor: '#4285B9',
    borderWidth: 1,
    borderRadius: 60,
  },
  swipeBtnText: {
    fontSize: 12,
    fontFamily: 'Montserrat-700',
    color: CSS.Colors.TEXT_GRAY,
  },
  swipeBtnTextDark: {
    fontSize: 12,
    fontFamily: 'Montserrat-700',
    color: '#EBEBEB',
  },
  redText: {
    color: CSS.Colors.FAILURE_RED,
  },
})
