/**
 * @format
 */

import React, { Component } from 'react'
import {
  ActivityIndicator,
  Clipboard,
  Dimensions,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableHighlight,
  View,
  Linking,
  ImageBackground,
} from 'react-native'
import EntypoIcons from 'react-native-vector-icons/Entypo'
import { connect } from 'react-redux'
//import { compose } from 'redux'
import { ConnectionContext } from '../../ctx/Connection'
import QRCodeScanner from '../../components/QRScanner'
import Nav from '../../components/Nav'
import wavesBG from '../../assets/images/waves-bg.png'
/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}, Params>} Navigation
 */

import BasicDialog from '../../components/BasicDialog'
import IGDialogBtn from '../../components/IGDialogBtn'
import Pad from '../../components/Pad'
import ShockButton from '../../components/ShockButton'
import ShockDialog from '../../components/ShockDialog'
import ShockInput from '../../components/ShockInput'
import UserDetail from '../../components/UserDetail'

import btcConvert from '../../services/convertBitcoin'
import * as ContactAPI from '../../services/contact-api'
import * as CSS from '../../css'
import * as Wallet from '../../services/wallet'

import { getUSDRate, getWalletBalance } from '../../../actions/WalletActions'
import { fetchNodeInfo } from '../../../actions/NodeActions'
import { fetchRecentTransactions } from '../../../actions/HistoryActions'

import { CHATS_ROUTE } from '../../screens/Chats'

import QR from './QR'
import UnifiedTrx from './UnifiedTrx'

/**
 * @typedef {object} Params
 * @prop {string=} rawInvoice
 * @prop {string|null} recipientDisplayName
 * @prop {string|null} recipientAvatar
 * @prop {string} recipientPublicKey
 */

/**
 * @typedef {ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps} ConnectedRedux
 */

/**
 * @typedef {ConnectedRedux & object} Props
 * @prop {Navigation} navigation
 */

/**
 * @typedef {{ displayName: string|null , avatar: string|null, pk: string }} ShockUser
 */

/**
 * @typedef {object} State
 * @prop {boolean} displayingSendDialog
 * @prop {boolean} displayingSendToBTCDialog
 * @prop {string} sendToBTCAddress
 * @prop {number} sendToBTCAmount
 * @prop {boolean} scanningBTCAddressQR
 * @prop {boolean} displayingSendBTCResultDialog
 * @prop {boolean} sendingBTC True while sending a BTC transaction is in
 * progress.
 * @prop {string|null} sentBTCErr
 * @prop {string} sentBTCTXID Holds the transaction ID after sending BTC.
 *
 * @prop {ShockUser|null} payShockInvoiceUserData
 * @prop {boolean} displayingPayLightningInvoiceDialog
 * @prop {string} lightningInvoiceInput
 * @prop {boolean} scanningLightningInvoiceQR
 * @prop {boolean} displayingConfirmInvoicePaymentDialog
 * @prop {number} invoiceAmt Only asked for if invoice has no amount embedded.
 * @prop {Wallet.DecodeInvoiceResponse|null} decodedInvoice Null when dialog is
 * closed or when fetching it.
 * @prop {boolean} displayingInvoicePaymentResult
 * @prop {boolean} payingInvoice
 * @prop {string} payingInvoiceErr (Empty string default state)
 *
 * @prop {number} createInvoiceAmount
 * @prop {string} createInvoiceMemo
 * @prop {boolean} displayingBTCAddress
 * @prop {boolean} displayingBTCAddressQR
 * @prop {boolean} displayingCreateInvoiceDialog
 * @prop {boolean} displayingCreateInvoiceResultDialog
 * @prop {boolean} displayingInvoiceQR
 * @prop {boolean} displayingOlderFormatBTCAddress
 * @prop {boolean} displayingOlderFormatBTCAddressQR
 * @prop {boolean} displayingReceiveDialog
 * @prop {boolean} fetchingBTCAddress
 * @prop {boolean} fetchingInvoice
 * @prop {boolean} fetchingOlderFormatBTCAddress
 * @prop {string|null} invoice
 * @prop {string|null} receivingOlderFormatBTCAddress
 * @prop {string|null} receivingBTCAddress
 *
 * @prop {boolean} displayingPreShockUserQRScan
 * @prop {boolean} scanningShockUserQR
 * @prop {string|null} QRShockUserInfo
 * @prop {boolean} displayingPostShockUserQRScan
 *
 * @prop {boolean} sendingInvoiceToShockUser
 * @prop {string} sendingInvoiceToShockUserMsg
 */

const { height } = Dimensions.get('window')

export const WALLET_OVERVIEW = 'WALLET_OVERVIEW'

const showCopiedToClipboardToast = () => {
  ToastAndroid.show('Copied to clipboard!', 800)
}

/**
 * @augments Component<Props, State, never>
 */
