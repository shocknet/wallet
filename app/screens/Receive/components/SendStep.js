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
} from 'react-native'
import { connect } from 'react-redux'
import Ionicons from 'react-native-vector-icons/Ionicons'
// @ts-ignore
import SwipeVerify from 'react-native-swipe-verify'

// import Suggestion from '../../../components/Search/Suggestion'
import * as CSS from '../../../res/css'
// import ContactsSearch from '../../../components/Search/ContactsSearch'
import InputGroup from '../../../components/InputGroup'
import {
  setInvoiceMode,
  addInvoice,
  setRecipientAddress,
} from '../../../actions/InvoiceActions'
import QR from './QR'
import BitcoinAccepted from '../../../assets/images/bitcoin-accepted.png'

/**
 * @typedef {ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps} ConnectedRedux
 */

/**
 * @typedef {ConnectedRedux & object} Props
 * @prop {(step: number) => void} setStep
 */

/**
 * @augments Component<Props, {}, never>
 */
class SendStep extends Component {
  componentDidMount = async () => {
    const { addInvoice, invoice } = this.props
    const { amount, description } = invoice
    await addInvoice({
      value: amount,
      memo: description,
      expiry: 1800,
    })
  }

  renderQR = () => {
    const { invoiceMode, paymentRequest, recipientAddress } = this.props.invoice
    if (invoiceMode && paymentRequest) {
      return <QR logoToShow="shock" value={paymentRequest} size={150} />
    }

    if (!invoiceMode && recipientAddress) {
      return <QR logoToShow="btc" value={recipientAddress} size={150} />
    }

    if (!invoiceMode && !recipientAddress) {
      return (
        <Text style={styles.recipientEmpty}>
          Please write a recipient address
        </Text>
      )
    }

    return <ActivityIndicator size="large" color={CSS.Colors.FUN_BLUE} />
  }

  copyQRCode = () => {
    const { invoiceMode, paymentRequest, recipientAddress } = this.props.invoice
    Clipboard.setString(invoiceMode ? paymentRequest : recipientAddress)
    ToastAndroid.show('Copied!', 500)
  }

  render() {
    const { setInvoiceMode, invoice, setRecipientAddress } = this.props
    return (
      <View style={styles.invoiceContainer}>
        <View style={styles.invoiceInfoContainer}>
          {/* 
          // Reserved for contacts functionality on API
          <ContactsSearch />
          <Suggestion name="Test Contact" style={{ marginVertical: 10 }} /> 
        */}
          <View style={styles.recipientContainer}>
            <InputGroup
              inputStyle={styles.recipientInput}
              style={styles.recipientInputContainer}
              placeholder="Recipient Address"
              onChange={setRecipientAddress}
              value={invoice.recipientAddress}
            />
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
        </View>
        <SwipeVerify
          width="100%"
          buttonSize={48}
          height={40}
          style={styles.swipeBtn}
          buttonColor={CSS.Colors.BACKGROUND_WHITE}
          borderColor={CSS.Colors.TRANSPARENT}
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
        >
          <Text style={styles.swipeBtnText}>SLIDE TO SEND</Text>
        </SwipeVerify>
      </View>
    )
  }
}

/**
 * @param {typeof import('../../../../reducers/index').default} state
 */
const mapStateToProps = ({ invoice }) => ({ invoice })

const mapDispatchToProps = {
  setInvoiceMode,
  setRecipientAddress,
  addInvoice,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SendStep)

const styles = StyleSheet.create({
  noBorderInvoiceDetail: {
    borderBottomWidth: 0,
  },
  invoiceContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  invoiceInfoContainer: {
    width: '100%',
    alignItems: 'center',
  },
  recipientContainer: {
    width: '95%',
    alignItems: 'center',
  },
  recipientInput: {
    height: 36,
    backgroundColor: CSS.Colors.BACKGROUND_WHITE,
  },
  recipientInputContainer: {
    marginBottom: 28,
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
  recipientEmpty: {
    fontSize: 12,
    fontFamily: 'Montserrat-700',
    color: CSS.Colors.TEXT_GRAY_LIGHTER,
    textAlign: 'center',
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
    marginBottom: 10,
  },
  swipeBtnText: {
    fontSize: 12,
    fontFamily: 'Montserrat-700',
    color: CSS.Colors.TEXT_GRAY,
  },
})
