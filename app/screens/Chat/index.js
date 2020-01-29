/**
 * @prettier
 */
import React from 'react'
import { ToastAndroid, StyleSheet, StatusBar } from 'react-native'
import Ion from 'react-native-vector-icons/Ionicons'
/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}, Params>} Navigation
 */

import * as API from '../../services/contact-api'
import * as Wallet from '../../services/wallet'
import * as Cache from '../../services/cache'
import * as CSS from '../../res/css'
const { Colors } = CSS

import { WALLET_OVERVIEW } from '../WalletOverview'
/**
 * @typedef {import('../WalletOverview').Params} WalletOverviewParams
 */

import ChatView from './View'
import PaymentDialog from './PaymentDialog'
/**
 * @typedef {import('./View').PaymentStatus} PaymentStatus
 */

export const CHAT_ROUTE = 'CHAT_ROUTE'

const styles = StyleSheet.create({
  backArrow: { marginLeft: 24 },
  hamburger: { marginRight: 24 },
})

const headerRight = (
  <Ion name="ios-menu" color="white" size={36} style={styles.hamburger} />
)

/** @type {React.FC<{ onPress?: () => void }>} */
const HeaderLeft = React.memo(({ onPress }) => ((
  <Ion
    suppressHighlighting
    color="white"
    name="ios-arrow-round-back"
    onPress={onPress}
    size={48}
    style={styles.backArrow}
  />
)))

/**
 * @typedef {object} Params
 * @prop {string} id
 * @prop {string=} _title
 */

/**
 * @typedef {object} Props
 * @prop {Navigation} navigation
 */

/**
 * Both outgoing and incoming invoices.
 * @typedef {object} DecodedInvoice
 * @prop {number} amount
 * @prop {number} expiryDate UNIX time.
 */

/**
 * @typedef {object} State
 * @prop {API.Schema.Chat[]} chats
 * @prop {string|null} ownPublicKey
 * @prop {Partial<Record<string, PaymentStatus>>} rawInvoiceToPaymentStatus
 * @prop {Partial<Record<string, DecodedInvoice>>} rawInvoiceToDecodedInvoice
 * @prop {string|null} recipientDisplayName
 * @prop {API.Schema.ChatMessage[]} cachedSentMessages Messages that were *just*
 * sent but might have not appeared on the onChats() event yet.
 */

// TODO: COMPONENT HERE IS A TEMP FIX

/**
 * @augments React.Component<Props, State>
 */
export default class Chat extends React.Component {
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