class WalletOverview extends Component {
  /**
   * @type {import('react-navigation').NavigationBottomTabScreenOptions}
   */
  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => {
      return ((
        <EntypoIcons
          color={tintColor === null ? undefined : tintColor}
          name="wallet"
          // reverseColor={'#CED0CE'}
          size={22}
        />
      ))
    },
  }

  static contextType = ConnectionContext

  /**
   * @type {React.ContextType<typeof ConnectionContext>}
   */
  context = true

  /**
   * @type {State}
   */
  state = {
    displayingSendDialog: false,
    displayingSendToBTCDialog: false,
    sendToBTCAddress: '',
    sendToBTCAmount: 0,
    scanningBTCAddressQR: false,
    displayingSendBTCResultDialog: false,
    sendingBTC: false,
    sentBTCErr: null,
    sentBTCTXID: '',

    payShockInvoiceUserData: null,
    displayingPayLightningInvoiceDialog: false,
    lightningInvoiceInput: '',
    scanningLightningInvoiceQR: false,
    displayingConfirmInvoicePaymentDialog: false,
    invoiceAmt: 0,
    decodedInvoice: null,
    displayingInvoicePaymentResult: false,
    payingInvoice: false,
    payingInvoiceErr: '',

    createInvoiceAmount: 0,
    createInvoiceMemo: '',
    fetchingBTCAddress: false,
    fetchingOlderFormatBTCAddress: false,
    displayingBTCAddress: false,
    displayingBTCAddressQR: false,
    displayingCreateInvoiceDialog: false,
    displayingCreateInvoiceResultDialog: false,
    displayingInvoiceQR: false,
    displayingOlderFormatBTCAddress: false,
    displayingOlderFormatBTCAddressQR: false,
    displayingReceiveDialog: false,
    fetchingInvoice: false,
    invoice: null,
    receivingBTCAddress: null,
    receivingOlderFormatBTCAddress: null,

    displayingPreShockUserQRScan: false,
    scanningShockUserQR: false,
    QRShockUserInfo: null,
    displayingPostShockUserQRScan: false,

    sendingInvoiceToShockUser: false,
    sendingInvoiceToShockUserMsg: '',
  }

  closeAllSendDialogs = () => {
    this.setState({
      displayingSendDialog: false,
      displayingSendToBTCDialog: false,
      displayingSendBTCResultDialog: false,
      sendToBTCAddress: '',
      sendToBTCAmount: 0,
      scanningBTCAddressQR: false,
      sendingBTC: false,
      sentBTCErr: null,
      sentBTCTXID: '',

      payShockInvoiceUserData: null,
      displayingPayLightningInvoiceDialog: false,
      lightningInvoiceInput: '',
      scanningLightningInvoiceQR: false,
      displayingConfirmInvoicePaymentDialog: false,
      invoiceAmt: 0,
      decodedInvoice: null,
      displayingInvoicePaymentResult: false,
      payingInvoice: false,
      payingInvoiceErr: '',
    })
  }

  closeAllReceiveDialogs = () => {
    this.setState({
      createInvoiceAmount: 0,
      createInvoiceMemo: '',
      displayingBTCAddress: false,
      displayingBTCAddressQR: false,
      displayingCreateInvoiceDialog: false,
      displayingCreateInvoiceResultDialog: false,
      displayingOlderFormatBTCAddress: false,
      displayingOlderFormatBTCAddressQR: false,
      displayingInvoiceQR: false,
      displayingReceiveDialog: false,
      fetchingBTCAddress: false,
      fetchingInvoice: false,
      fetchingOlderFormatBTCAddress: false,
      invoice: null,
      receivingBTCAddress: null,
      receivingOlderFormatBTCAddress: null,

      displayingPreShockUserQRScan: false,
      scanningShockUserQR: false,
      QRShockUserInfo: null,
      displayingPostShockUserQRScan: false,

      sendingInvoiceToShockUser: false,
      sendingInvoiceToShockUserMsg: '',
    })
  }

  //////////////////////////////////////////////////////////////////////////////
  copyOlderFormatBTCAddressToClipboard = () => {
    const { receivingOlderFormatBTCAddress } = this.state
    if (receivingOlderFormatBTCAddress === null) {
      console.warn('receivingOlderFormatBTCAddress === null')
      return
    }

    Clipboard.setString(receivingOlderFormatBTCAddress)
    showCopiedToClipboardToast()
  }

  generateOlderFormatBTCAddressQR = () => {
    const { receivingOlderFormatBTCAddress } = this.state

    if (receivingOlderFormatBTCAddress === null) {
      return
    }

    this.setState({
      displayingOlderFormatBTCAddress: false,
      displayingOlderFormatBTCAddressQR: true,
    })
  }

  displayingOlderFormatBTCAddressChoiceToHandlerWhileFetching = {}

  displayingOlderFormatBTCAddressChoiceToHandler = {
    'Copy to Clipboard': this.copyOlderFormatBTCAddressToClipboard,
    'Generate QR': this.generateOlderFormatBTCAddressQR,
  }

  displayOlderFormatBTCAddress = () => {
    this.closeAllReceiveDialogs()

    this.setState(
      {
        fetchingOlderFormatBTCAddress: true,
        displayingOlderFormatBTCAddress: true,
      },
      () => {
        // Check in case dialog was closed before state was updated
        if (!this.state.displayingOlderFormatBTCAddress) {
          return
        }

        Wallet.newAddress(true).then(addr => {
          this.setState(({ displayingOlderFormatBTCAddress }) => {
            // Check in case dialog was closed before completing fetch.
            if (displayingOlderFormatBTCAddress) {
              return {
                fetchingOlderFormatBTCAddress: false,
                receivingOlderFormatBTCAddress: addr,
              }
            }

            return null
          })
        })
      },
    )
  }

  //////////////////////////////////////////////////////////////////////////////

  copyBTCAddressToClipboard = () => {
    const { receivingBTCAddress } = this.state

    if (receivingBTCAddress === null) {
      console.warn('receivingOlderFormatBTCAddress === null')
      return
    }

    Clipboard.setString(receivingBTCAddress)
    showCopiedToClipboardToast()
  }

  generateBTCAddressQR = () => {
    const { receivingBTCAddress } = this.state

    if (receivingBTCAddress === null) {
      return
    }

    this.setState({
      displayingBTCAddress: false,
      displayingBTCAddressQR: true,
    })
  }

  displayingBTCAddressChoiceToHandlerWhileFetching = {
    'Use older format': this.displayOlderFormatBTCAddress,
  }

  displayingBTCAddressChoiceToHandler = {
    'Copy to Clipboard': this.copyBTCAddressToClipboard,
    'Generate QR': this.generateBTCAddressQR,
    'Use older format': this.displayOlderFormatBTCAddress,
  }

  displayBTCAddress = () => {
    this.closeAllReceiveDialogs()

    this.setState(
      {
        fetchingBTCAddress: true,
        displayingBTCAddress: true,
      },
      () => {
        // Check in case dialog was closed before state was updated
        if (!this.state.displayingBTCAddress) {
          return
        }

        Wallet.newAddress(false).then(addr => {
          this.setState(({ displayingBTCAddress }) => {
            // Check in case dialog was closed before completing fetch.
            if (displayingBTCAddress) {
              return {
                fetchingBTCAddress: false,
                receivingBTCAddress: addr,
              }
            }

            return null
          })
        })
      },
    )
  }

  //////////////////////////////////////////////////////////////////////////////

  displayCreateInvoiceDialog = () => {
    this.closeAllReceiveDialogs()
    this.setState({
      displayingCreateInvoiceDialog: true,
    })
  }

  /**
   * @type {import('../../components/ShockInput').Props['onChangeText']}
   */
  createInvoiceDialogAmountOnChange = amount => {
    const numbers = '0123456789'.split('')

    const chars = amount.split('')

    if (!chars.every(c => numbers.includes(c))) {
      return
    }

    this.setState({
      createInvoiceAmount: Number(amount),
    })
  }

  /**
   * @type {import('../../components/ShockInput').Props['onChangeText']}
   */
  createInvoiceDialogMemoOnChange = memo => {
    this.setState({
      createInvoiceMemo: memo,
    })
  }

  copyInvoiceToClipboard = () => {
    const { invoice } = this.state

    if (invoice === null) {
      return
    }

    Clipboard.setString(invoice)
    showCopiedToClipboardToast()
  }

  generateInvoiceQR = () => {
    const { invoice } = this.state

    if (invoice === null) {
      return
    }

    this.setState({
      displayingCreateInvoiceResultDialog: false,
      displayingInvoiceQR: true,
    })
  }

  ///

  sendInvoiceToShockUser = () => {
    this.setState({
      displayingCreateInvoiceResultDialog: false,
      displayingPreShockUserQRScan: true,
    })
  }

  proceedToShockuserQRScan = () => {
    this.setState({
      displayingPreShockUserQRScan: false,
      scanningShockUserQR: true,
    })
  }

  closeShockUserQRScanner = () => {
    this.setState({
      displayingPreShockUserQRScan: true,
      scanningShockUserQR: false,
    })
  }

  getShockUserRawDataFromClipboard = () => {
    Clipboard.getString().then(_data => {
      /** @type {string} */
      const pk = _data.slice('$$__SHOCKWALLET__USER__'.length)

      this.setState({
        displayingPreShockUserQRScan: false,
        displayingPostShockUserQRScan: true,
        QRShockUserInfo: pk,
      })
    })
  }

  preQRScanDialogChoiceToHandler = {
    Proceed: this.proceedToShockuserQRScan,
    'Get raw data from clipboard': this.getShockUserRawDataFromClipboard,
  }

  /**
   * @param {{ data: any }} e
   */
  onSuccessfulShockUserQRScan = e => {
    this.setState({
      scanningShockUserQR: false,
    })

    /** @type {string} */
    const pk = e.data.slice('$$__SHOCKWALLET__USER__'.length)

    this.setState({
      displayingPostShockUserQRScan: true,
      scanningShockUserQR: false,
      QRShockUserInfo: pk,
    })
  }

  confirmSendToShockUser = () => {
    const { invoice, QRShockUserInfo } = this.state

    if (QRShockUserInfo === null) {
      console.warn('QRShockUserInfo === null')
      return
    }

    if (invoice === null) {
      console.warn('invoice === null')
      return
    }

    this.setState({
      displayingPostShockUserQRScan: false,
      sendingInvoiceToShockUser: true,
    })

    const requestSending = ContactAPI.Actions.sendReqWithInitialMsg(
      QRShockUserInfo,
      '$$__SHOCKWALLET__INVOICE__' + invoice,
    )

    const timeout = new Promise(res => {
      setTimeout(res, 10000)
    })

    Promise.race([requestSending, timeout])
      .then(() => {
        this.closeAllReceiveDialogs()

        this.props.navigation.navigate(CHATS_ROUTE)
      })
      .catch(e => {
        this.setState({
          sendingInvoiceToShockUser: false,
          sendingInvoiceToShockUserMsg: e.message,
        })
      })
  }

  ///

  invoiceResultDialogChoiceToHandler = {
    'Copy to Clipboard': this.copyInvoiceToClipboard,
    'Generate QR': this.generateInvoiceQR,
    'Send to Shock Network User': this.sendInvoiceToShockUser,
  }

  onPressCreateInvoice = () => {
    if (this.state.createInvoiceAmount === 0) {
      return
    }

    this.closeAllReceiveDialogs()

    this.setState(
      {
        // eslint-disable-next-line react/no-access-state-in-setstate
        createInvoiceMemo: this.state.createInvoiceMemo,
        // eslint-disable-next-line react/no-access-state-in-setstate
        createInvoiceAmount: this.state.createInvoiceAmount,
        displayingCreateInvoiceResultDialog: true,
        fetchingInvoice: true,
      },
      () => {
        // Check in case dialog was closed before state was updated
        if (!this.state.displayingCreateInvoiceResultDialog) {
          return
        }

        Wallet.addInvoice({
          value: this.state.createInvoiceAmount,
          memo: this.state.createInvoiceMemo,
          expiry: 1800,
        }).then(res => {
          this.setState(({ displayingCreateInvoiceResultDialog }) => {
            // Check in case dialog was closed before completing fetch.
            if (displayingCreateInvoiceResultDialog) {
              return {
                fetchingInvoice: false,
                invoice: res.payment_request,
              }
            }

            return null
          })
        })
      },
    )
  }

  //////////////////////////////////////////////////////////////////////////////
  // SEND BTC //////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  /**
   * @param {null|{address : null|string,amount :null|number}} destination
   */
  sendToBTCAddress = destination => {
    this.closeAllSendDialogs()
    if (destination) {
      this.setState({
        displayingSendToBTCDialog: true,
        sendToBTCAddress: destination.address ? destination.address : '',
        sendToBTCAmount: destination.amount ? destination.amount : 0,
      })
    } else {
      this.setState({
        displayingSendToBTCDialog: true,
      })
    }
  }

  onPressSend = () => {
    const { totalBalance } = this.props

    if (totalBalance === null) {
      return
    }

    this.setState({
      displayingSendDialog: true,
    })
  }

  /**
   * @param {string} addr
   */
  onChangeSendBTCAddress = addr => {
    this.setState({
      sendToBTCAddress: addr,
    })
  }

  /**
   * @param {string} amount
   */
  onChangeSendBTCAmount = amount => {
    const numbers = '0123456789'.split('')

    const chars = amount.split('')

    if (!chars.every(c => numbers.includes(c))) {
      return
    }

    this.setState({
      sendToBTCAmount: Number(amount),
    })
  }

  onPressSendBTCScanQR = () => {
    this.setState({
      displayingSendToBTCDialog: false,
      scanningBTCAddressQR: true,
    })
  }

  closeBTCQRScanner = () => {
    this.setState({
      displayingSendToBTCDialog: true,
      scanningBTCAddressQR: false,
    })
  }

  /**
   * @param {{ data: any }} e
   */
  onSuccessfulBTCQRScan = e => {
    this.setState({
      scanningBTCAddressQR: false,
      displayingSendToBTCDialog: true,
      sendToBTCAddress: e.data,
    })
  }

  onPressSendBTC = () => {
    const { sendToBTCAddress } = this.state

    if (sendToBTCAddress.length === 0) {
      return
    }

    this.setState(
      {
        displayingSendToBTCDialog: false,
        displayingSendBTCResultDialog: true,
        sendingBTC: true,
      },
      () => {
        // Check in case dialog was closed before state was updated
        if (!this.state.displayingSendBTCResultDialog) {
          return
        }

        Wallet.sendCoins({
          addr: this.state.sendToBTCAddress,
          amount: this.state.sendToBTCAmount,
        })
          .then(txid => {
            // Check in case dialog was closed before completing fetch.
            if (!this.state.displayingSendBTCResultDialog) {
              return
            }

            this.setState({
              sendingBTC: false,
              sentBTCTXID: txid,
            })
          })
          .catch(e => {
            this.setState({
              sendingBTC: false,
              sentBTCErr: e.message,
            })
          })
      },
    )
  }

  goBackFromSentBTCResultDialog = () => {
    this.setState({
      displayingSendToBTCDialog: true,
      displayingSendBTCResultDialog: false,
    })
  }

  sentBTCResultChoiceToHandler = {
    'View in BlockChain': () => {
      Linking.openURL(`https://blockstream.info/tx/${this.state.sentBTCTXID}`)
    },
    'Copy Transaction ID to Clipboard': () => {
      Clipboard.setString(this.state.sentBTCTXID)

      showCopiedToClipboardToast()
    },
    Ok: () => {
      this.closeAllSendDialogs()
    },
  }

  sentBTCErrChoiceToHandler = {
    Ok: this.goBackFromSentBTCResultDialog,
  }

  //////////////////////////////////////////////////////////////////////////////
  // /SEND BTC /////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////
  // PAY INVOICE ///////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  /**
   * @param {null|{invoice : null|string}} destination
   */
  payLightningInvoice = destination => {
    this.closeAllSendDialogs()
    if (destination) {
      this.setState({
        displayingPayLightningInvoiceDialog: true,
        lightningInvoiceInput: destination.invoice ? destination.invoice : '',
      })
    } else {
      this.setState({
        displayingPayLightningInvoiceDialog: true,
      })
    }
  }

  /**
   * @param {string} invoice
   */
  onChangeLightningInvoice = invoice => {
    this.setState({
      lightningInvoiceInput: invoice,
    })
  }

  closeLightningInvoiceQRScanner = () => {
    this.setState({
      scanningLightningInvoiceQR: false,
    })
  }

  onPressScanLightningInvoiceQR = () => {
    this.setState({
      scanningLightningInvoiceQR: true,
    })
  }

  /**
   * @param {{ data: any }} e
   */
  onSuccessfulInvoiceQRScan = e => {
    this.setState({
      scanningLightningInvoiceQR: false,
      lightningInvoiceInput: e.data,
    })
  }

  onPressPayLightningInvoice = () => {
    const { lightningInvoiceInput } = this.state

    if (lightningInvoiceInput.length === 0) {
      return
    }

    this.setState(
      {
        displayingPayLightningInvoiceDialog: false,
        displayingConfirmInvoicePaymentDialog: true,
      },
      () => {
        const { lightningInvoiceInput } = this.state

        Wallet.decodeInvoice({ payReq: lightningInvoiceInput })
          .then(decodedInvoice => {
            if (!this.state.displayingConfirmInvoicePaymentDialog) {
              return
            }
            this.setState({
              decodedInvoice,
            })
          })
          .catch(err => {
            this.closeAllSendDialogs()
            this.setState({
              displayingInvoicePaymentResult: true,
              payingInvoiceErr: err.message,
            })
          })
      },
    )
  }

  /**
   * @param {string} amt
   */
  onChangeInvoiceAmt = amt => {
    const numbers = '0123456789'.split('')

    const chars = amt.split('')

    if (!chars.every(c => numbers.includes(c))) {
      return
    }

    this.setState({
      invoiceAmt: Number(amt),
    })
  }

  confirmInvoicePayment = () => {
    this.setState(
      {
        displayingConfirmInvoicePaymentDialog: false,
        displayingInvoicePaymentResult: true,
        payingInvoice: true,
      },
      () => {
        const {
          decodedInvoice: decodedInvoiceRes,
          invoiceAmt,
          lightningInvoiceInput,
        } = this.state

        if (decodedInvoiceRes === null) {
          console.warn('decodedInvoice === null')
          return
        }

        const decodedInvoice = decodedInvoiceRes.decodedRequest

        const zeroInvoice = decodedInvoice.num_satoshis === '0'

        const payReqParam = this.props.navigation.getParam('rawInvoice')

        const payreq = payReqParam || lightningInvoiceInput

        Wallet.CAUTION_payInvoice({
          amt: zeroInvoice ? invoiceAmt : undefined,
          payreq,
        })
          .then(() => {
            this.setState({
              payingInvoiceErr: '',
            })
          })
          .catch(err => {
            if (!this.state.displayingInvoicePaymentResult) {
              return
            }

            this.setState({
              payingInvoiceErr: err.message,
            })
          })
          .finally(() => {
            this.setState({
              payingInvoice: false,
            })
          })
      },
    )
  }

  /**
   * @param {Wallet.DecodeInvoiceResponse['decodedRequest']} decodedInvoice
   * @returns {JSX.Element}
   */
  renderConfirmInvoiceDialog(decodedInvoice) {
    const { invoiceAmt, payShockInvoiceUserData } = this.state

    const zeroInvoice = decodedInvoice.num_satoshis === '0'

    return (
      <View>
        {zeroInvoice && (
          <React.Fragment>
            <Text>
              This invoice doesn't have an amount embedded in it. Enter the
              amount to be paid.
            </Text>
            <ShockInput
              keyboardType="number-pad"
              onChangeText={this.onChangeInvoiceAmt}
              placeholder="Amount in sats."
              value={invoiceAmt.toString()}
            />
          </React.Fragment>
        )}

        <Pad amount={10} />

        {!zeroInvoice && (
          <Text>{`Amount: ${decodedInvoice.num_satoshis}`}</Text>
        )}

        <Pad amount={10} />

        {payShockInvoiceUserData && (
          <React.Fragment>
            <UserDetail
              image={payShockInvoiceUserData.avatar}
              name={
                payShockInvoiceUserData.displayName ||
                payShockInvoiceUserData.pk
              }
              id={payShockInvoiceUserData.pk}
              lowerText="ShockWallet user"
            />

            <Pad amount={10} />
          </React.Fragment>
        )}

        <ShockButton
          disabled={zeroInvoice ? invoiceAmt === 0 : false}
          onPress={this.confirmInvoicePayment}
          title="PAY"
        />
      </View>
    )
  }

  //////////////////////////////////////////////////////////////////////////////
  /// PAY INVOICE //////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  sendChoiceToHandler = {
    'Send to BTC Address': this.sendToBTCAddress,
    'Pay Lightning Invoice': this.payLightningInvoice,
  }

  receiveDialogChoiceToHandler = {
    'BTC Address': this.displayBTCAddress,
    'Generate a Lightning Invoice': this.displayCreateInvoiceDialog,
  }

  /** @type {null|ReturnType<typeof setInterval>} */
  balanceIntervalID = null

  /** @type {null|ReturnType<typeof setInterval>} */
  exchangeRateIntervalID = null

  /** @type {null|ReturnType<typeof setInterval>} */
  recentTransactionsIntervalID = null

  /**
   * @param {Props} prevProps
   */
  componentDidUpdate(prevProps) {
    if (
      prevProps.navigation.state.params === this.props.navigation.state.params
    ) {
      return
    }

    const newParams = /** @type {Required<Params>} */ (this.props.navigation
      .state.params)

    this.setState(
      {
        displayingConfirmInvoicePaymentDialog: true,
        payShockInvoiceUserData: {
          avatar: newParams.recipientAvatar,
          displayName: null, //newParams.recipientDisplayName,
          pk: newParams.recipientPublicKey,
        },
      },
      () => {
        Wallet.decodeInvoice({ payReq: newParams.rawInvoice })
          .then(decodedInvoice => {
            if (!this.state.displayingConfirmInvoicePaymentDialog) {
              return
            }
            this.setState({
              decodedInvoice,
            })
          })
          .catch(err => {
            this.closeAllSendDialogs()
            this.setState({
              displayingInvoicePaymentResult: true,
              payingInvoiceErr: err.message,
            })
          })
      },
    )
  }

  /**
   * @param {{url: string}} event
   */
  _handleOpenURL = event => {
    /**
     * @param {string} url
     */
    const middle = url => {
      //const url = event.url
      console.log(url)
      const protocol = url.split(':')
      if (
        protocol.length !== 2 ||
        (protocol[0] !== 'bitcoin' && protocol[0] !== 'lightning')
      ) {
        console.log('invalid url: ' + url)
        return
      }
      const details = protocol[1].split('?amount=')
      console.log(details)
      const hasDetails = details.length > 1
      if (protocol[0] === 'bitcoin') {
        this.sendToBTCAddress({
          address: details[0],
          amount: hasDetails ? Number(details[1]) * 100000000 : 0,
        })
      }
      if (protocol[0] === 'lightning') {
        //lightningInvoiceInput
        this.payLightningInvoice({ invoice: details[0] })
      }
    }
    middle(event.url)
  }

  componentDidMount() {
    const { fetchNodeInfo } = this.props
    Linking.addEventListener('url', this._handleOpenURL)
    Linking.getInitialURL()
      .then(url => {
        if (url) {
          console.log('Initial url is: ' + url)
          this._handleOpenURL({ url })
        }
      })
      .catch(err => console.error('An error occurred', err))

    this.fetchBalance()
    this.fetchExchangeRate()
    this.fetchRecentTransactions()
    fetchNodeInfo()
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this._handleOpenURL)

    if (this.balanceIntervalID) {
      clearInterval(this.balanceIntervalID)
    }

    if (this.exchangeRateIntervalID) {
      clearInterval(this.exchangeRateIntervalID)
    }

    if (this.recentTransactionsIntervalID) {
      clearInterval(this.recentTransactionsIntervalID)
    }
  }

  /**
   * Promisified setTimeout
   * @param {number} ms
   */
  wait = ms =>
    new Promise(resolve => {
      /**
       * Timeout ID
       * @type {number}
       */
      const timeout = setTimeout(() => resolve(timeout), ms)
    })

  fetchRecentTransactions = async () => {
    const { fetchRecentTransactions } = this.props
    await fetchRecentTransactions()
    await this.wait(4000)
    this.fetchRecentTransactions()
  }

  fetchBalance = async () => {
    const { getWalletBalance } = this.props
    await getWalletBalance()
    await this.wait(4000)
    this.fetchBalance()
  }

  fetchExchangeRate = async () => {
    const { getUSDRate } = this.props
    await getUSDRate()
  }

  onPressRequest = () => {
    const { totalBalance } = this.props.wallet

    if (totalBalance === null) {
      return
    }

    this.setState({
      displayingReceiveDialog: true,
    })
  }

  renderBalance = () => {
    const { USDRate, totalBalance } = this.props.wallet
    /** @type {boolean} */
    const isConnected = this.context
    const convertedBalance = (
      Math.round(btcConvert(totalBalance, 'Satoshi', 'BTC') * USDRate * 100) /
      100
    )
      .toFixed(2)
      .toString()

    if (totalBalance === null) {
      return (
        <View>
          <ActivityIndicator size="large" />
        </View>
      )
    }

    return (
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceTitle}>Total Balance</Text>
        <Text
          style={[
            styles.balanceValueContainer,
            !isConnected && styles.yellowText,
          ]}
        >
          <Text style={styles.balanceValue}>{convertedBalance}</Text>{' '}
          <Text style={styles.balanceCurrency}>Sats</Text>
        </Text>
        <Text
          style={[styles.balanceUSDValue, !isConnected && styles.yellowText]}
        >
          {USDRate === null ? 'Loading...' : `${convertedBalance} USD`}
        </Text>
      </View>
    )
  }

  render() {
    const {
      createInvoiceAmount,
      createInvoiceMemo,

      displayingSendDialog,

      displayingSendToBTCDialog,
      displayingSendBTCResultDialog,
      sendToBTCAddress,
      scanningBTCAddressQR,
      sendingBTC,
      sendToBTCAmount,
      sentBTCErr,

      displayingPayLightningInvoiceDialog,
      lightningInvoiceInput,
      scanningLightningInvoiceQR,
      displayingConfirmInvoicePaymentDialog,
      decodedInvoice,
      payingInvoice,
      displayingInvoicePaymentResult,
      payingInvoiceErr,

      displayingBTCAddress,
      displayingBTCAddressQR,
      displayingReceiveDialog,
      displayingCreateInvoiceDialog,
      displayingCreateInvoiceResultDialog,
      displayingInvoiceQR,
      displayingOlderFormatBTCAddress,
      displayingOlderFormatBTCAddressQR,
      fetchingBTCAddress,
      fetchingInvoice,
      fetchingOlderFormatBTCAddress,
      invoice,
      receivingBTCAddress,
      receivingOlderFormatBTCAddress,

      displayingPreShockUserQRScan,
      scanningShockUserQR,
      QRShockUserInfo,
      displayingPostShockUserQRScan,

      sendingInvoiceToShockUser,
      sendingInvoiceToShockUserMsg,
    } = this.state

    const { nodeInfo } = this.props.node

    const { recentTransactions } = this.props.history

    if (scanningBTCAddressQR) {
      return (
        <QRCodeScanner
          onRead={this.onSuccessfulBTCQRScan}
          onRequestClose={this.closeBTCQRScanner}
        />
      )
    }

    if (scanningLightningInvoiceQR) {
      return (
        <QRCodeScanner
          onRead={this.onSuccessfulInvoiceQRScan}
          onRequestClose={this.closeLightningInvoiceQRScanner}
        />
      )
    }

    if (scanningShockUserQR) {
      return (
        <QRCodeScanner
          onRead={this.onSuccessfulShockUserQRScan}
          onRequestClose={this.closeShockUserQRScanner}
        />
      )
    }

    return (
      <View style={styles.container}>
        <ImageBackground
          source={wavesBG}
          resizeMode="cover"
          style={styles.overview}
        >
          <Nav title="Wallet" />
          {this.renderBalance()}
        </ImageBackground>
        {nodeInfo.testnet ? (
          <Text style={styles.networkNotice}>
            You are using Testnet network
          </Text>
        ) : null}
        <View style={styles.actionButtons}>
          <TouchableHighlight
            underlayColor="transparent"
            onPress={this.onPressSend}
            style={styles.actionButton}
          >
            <Text style={styles.actionButtonText}>Send</Text>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor="transparent"
            onPress={this.onPressRequest}
            style={[
              styles.actionButton,
              { backgroundColor: CSS.Colors.FUN_BLUE },
            ]}
          >
            <Text style={styles.actionButtonText}>Request</Text>
          </TouchableHighlight>
        </View>

        <View style={styles.trxContainer}>
          <UnifiedTrx unifiedTrx={recentTransactions} />
        </View>
        <ShockDialog
          choiceToHandler={this.receiveDialogChoiceToHandler}
          onRequestClose={this.closeAllReceiveDialogs}
          visible={displayingReceiveDialog}
        />

        <ShockDialog
          choiceToHandler={
            fetchingBTCAddress
              ? this.displayingBTCAddressChoiceToHandlerWhileFetching
              : this.displayingBTCAddressChoiceToHandler
          }
          message={fetchingBTCAddress ? 'Processing...' : receivingBTCAddress}
          onRequestClose={this.closeAllReceiveDialogs}
          visible={displayingBTCAddress}
        />

        <BasicDialog
          onRequestClose={this.closeAllReceiveDialogs}
          visible={displayingBTCAddressQR}
        >
          <View style={styles.alignItemsCenter}>
            <QR
              logoToShow="btc"
              value={/** @type {string} */ (receivingBTCAddress)}
            />
            <Pad amount={10} />
            <Text>Scan To Send To This BTC Address</Text>
          </View>
        </BasicDialog>

        <ShockDialog
          choiceToHandler={
            fetchingOlderFormatBTCAddress
              ? this.displayingOlderFormatBTCAddressChoiceToHandlerWhileFetching
              : this.displayingOlderFormatBTCAddressChoiceToHandler
          }
          message={
            fetchingOlderFormatBTCAddress
              ? 'Processing...'
              : receivingOlderFormatBTCAddress
          }
          onRequestClose={this.closeAllReceiveDialogs}
          visible={displayingOlderFormatBTCAddress}
        />

        <BasicDialog
          onRequestClose={this.closeAllReceiveDialogs}
          visible={displayingOlderFormatBTCAddressQR}
        >
          <View style={styles.alignItemsCenter}>
            <QR
              logoToShow="btc"
              value={/** @type {string} */ (receivingOlderFormatBTCAddress)}
            />
            <Pad amount={10} />
            <Text>Scan To Send To This BTC Address</Text>
          </View>
        </BasicDialog>

        <BasicDialog
          title="Create a Lightning Invoice"
          onRequestClose={this.closeAllReceiveDialogs}
          visible={displayingCreateInvoiceDialog}
        >
          <ShockInput
            placeholder="Memo (optional)"
            onChangeText={this.createInvoiceDialogMemoOnChange}
            value={createInvoiceMemo}
          />

          <Pad amount={10} />

          <ShockInput
            keyboardType="number-pad"
            onChangeText={this.createInvoiceDialogAmountOnChange}
            placeholder="Amount (in sats)"
            value={
              createInvoiceAmount === 0
                ? undefined // allow placeholder to show
                : createInvoiceAmount.toString()
            }
          />

          <Pad amount={10} />

          <Text>Invoice will expire in 30min.</Text>

          <Pad amount={10} />

          <ShockButton
            disabled={createInvoiceAmount === 0}
            onPress={this.onPressCreateInvoice}
            title="Create"
          />
        </BasicDialog>

        <BasicDialog
          onRequestClose={this.closeAllReceiveDialogs}
          visible={displayingInvoiceQR}
        >
          <View style={styles.alignItemsCenter}>
            <QR logoToShow="shock" value={/** @type {string} */ (invoice)} />
            <Pad amount={10} />
            <Text>Scan To Pay This invoice</Text>
          </View>
        </BasicDialog>

        <ShockDialog
          choiceToHandler={
            fetchingInvoice
              ? undefined
              : this.invoiceResultDialogChoiceToHandler
          }
          message={fetchingInvoice ? 'Processing...' : invoice}
          onRequestClose={this.closeAllReceiveDialogs}
          visible={displayingCreateInvoiceResultDialog}
        />

        {/* SEND */}
        <ShockDialog
          choiceToHandler={this.sendChoiceToHandler}
          onRequestClose={this.closeAllSendDialogs}
          visible={displayingSendDialog}
        />
        {/* /SEND */}

        <BasicDialog
          onRequestClose={this.closeAllSendDialogs}
          visible={displayingSendToBTCDialog}
        >
          <View>
            <ShockInput
              placeholder="BTC Address"
              onChangeText={this.onChangeSendBTCAddress}
              value={sendToBTCAddress}
            />

            <Pad amount={10} />

            <ShockInput
              keyboardType="number-pad"
              onChangeText={this.onChangeSendBTCAmount}
              placeholder="Amount in Sats"
              value={
                sendToBTCAmount === 0 ? undefined : sendToBTCAmount.toString()
              }
            />

            <Pad amount={10} />

            <IGDialogBtn onPress={this.onPressSendBTCScanQR} title="Scan QR" />

            <IGDialogBtn
              disabled={sendToBTCAddress.length === 0 || sendToBTCAmount === 0}
              onPress={this.onPressSendBTC}
              title="Send"
            />
          </View>
        </BasicDialog>

        <ShockDialog
          message={(() => {
            if (sendingBTC) {
              return 'Processing...'
            }

            if (sentBTCErr !== null) {
              return `Error: ${sentBTCErr}`
            }

            return 'Payment Sent'
          })()}
          choiceToHandler={(() => {
            if (sendingBTC) {
              return EMPTY_OBJECT
            }

            if (sentBTCErr === null) {
              return this.sentBTCResultChoiceToHandler
            }

            return this.sentBTCErrChoiceToHandler
          })()}
          onRequestClose={
            sentBTCErr === null
              ? this.closeAllSendDialogs
              : this.goBackFromSentBTCResultDialog
          }
          visible={displayingSendBTCResultDialog}
        />

        <BasicDialog
          onRequestClose={this.closeAllSendDialogs}
          visible={displayingPayLightningInvoiceDialog}
        >
          <View>
            <ShockInput
              placeholder="Paste or type lightning invoice here"
              onChangeText={this.onChangeLightningInvoice}
              value={lightningInvoiceInput}
            />

            <IGDialogBtn
              onPress={this.onPressScanLightningInvoiceQR}
              title="Scan QR"
            />

            <IGDialogBtn
              onPress={this.onPressPayLightningInvoice}
              title="Pay"
            />
          </View>
        </BasicDialog>

        <BasicDialog
          onRequestClose={this.closeAllSendDialogs}
          title="Pay Invoice"
          visible={displayingConfirmInvoicePaymentDialog}
        >
          <View>
            {decodedInvoice === null ? (
              <ActivityIndicator />
            ) : (
              this.renderConfirmInvoiceDialog(decodedInvoice.decodedRequest)
            )}
          </View>
        </BasicDialog>

        <BasicDialog
          onRequestClose={this.closeAllSendDialogs}
          title={(() => {
            if (payingInvoice) {
              return 'Processing...'
            }

            if (payingInvoiceErr) {
              return 'Error'
            }

            if (displayingInvoicePaymentResult) {
              console.warn('invalid state for paying invoice result dialog')
            }
            return ''
          })()}
          visible={displayingInvoicePaymentResult}
        >
          {payingInvoice ? (
            <ActivityIndicator />
          ) : (
            <View style={styles.alignItemsCenter}>
              {payingInvoiceErr ? (
                <Text>{payingInvoiceErr}</Text>
              ) : (
                <EntypoIcons size={22} color="#2E4674" name="check" />
              )}
            </View>
          )}
        </BasicDialog>

        <ShockDialog
          choiceToHandler={this.preQRScanDialogChoiceToHandler}
          message="Tell the other user to open up their profile, generate a handshake address then scan their QR or send you their raw data"
          onRequestClose={this.closeAllReceiveDialogs}
          visible={displayingPreShockUserQRScan}
        />

        <BasicDialog
          visible={displayingPostShockUserQRScan}
          onRequestClose={this.closeAllReceiveDialogs}
          title="Confirm"
        >
          <View style={[styles.alignItemsCenter, CSS.styles.width100]}>
            <Text>Sending an Invoice To: </Text>

            <Pad amount={10} />

            {QRShockUserInfo && <Text>{QRShockUserInfo}</Text>}

            <Pad amount={10} />

            {createInvoiceAmount === 0 ? null : (
              <Text>{`For an amount of: ${createInvoiceAmount} sats`}</Text>
            )}

            <ShockButton title="SEND" onPress={this.confirmSendToShockUser} />
          </View>
        </BasicDialog>

        <ShockDialog
          visible={sendingInvoiceToShockUser || !!sendingInvoiceToShockUserMsg}
          onRequestClose={this.closeAllReceiveDialogs}
          message={
            sendingInvoiceToShockUser
              ? 'Sending...'
              : sendingInvoiceToShockUserMsg
          }
          choiceToHandler={
            sendingInvoiceToShockUser
              ? {}
              : {
                  OK: this.closeAllReceiveDialogs,
                }
          }
        />
      </View>
    )
  }
}

