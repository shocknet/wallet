/**
 * @prettier
 */
import React from 'react'
import { ToastAndroid, StyleSheet } from 'react-native'
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons'
/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}, Params>} Navigation
 */

import * as API from '../../services/contact-api'
import * as Wallet from '../../services/wallet'
import { Colors } from '../../css'

import { WALLET_OVERVIEW } from '../WalletOverview'
/**
 * @typedef {import('../WalletOverview').Params} WalletOverviewParams
 */

import ChatView from './View'

export const CHAT_ROUTE = 'CHAT_ROUTE'

const sendInvoiceIconStyle = StyleSheet.create({
  // eslint-disable-next-line react-native/no-unused-styles
  s: { marginRight: 16 },
}).s

/**
 * @typedef {object} Params
 * @prop {string} recipientPublicKey
 * @prop {string=} _title Do not pass this param.
 * @prop {(() => void)=} _onPressSendInvoice Do not pass this param.
 */

/**
 * @typedef {object} Props
 * @prop {Navigation} navigation
 */

/**
 * @typedef {import('./View').PaymentStatus} PaymentStatus
 */

/**
 * Both outgoing and incoming invoices.
 * @typedef {object} DecodedInvoice
 * @prop {number} amount
 * @prop {number} expiryDate UNIX time.
 */

/**
 * @typedef {object} State
 * @prop {API.Schema.ChatMessage[]} messages
 * @prop {string|null} ownDisplayName
 * @prop {string|null} ownPublicKey
 * @prop {Partial<Record<string, PaymentStatus>>} rawInvoiceToPaymentStatus
 * @prop {Partial<Record<string, DecodedInvoice>>} rawInvoiceToDecodedInvoice
 * @prop {string|null} recipientDisplayName
 *
 * @prop {boolean} sendingInvoice True when showing the send invoice dialog.
 */

/**
 * @augments React.PureComponent<Props, State>
 */
export default class Chat extends React.PureComponent {
  /**
   * @param {{ navigation: Navigation }} args
   * @returns {import('react-navigation').NavigationStackScreenOptions}
   */
  static navigationOptions = ({ navigation }) => {
    const title = navigation.getParam('_title')

    if (typeof title !== 'string') {
      console.warn(
        `Chat-> _title param not an string, instead got: ${typeof title}`,
      )
    }

    const onPressSendInvoice = navigation.getParam('_onPressSendInvoice')

    if (typeof onPressSendInvoice !== 'function') {
      console.warn(
        `Chat-> _onPressSendInvoice param not a function, instead got: ${typeof onPressSendInvoice}`,
      )
    }

    return {
      headerRight: (
        <MaterialIcons
          color={Colors.TEXT_WHITE}
          name="file-send"
          onPress={onPressSendInvoice}
          size={28}
          style={sendInvoiceIconStyle}
        />
      ),
      headerStyle: {
        backgroundColor: Colors.BLUE_DARK,
        elevation: 0,
      },
      headerTintColor: Colors.TEXT_WHITE,
      title,
    }
  }

  mounted = false

  /** @type {State} */
  state = {
    messages: [],
    rawInvoiceToDecodedInvoice: {},
    rawInvoiceToPaymentStatus: {},
    ownDisplayName: null,
    ownPublicKey: null,
    recipientDisplayName: null,

    sendingInvoice: false,
  }

  toggleSendInvoiceDialog = () => {
    this.setState(({ sendingInvoice }) => ({
      sendingInvoice: !sendingInvoice,
    }))
  }

  /**
   * @type {import('./View').Props['onPressSendInvoice']}
   */
  sendInvoice = (amount, memo) => {
    console.warn(`amount: ${amount} - memo: ${memo}`)

    const recipientPublicKey = this.props.navigation.getParam(
      'recipientPublicKey',
    )

    Wallet.addInvoice({
      expiry: 1800,
      memo,
      value: amount,
    })
      .then(res => {
        API.Actions.sendMessage(
          recipientPublicKey,
          '$$__SHOCKWALLET__INVOICE__' + res.payment_request,
        )
      })
      .catch(err => {
        console.warn(err.message)
        ToastAndroid.show(`Could not send invoice: ${err.message}`, 1000)
      })

    this.toggleSendInvoiceDialog()
  }

  decodeIncomingInvoices() {
    const rawIncomingInvoices = this.state.messages
      .filter(m => !m.outgoing)
      .filter(m => m.body.indexOf('$$__SHOCKWALLET__INVOICE__') === 0)
      .map(m => m.body.slice('$$__SHOCKWALLET__INVOICE__'.length))

    const notDecoded = rawIncomingInvoices.filter(
      i => !this.state.rawInvoiceToDecodedInvoice[i],
    )

    notDecoded.forEach(rawInvoice => {
      Wallet.decodeInvoice({
        payReq: rawInvoice,
      }).then(res => {
        const decodedInvoice = res.decodedRequest

        if (!this.mounted) {
          return
        }

        this.setState(({ rawInvoiceToDecodedInvoice }) => ({
          rawInvoiceToDecodedInvoice: {
            ...rawInvoiceToDecodedInvoice,
            [rawInvoice]: {
              amount: Number(decodedInvoice.num_satoshis),
              expiryDate:
                Number(decodedInvoice.timestamp) +
                Number(decodedInvoice.expiry) * 1000,
            },
          },
        }))
      })
    })
  }