    return {
      headerStyle: {
        backgroundColor: Colors.BLUE_MEDIUM_DARK,
        elevation: 0,
      },

      headerRight,

      headerLeft: props => <HeaderLeft onPress={props.onPress} />,

      headerTintColor: Colors.TEXT_WHITE,

      headerTitleStyle: {
        fontFamily: 'Montserrat-500',
        // https://github.com/react-navigation/react-navigation/issues/542#issuecomment-283663786
        fontWeight: 'normal',
        fontSize: 13,
      },

      title,
    }
  }

  /** @type {State} */
  state = {
    chats: API.Events.currentChats,
    rawInvoiceToDecodedInvoice: {},
    rawInvoiceToPaymentStatus: {},
    ownPublicKey: null,
    recipientDisplayName: null,
    cachedSentMessages: [],
  }

  /** @type {React.RefObject<PaymentDialog>} */
  payDialog = React.createRef()

  mounted = false

  isFocused = false

  didFocus = { remove() {} }

  willBlur = { remove() {} }

  /**
   * @type {import('./View').Props['onPressSendInvoice']}
   */
  sendInvoice = (amount, memo) => {
    console.warn(`amount: ${amount} - memo: ${memo}`)

    const id = this.props.navigation.getParam('id')
    const theChat = (this.state.chats.find(c => c.id === id))

    if (!theChat) {
      return
    }

    const { recipientPublicKey } = theChat

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
  }

  openSendPaymentDialog = () => {
    const { current } = this.payDialog

    current && current.open()
  }

  decodeIncomingInvoices() {
    const rawIncomingInvoices = this.getMessages()
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
        rawInvoiceToDecodedInvoice: oldRawInvoiceToDecodedInvoice,
        rawInvoiceToPaymentStatus: oldRawInvoiceToPaymentStatus,
      }) => {
        const rawOutgoingInvoices = this.getMessages()
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

    const rawIncomingInvoices = this.getMessages()
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
    const id = this.props.navigation.getParam('id')
    const theChat = this.state.chats.find(c => c.id === id)

    if (!theChat) {
      return
    }

    const { recipientPublicKey: recipientPK } = theChat

    const oldTitle = navigation.getParam('_title')
    if (typeof oldTitle === 'undefined') {
      navigation.setParams({
        _title: recipientPK,
      })
    }

    if (prevState.chats !== this.state.chats) {
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

  updateLastReadMsg() {
    const messages = this.getMessages()
    const id = this.props.navigation.getParam('id')
    const theChat = this.state.chats.find(c => c.id === id)

    if (!theChat) {
      return
    }

    const { recipientPublicKey: pk } = theChat

    const lastMsg = messages[messages.length - 1]

    if (lastMsg && pk && this.isFocused) {
      Cache.writeLastReadMsg(pk, lastMsg.timestamp)
    }
  }

  async componentDidMount() {
    this.mounted = true
    this.updateLastReadMsg()
    const { navigation } = this.props

    this.isFocused = this.props.navigation.isFocused()

    this.didFocus = navigation.addListener('didFocus', () => {
      this.isFocused = true

      StatusBar.setBackgroundColor(Colors.BLUE_MEDIUM_DARK)
      StatusBar.setBarStyle('light-content')

      this.updateLastReadMsg()
    })
    this.willBlur = navigation.addListener('willBlur', () => {
      this.isFocused = false
    })
    this.chatsUnsub = API.Events.onChats(this.onChats)

    this.decodeIncomingInvoices()
    this.fetchOutgoingInvoicesAndUpdateInfo()
    this.fetchPaymentsAndUpdatePaymentStatus()

    const sad = await Cache.getStoredAuthData()

    if (sad === null) {
      throw new Error()
    }

    this.setState({
      ownPublicKey: sad.authData.publicKey,
    })
  }

  componentWillUnmount() {
    this.mounted = false
    this.chatsUnsub()
    this.didFocus.remove()
    this.willBlur.remove()
  }

  chatsUnsub = () => {}

  /**
   * @private
   * @param {API.Schema.Chat[]} chats
   * @returns {void}
   */
  onChats = chats => {
    const id = this.props.navigation.getParam('id')
    const matchingChat = this.state.chats.find(c => c.id === id)

    if (!matchingChat) {
      this.props.navigation.goBack()
    }

    this.setState(
      {
        chats,
        cachedSentMessages: [],
      },
      () => {
        this.updateLastReadMsg()
        this.decodeIncomingInvoices()
        this.fetchOutgoingInvoicesAndUpdateInfo()
        this.fetchPaymentsAndUpdatePaymentStatus()
      },
    )
  }

  /** @returns {API.Schema.ChatMessage[]} */
  getMessages = () => {
    const id = this.props.navigation.getParam('id')
    const theChat = this.state.chats.find(c => c.id === id)

    if (!theChat) {
      console.warn(
        `<Chat />.index -> getMessages() -> no chat found. id: ${id}`,
      )
      return []
    }

    return [...theChat.messages, ...this.state.cachedSentMessages]
  }

  /** @returns {string|null} */
  getRecipientAvatar() {
    const recipientPublicKey = this.props.navigation.getParam(
      'recipientPublicKey',
    )

    const theChat = this.state.chats.find(
      chat => chat.recipientPublicKey === recipientPublicKey,
    )

    if (!theChat) {
      console.warn(
        `<Chat />.index -> getRecipientAvatar -> no chat found. recipientPublicKey: ${recipientPublicKey}`,
      )
      return null
    }

    return theChat.recipientAvatar
  }

  /** @returns {string|null} */
  getRecipientDisplayName() {
    const id = this.props.navigation.getParam('id')
    const theChat = this.state.chats.find(c => c.id === id)

    if (!theChat) {
      console.warn(
        `<Chat />.index -> getRecipientDisplayName -> no chat found. id: ${id}`,
      )
      return null
    }

    return theChat.recipientDisplayName
  }

  /** @returns {boolean} */
  getDidDisconnect = () => {
    const id = this.props.navigation.getParam('id')
    const theChat = this.state.chats.find(c => c.id === id)

    if (!theChat) {
      console.warn(
        `<Chat />.index -> getRecipientDisplayName -> no chat found. id: ${id}`,
      )
      return false
    }

    return theChat.didDisconnect
  }

  /**
   * @private
   * @param {string} text
   * @returns {void}
   */
  onSend = text => {
    this.setState(({ cachedSentMessages }) => ({
      cachedSentMessages: cachedSentMessages.concat({
        body: text,
        id: Math.random().toString() + Date.now().toString(),
        outgoing: true,
        timestamp: Date.now(),
      }),
    }))

    const id = this.props.navigation.getParam('id')
    const theChat = this.state.chats.find(c => c.id === id)

    if (!theChat) {
      return
    }

    const { recipientPublicKey } = theChat

    API.Actions.sendMessage(recipientPublicKey, text).catch(e => {
      console.warn(`Error sending a message with text: ${text} -> ${e.message}`)
    })
  }

  /**
   * @private
   * @param {string} msgID
   */
  onPressUnpaidIncomingInvoice = msgID => {
    const msg = /** @type {API.Schema.ChatMessage} */ (this.getMessages().find(
      m => m.id === msgID,
    ))

    const rawInvoice = msg.body.slice('$$__SHOCKWALLET__INVOICE__'.length)

    const id = this.props.navigation.getParam('id')
    const theChat = this.state.chats.find(c => c.id === id)

    if (!theChat) {
      return
    }

    const { recipientPublicKey } = theChat

    /** @type {WalletOverviewParams} */
    const params = {
      rawInvoice,
      recipientAvatar: null,
      recipientDisplayName: this.state.recipientDisplayName,
      recipientPublicKey,
    }

    this.props.navigation.navigate(WALLET_OVERVIEW, params)
  }

  render() {
    const {
      ownPublicKey,
      recipientDisplayName,
      rawInvoiceToDecodedInvoice,
      rawInvoiceToPaymentStatus,
    } = this.state

    const messages = this.getMessages()

    const id = this.props.navigation.getParam('id')
    const theChat = this.state.chats.find(c => c.id === id)

    if (!theChat) {
      return null
    }

    const { recipientPublicKey } = theChat

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
      <>
        <ChatView
          msgIDToInvoiceAmount={msgIDToInvoiceAmount}
          msgIDToInvoiceExpiryDate={msgIDToInvoiceExpiryDate}
          msgIDToInvoicePaymentStatus={msgIDToInvoicePaymentStatus}
          messages={messages}
          onPressSendInvoice={this.sendInvoice}
          onPressUnpaidIncomingInvoice={this.onPressUnpaidIncomingInvoice}
          onSendMessage={this.onSend}
          ownPublicKey={ownPublicKey}
          recipientDisplayName={recipientDisplayName}
          recipientPublicKey={recipientPublicKey}
          onPressSendBTC={this.openSendPaymentDialog}
          recipientAvatar={this.getRecipientAvatar()}
          didDisconnect={this.getDidDisconnect()}
        />

        <PaymentDialog
          recipientPublicKey={recipientPublicKey}
          ref={this.payDialog}
        />
      </>
    )
  }
}