/**
 * @param {typeof import('../../../reducers/index').default} state
 */
const mapStateToProps = ({ wallet, history, node }) => ({
  wallet,
  history,
  node,
})

const mapDispatchToProps = {
  getUSDRate,
  getWalletBalance,
  fetchRecentTransactions,
  fetchNodeInfo,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(WalletOverview)

const styles = StyleSheet.create({
  alignItemsCenter: {
    alignItems: 'center',
  },
  networkNotice: {
    backgroundColor: CSS.Colors.BACKGROUND_RED,
    width: '100%',
    height: 30,
    fontSize: 11,
    fontFamily: 'Montserrat-700',
    textAlignVertical: 'center',
    paddingHorizontal: 25,
    color: CSS.Colors.TEXT_WHITE,
  },
  balanceContainer: {
    marginHorizontal: 50,
    marginVertical: 32,
    marginBottom: 57,
  },
  balanceTitle: {
    fontFamily: 'Montserrat-700',
    fontSize: 15,
    marginBottom: 5,
    color: CSS.Colors.TEXT_WHITE,
  },
  balanceValueContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    marginBottom: 5,
  },
  balanceValue: {
    fontSize: 25,
    fontFamily: 'Montserrat-900',
    color: CSS.Colors.TEXT_WHITE,
  },
  balanceCurrency: {
    fontSize: 12,
    fontFamily: 'Montserrat-700',
    color: CSS.Colors.TEXT_WHITE,
  },
  balanceUSDValue: {
    fontSize: 14,
    fontFamily: 'Montserrat-600',
    color: CSS.Colors.TEXT_ORANGE,
  },
  container: {
    backgroundColor: CSS.Colors.BACKGROUND_WHITE,
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    margin: 0,
  },
  overview: {
    width: '100%',
    backgroundColor: CSS.Colors.FUN_BLUE,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 25,
    marginTop: 36,
    marginBottom: 36,
  },
  actionButton: {
    width: '45%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    backgroundColor: CSS.Colors.ORANGE,
  },
  actionButtonText: {
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-700',
  },
  trxContainer: {
    backgroundColor: CSS.Colors.BACKGROUND_WHITE,
    height,
    flex: 1,
    width: '100%',
    paddingHorizontal: 30,
  },
  yellowText: {
    color: CSS.Colors.CAUTION_YELLOW,
  },
})

const EMPTY_OBJECT = {}
