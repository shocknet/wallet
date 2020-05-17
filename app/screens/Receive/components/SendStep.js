// @ts-nocheck
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
 * @typedef {ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps} ConnectedRedux
 */

/**
 * @typedef {ConnectedRedux & object} Props
 * @prop {(step: number) => void} setStep
 */

/**
 * @typedef {object} State
 * @prop {string} contactsSearch
 */

/**
 * @augments Component<Props, State, never>
 */
class SendStep extends Component {
  state = {
    contactsSearch: '',
  }

  componentDidMount = async () => {
    const { addInvoice, newAddress, invoice } = this.props
    const { amount, description } = invoice
    await Promise.all([
      addInvoice({
        value: amount,
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

  sendInvoice = async () => {
    const { chat, invoice, navigation } = this.props
    const { selectedContact } = chat
    const { paymentRequest } = invoice
    await API.Actions.sendReqWithInitialMsg(
      selectedContact.pk,
      '$$__SHOCKWALLET__INVOICE__' + paymentRequest,
    )
    navigation.navigate(CHATS_ROUTE)
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
                <Text style={styles.invoiceMode}>BTC</Text>
                <Switch
                  trackColor={{
                    false: CSS.Colors.CAUTION_YELLOW,
                    true: CSS.Colors.BUTTON_BLUE,
                  }}
                  onValueChange={setInvoiceMode}
                  value={invoice.invoiceMode}
                  thumbColor={CSS.Colors.BACKGROUND_WHITE}
                />
                <Text style={styles.invoiceMode}>Invoice</Text>
              </View>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={this.copyQRCode}
              >
                <Text style={styles.modalText}>Copy to clipboard</Text>
                <Ionicons
                  name="ios-copy"
                  size={20}
                  color={CSS.Colors.TEXT_GRAY_LIGHTER}
                  style={styles.modalIcon}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.invoiceDetails}>
              <TouchableOpacity
                style={styles.editInvoiceDetailsContainer}
                onPress={this.props.editInvoice}
              >
                <Text style={styles.editInvoice}>Change</Text>
              </TouchableOpacity>
              <View style={styles.invoiceDetail}>
                <Text style={styles.invoiceDetailTitle}>Amount</Text>
                <Text style={styles.invoiceDetailValue}>
                  {invoice.amount ? invoice.amount : 'N/A'}
                </Text>
              </View>
              <View
                style={[styles.invoiceDetail, styles.noBorderInvoiceDetail]}
              >
                <Text style={styles.invoiceDetailTitle}>Description</Text>
                <Text
                  style={styles.invoiceDetailValue}
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
        invoice.invoiceMode ? (
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
        ) : null}
      </View>
    )
  }
}

/**
 * @param {typeof import('../../../../reducers/index').default} state
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
  modalText: {
    color: CSS.Colors.TEXT_GRAY_LIGHTER,
    fontFamily: 'Montserrat-700',
    fontSize: 13,
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
  invoiceDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: CSS.Colors.BORDER_GRAY,
  },
  invoiceDetailTitle: {
    fontFamily: 'Montserrat-700',
    fontSize: 13,
    color: CSS.Colors.TEXT_GRAY_LIGHTER,
    width: '48%',
  },
  invoiceDetailValue: {
    fontFamily: 'Montserrat-600',
    fontSize: 14,
    color: CSS.Colors.TEXT_GRAY_LIGHTER,
    width: '48%',
    textAlign: 'right',
  },
  swipeBtn: {
    marginVertical: 15,
  },
  swipeBtnText: {
    fontSize: 12,
    fontFamily: 'Montserrat-700',
    color: CSS.Colors.TEXT_GRAY,
  },
})