  async fetchOutgoingInvoicesAndUpdateInfo() {
    const { content: invoices } = await Wallet.listInvoices({
      itemsPerPage: 1000,
      page: 1,
    })

    if (!this.mounted) {
      return
    }

    this.setState(
      ({
        messages,
        rawInvoiceToDecodedInvoice: oldRawInvoiceToDecodedInvoice,
        rawInvoiceToPaymentStatus: oldRawInvoiceToPaymentStatus,
      }) => {
        const rawOutgoingInvoices = messages
          .filter(m => m.outgoing)
          .filter(m => m.body.indexOf('$$__SHOCKWALLET__INVOICE__') === 0)
          .map(m => m.body.slice('$$__SHOCKWALLET__INVOICE__'.length))

        const outgoingInvoices = invoices.filter(invoice =>
          rawOutgoingInvoices.includes(invoice.payment_request),
        )

        /** @type {State['rawInvoiceToPaymentStatus']} */
        const rawInvoiceToPaymentStatus = {}

        outgoingInvoices.forEach(invoice => {
          rawInvoiceToPaymentStatus[invoice.payment_request] = invoice.settled
            ? 'PAID'
            : 'UNPAID'
        })

        /** @type {State['rawInvoiceToDecodedInvoice']} */
        const rawInvoiceToDecodedInvoice = {}

        outgoingInvoices.forEach(invoice => {
          rawInvoiceToDecodedInvoice[invoice.payment_request] = {
            amount: Number(invoice.value),
            expiryDate:
              Number(invoice.creation_date) + Number(invoice.expiry) * 1000,
          }
        })

        return {
          rawInvoiceToDecodedInvoice: {
            ...oldRawInvoiceToDecodedInvoice,
            ...rawInvoiceToDecodedInvoice,
          },
          rawInvoiceToPaymentStatus: {
            ...oldRawInvoiceToPaymentStatus,
            ...rawInvoiceToPaymentStatus,
          },
        }
      },
    )
  }

  async fetchPaymentsAndUpdatePaymentStatus() {
    const { content: payments } = await Wallet.listPayments({
      include_incomplete: false,
      itemsPerPage: 1000,
      page: 1,
      paginate: true,
    })

    if (!this.mounted) {
      return
    }

    const rawIncomingInvoices = this.state.messages
      .filter(m => !m.outgoing)
      .filter(m => m.body.indexOf('$$__SHOCKWALLET__INVOICE__') === 0)
      .map(m => m.body.slice('$$__SHOCKWALLET__INVOICE__'.length))

    /** @type {State['rawInvoiceToPaymentStatus']} */
    const rawInvoiceToPaymentStatus = {}

    rawIncomingInvoices.forEach(rawInvoice => {
      const payment = payments.find(
        payment => payment.payment_request === rawInvoice,
      )

      if (payment) {
        const { status: paymentStatus } = payment
        rawInvoiceToPaymentStatus[rawInvoice] =
          paymentStatus === 'SUCCEEDED' ? 'PAID' : paymentStatus
      } else {
        rawInvoiceToPaymentStatus[rawInvoice] = 'UNPAID'
      }
    })

    this.setState(
      ({ rawInvoiceToPaymentStatus: oldRawInvoiceToPaymentStatus }) => ({
        rawInvoiceToPaymentStatus: {
          ...oldRawInvoiceToPaymentStatus,
          ...rawInvoiceToPaymentStatus,
        },
      }),
    )
  }

  /**
   * @param {never} _
   * @param {State} prevState
   */
  componentDidUpdate(_, prevState) {
    const { navigation } = this.props
    const { recipientDisplayName } = this.state
    const recipientPK = navigation.getParam('recipientPublicKey')

    const oldTitle = navigation.getParam('_title')
    if (typeof oldTitle === 'undefined') {
      navigation.setParams({
        _title: recipientPK,
      })
    }

    if (prevState.messages !== this.state.messages) {
      this.decodeIncomingInvoices()
    }

    if (oldTitle === recipientPK && recipientDisplayName) {
      navigation.setParams({
        _title: recipientDisplayName,
      })
    }

    if (
      oldTitle !== recipientPK &&
      oldTitle !== recipientDisplayName &&
      !!recipientDisplayName
    ) {
      navigation.setParams({
        _title: recipientDisplayName,
      })
    }
  }

  componentDidMount() {
    const { navigation } = this.props

    this.authUnsub = API.Events.onAuth(this.onAuth)
    this.chatsUnsub = API.Events.onChats(this.onChats)
    this.displayNameUnsub = API.Events.onDisplayName(displayName => {
      this.setState({
        ownDisplayName: displayName,
      })
    })

    this.mounted = true

    this.decodeIncomingInvoices()
    this.fetchOutgoingInvoicesAndUpdateInfo()
    this.fetchPaymentsAndUpdatePaymentStatus()

    navigation.setParams({
      _onPressSendInvoice: this.toggleSendInvoiceDialog,
    })
  }

  componentWillUnmount() {
    this.mounted = false
  }

  authUnsub = () => {}

  chatsUnsub = () => {}

  displayNameUnsub = () => {}

  /**
   * @private
   * @param {API.Events.AuthData} authData
   * @returns {void}
   */
  onAuth = authData => {
    authData &&
      this.setState({
        ownPublicKey: authData.publicKey,
      })
  }

  /**
   * @private
   * @param {API.Schema.Chat[]} chats
   * @returns {void}
   */
  onChats = chats => {
    const { navigation } = this.props

    const recipientPublicKey = navigation.getParam('recipientPublicKey')

    const theChat = chats.find(
      chat => chat.recipientPublicKey === recipientPublicKey,
    )

    if (!theChat) {
      console.warn(
        `<Chat />.index -> onChats -> no chat found. recipientPublicKey: ${recipientPublicKey}`,
      )
      return
    }

    this.setState(
      {
        messages: theChat.messages,
        recipientDisplayName:
          typeof theChat.recipientDisplayName === 'string' &&
          theChat.recipientDisplayName.length > 0
            ? theChat.recipientDisplayName
            : null,
      },
      () => {
        this.decodeIncomingInvoices()
        this.fetchOutgoingInvoicesAndUpdateInfo()
        this.fetchPaymentsAndUpdatePaymentStatus()
      },
    )
  }

  /**
   * @private
   * @param {string} text
   * @returns {void}
   */
  onSend = text => {
    API.Actions.sendMessage(
      this.props.navigation.getParam('recipientPublicKey'),
      text,
    )
  }

  /**
   * @private
   * @param {string} msgID
   */
  onPressUnpaidIncomingInvoice = msgID => {
    const msg = /** @type {API.Schema.ChatMessage} */ (this.state.messages.find(
      m => m.id === msgID,
    ))

    const rawInvoice = msg.body.slice('$$__SHOCKWALLET__INVOICE__'.length)

    /** @type {WalletOverviewParams} */
    const params = {
      rawInvoice,
      recipientAvatar: null,
      recipientDisplayName: this.state.recipientDisplayName,
      recipientPublicKey: this.props.navigation.getParam('recipientPublicKey'),
    }

    this.props.navigation.navigate(WALLET_OVERVIEW, params)
  }

  render() {
    const {
      messages,
      ownDisplayName,
      ownPublicKey,
      recipientDisplayName,
      rawInvoiceToDecodedInvoice,
      rawInvoiceToPaymentStatus,

      sendingInvoice,
    } = this.state

    const recipientPublicKey = this.props.navigation.getParam(
      'recipientPublicKey',
    )

    const msgIDToInvoiceAmount = (() => {
      /** @type {import('./View').Props['msgIDToInvoiceAmount']} */
      const o = {}

      for (const [rawInvoice, decoded] of Object.entries(
        rawInvoiceToDecodedInvoice,
      )) {
        const msg = messages.find(msg => msg.body.indexOf(rawInvoice) > 0)

        if (!msg) {
          break
        }

        o[msg.id] = /** @type {DecodedInvoice} */ (decoded).amount
      }

      return o
    })()

    const msgIDToInvoiceExpiryDate = (() => {
      /** @type {import('./View').Props['msgIDToInvoiceExpiryDate']} */
      const o = {}

      for (const [rawInvoice, decoded] of Object.entries(
        rawInvoiceToDecodedInvoice,
      )) {
        const msg = messages.find(msg => msg.body.indexOf(rawInvoice) > 0)

        if (!msg) {
          break
        }

        o[msg.id] = /** @type {DecodedInvoice} */ (decoded).expiryDate
      }

      return o
    })()

    const msgIDToInvoicePaymentStatus = (() => {
      /** @type {import('./View').Props['msgIDToInvoicePaymentStatus']} */
      const o = {}

      for (const [rawInvoice, paymentStatus] of Object.entries(
        rawInvoiceToPaymentStatus,
      )) {
        const msg = messages.find(msg => msg.body.indexOf(rawInvoice) > 0)

        if (!msg) {
          break
        }

        if (typeof paymentStatus === 'undefined') {
          break
        }

        o[msg.id] = paymentStatus
      }

      return o
    })()

    return (
      <ChatView
        msgIDToInvoiceAmount={msgIDToInvoiceAmount}
        msgIDToInvoiceExpiryDate={msgIDToInvoiceExpiryDate}
        msgIDToInvoicePaymentStatus={msgIDToInvoicePaymentStatus}
        messages={messages}
        onPressSendInvoice={this.sendInvoice}
        onPressUnpaidIncomingInvoice={this.onPressUnpaidIncomingInvoice}
        onSendMessage={this.onSend}
        ownDisplayName={ownDisplayName}
        ownPublicKey={ownPublicKey}
        recipientDisplayName={recipientDisplayName}
        recipientPublicKey={recipientPublicKey}
        sendingInvoice={sendingInvoice}
        sendDialogOnRequestClose={this.toggleSendInvoiceDialog}
      />
    )
  }
}
