import React from 'react'
import { ToastAndroid, StyleSheet, StatusBar } from 'react-native'
import Ion from 'react-native-vector-icons/Ionicons'
import Logger from 'react-native-file-log'
import { Schema } from 'shock-common'
import produce from 'immer'
/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}, Params>} Navigation
 */

import * as API from '../../services/contact-api'
import * as Wallet from '../../services/wallet'
import * as Cache from '../../services/cache'
import * as CSS from '../../res/css'
const { Colors } = CSS
import { SEND_SCREEN } from '../Send'
import PaymentDialog from '../../components/PaymentDialog'
import { rifle, get } from '../../services'
import * as Store from '../../store'

/**
 * @typedef {import('../Send').Params} SendScreenParams
 */

import ChatView from './View'
/**
 * @typedef {import('./View').PaymentStatus} PaymentStatus
 * @typedef {import('./View').SpontPaymentInTransit} SpontPaymentInTransit
 * @typedef {import('./View').InvoiceInTransit & { msgID: string|null }} InvoiceInTransit
 */

export const CHAT_ROUTE = 'CHAT_ROUTE'

const styles = StyleSheet.create({
  backArrow: { marginLeft: 24 },
  hamburger: { marginRight: 24 },
})

const headerRight = () => (
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
 * @prop {Schema.Chat[]} chats
 * @prop {string|null} ownPublicKey
 * @prop {Partial<Record<string, PaymentStatus>>} rawInvoiceToPaymentStatus
 * @prop {Partial<Record<string, DecodedInvoice>>} rawInvoiceToDecodedInvoice
 * @prop {Schema.ChatMessage[]} cachedSentMessages Messages that were *just*
 * sent but might have not appeared on the onChats() event yet.
 * @prop {Record<string, SpontPaymentInTransit>} spontPaymentsInTransit
 * @prop {Record<string, InvoiceInTransit|null>} invoicesInTransit
 * @prop {Record<string, { body: string , timestamp: number }>} socketMessages
 */

// TODO: COMPONENT HERE IS A TEMP FIX

/**
 * @augments React.PureComponent<Props, State>
 */
export default class Chat extends React.PureComponent {
  /**
   * @param {import('react-navigation-stack').NavigationStackScreenProps} args
   * @returns {import('react-navigation-stack').NavigationStackOptions}
   */
  static navigationOptions = ({ navigation }) => {
    const title = navigation.getParam('_title')

    if (typeof title !== 'string') {
      Logger.log(
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
    // @ts-expect-error tmp
    chats: API.Events.currentChats,
    rawInvoiceToDecodedInvoice: {},
    rawInvoiceToPaymentStatus: {},
    ownPublicKey: null,
    cachedSentMessages: [],
    spontPaymentsInTransit: {},
    invoicesInTransit: {},
    socketMessages: {},
  }

  /** @type {React.RefObject<PaymentDialog>} */
  payDialog = React.createRef()

  mounted = false

  isFocused = false

  didFocus = { remove() {} }

  willBlur = { remove() {} }

  /** @type {null|ReturnType<typeof rifle>} */
  otherMsgsSocket = null

  /**
   * @type {import('./View').Props['onPressSendInvoice']}
   */
  sendInvoice = (amount, memo) => {
    Logger.log(`amount: ${amount} - memo: ${memo}`)

    const theChat = this.getChat()

    if (!theChat) {
      return
    }

    const { recipientPublicKey } = theChat

    const newID = Date.now().toString() + Math.random().toString()

    this.setState(({ invoicesInTransit }) => ({
      invoicesInTransit: {
        ...invoicesInTransit,
        [newID]: {
          amt: amount,
          err: null,
          memo,
          timestamp: Date.now(),
          msgID: null,
        },
      },
    }))

    // This could be done in the future and avoid most of the invoice transit
    // logic.
    // this.onSend(`$$__SHOCKWALLET__INVOICE__....`)

    Wallet.addInvoice({
      expiry: 1800,
      memo,
      value: amount,
    })
      .then(res =>
        API.Actions.sendMessage(
          recipientPublicKey,
          '$$__SHOCKWALLET__INVOICE__' + res.payment_request,
        ),
      )
      .then(msgID => {
        this.setState(({ invoicesInTransit }) => {
          const existingInvoiceInTransit = invoicesInTransit[newID]

          if (existingInvoiceInTransit === null) {
            return null
          }

          return {
            invoicesInTransit: {
              ...invoicesInTransit,
              [newID]: {
                ...existingInvoiceInTransit,
                msgID,
              },
            },
          }
        }, this.updateInvoicesInTransit)
      })
      .catch(err => {
        Logger.log(err.message)
        ToastAndroid.show(`Could not send invoice: ${err.message}`, 1000)
        this.setState(({ invoicesInTransit }) => {
          const existingInvoiceInTransit = invoicesInTransit[newID]

          if (existingInvoiceInTransit === null) {
            return null
          }

          return {
            invoicesInTransit: {
              ...invoicesInTransit,
              [newID]: {
                ...existingInvoiceInTransit,
                err: err.message,
              },
            },
          }
        })
      })
  }

  /**
   * After an invoice is successfully sent, delete the local in memory
   * representation of it.
   */
  updateInvoicesInTransit() {
    this.setState(({ invoicesInTransit, chats }) => {
      const theChat = chats.find(
        c => c.id === this.props.navigation.getParam('id'),
      )

      if (!theChat) {
        return null
      }

      const msgs = theChat.messages

      const placeholdersToBeDeleted = Object.entries(invoicesInTransit)
        .filter(([_, inv]) => inv && msgs.some(m => m.id === inv.msgID))
        .map(([id]) => id)

      const newPlaceholders = { ...invoicesInTransit }

      placeholdersToBeDeleted.forEach(id => {
        delete newPlaceholders[id]
      })

      return {
        invoicesInTransit: newPlaceholders,
      }
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
      })
        .then(res => {
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
        .catch(err => {
          ToastAndroid.show(err.message, 800)
          Logger.log(err.message)
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
   * When new messages are received from the node, checks that any of them is an
   * spontaneous payment and deletes the placeholder inside
   * spontPaymentsInTransit.
   */
  updateSpontPaymentsInTransit = () => {
    const spontPayments = this.getMessages()
      .filter(m => Schema.isEncodedSpontPayment(m.body))
      .map(m =>
        Schema.decodeSpontPayment(
          /** @type {Schema.EncSpontPayment} */ (m.body),
        ),
      )

    this.setState(({ spontPaymentsInTransit }) => {
      const placeholdersToBeDeleted = Object.entries(
        spontPaymentsInTransit,
      ).filter(([, placeholder]) =>
        spontPayments.some(sp => sp.preimage === placeholder.preimage),
      )

      const newPlaceholders = { ...spontPaymentsInTransit }

      placeholdersToBeDeleted.forEach(([, sp]) => {
        delete newPlaceholders[sp.preimage]
      })

      return {
        spontPaymentsInTransit: newPlaceholders,
      }
    })
  }

  /**
   * @param {never} _
   * @param {State} prevState
   */
  componentDidUpdate(_, prevState) {
    const { navigation } = this.props
    const recipientDisplayName = this.getRecipientDisplayName()
    const theChat = this.getChat()

    if (!theChat) {
      return
    }

    const oldTitle = navigation.getParam('_title')
    if (oldTitle !== recipientDisplayName && !!recipientDisplayName) {
      navigation.setParams({
        _title: recipientDisplayName,
      })
    }

    if (prevState.chats !== this.state.chats) {
      this.decodeIncomingInvoices()
    }
  }

  updateLastReadMsg() {
    const messages = this.getMessages()
    const theChat = this.getChat()

    if (!theChat) {
      return
    }

    const { recipientPublicKey: pk } = theChat

    const lastMsg = messages[messages.length - 1]

    if (lastMsg && pk && this.isFocused) {
      Cache.writeLastReadMsg(pk, lastMsg.timestamp)
    }
  }

  setupOtherMsgsSocket = async () => {
    const chat = this.getChat()

    if (!chat) {
      Logger.log('Could not fetch chat for socket at didMount')
      return
    }

    const { recipientPublicKey } = chat
    const publicKey = Store.getMyPublicKey(Store.getStore().getState())

    const { data: incomingID } = await get(
      `api/gun/user/once/userToIncoming>${recipientPublicKey}`,
      { 'public-key-for-decryption': publicKey },
    )

    if (!this.mounted) {
      return
    }

    if (typeof incomingID !== 'string') {
      Logger.log(
        `Expected incomingID to be an string instead got: ${incomingID}`,
      )
      return
    }

    this.otherMsgsSocket = rifle(
      `${recipientPublicKey}::outgoings>${incomingID}>messages::map.on`,
      recipientPublicKey,
    )

    this.otherMsgsSocket.on(
      '$shock',
      /**
       * @param {unknown} msg
       * @param {unknown} msgID
       */
      (msg, msgID) => {
        if (
          Schema.isObj(msg) &&
          typeof msg.body === 'string' &&
          typeof msg.timestamp === 'number' &&
          typeof msgID === 'string'
        ) {
          this.setState(state =>
            produce(state, draft => {
              // @ts-expect-error
              draft.socketMessages[msgID] = msg
            }),
          )
        } else {
          Logger.log(`Not message: ${msg} - msgID: ${msgID}`)
        }
      },
    )
  }

  async componentDidMount() {
    this.mounted = true
    this.updateLastReadMsg()
    const { navigation } = this.props

    this.isFocused = this.props.navigation.isFocused()

    this.didFocus = navigation.addListener('didFocus', () => {
      this.isFocused = true

      this.updateLastReadMsg()
    })
    this.willBlur = navigation.addListener('willBlur', () => {
      this.isFocused = false
    })
    // @ts-expect-error tmp
    this.chatsUnsub = API.Events.onChats(this.onChats)

    this.updateLastReadMsg()
    this.decodeIncomingInvoices()
    this.fetchOutgoingInvoicesAndUpdateInfo()
    this.fetchPaymentsAndUpdatePaymentStatus()
    this.updateSpontPaymentsInTransit()
    this.updateInvoicesInTransit()

    const sad = await Cache.getStoredAuthData()
    if (!this.mounted) {
      return
    }

    if (sad === null) {
      throw new Error()
    }

    this.setState({
      ownPublicKey: sad.authData.publicKey,
    })

    this.setupOtherMsgsSocket()
  }

  componentWillUnmount() {
    this.mounted = false
    this.chatsUnsub()
    this.didFocus.remove()
    this.willBlur.remove()
    if (this.otherMsgsSocket) {
      this.otherMsgsSocket.off('*')
      this.otherMsgsSocket.close()
      this.otherMsgsSocket = null
    }
  }

  chatsUnsub = () => {}

  /**
   * @private
   * @param {Schema.Chat[]} chats
   * @returns {void}
   */
  onChats = chats => {
    const id = this.props.navigation.getParam('id')
    const matchingChat = chats.find(c => c.id === id)

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
        this.updateSpontPaymentsInTransit()
        this.updateInvoicesInTransit()
      },
    )
  }

  /** @returns {Schema.Chat|null} */
  getChat() {
    const id = this.props.navigation.getParam('id')
    const theChat = this.state.chats.find(c => c.id === id)

    if (!theChat) {
      Logger.log(`<Chat />.index -> getChat() -> no chat found. id: ${id}`)
      return null
    }

    return theChat
  }

  /** @returns {Schema.ChatMessage[]} */
  getMessages() {
    const theChat = this.getChat()

    if (!theChat) {
      return []
    }

    /** @type {Schema.ChatMessage[]} */
    const socketMessages = Object.entries(this.state.socketMessages).map(
      ([id, { body, timestamp }]) => ({
        body,
        id,
        timestamp,
        outgoing: false,
      }),
    )

    return [
      ...theChat.messages.filter(m => !this.state.socketMessages[m.id]),
      ...this.state.cachedSentMessages,
      ...socketMessages,
    ]
  }

  /** @returns {string|null} */
  getRecipientAvatar() {
    const theChat = this.getChat()

    if (!theChat) {
      return null
    }

    return theChat.recipientAvatar
  }

  /** @returns {string|null} */
  getRecipientDisplayName() {
    const theChat = this.getChat()

    if (!theChat) {
      return null
    }

    return theChat.recipientDisplayName
  }

  /** @returns {boolean} */
  getDidDisconnect = () => {
    const theChat = this.getChat()

    return !!theChat && theChat.didDisconnect
  }

  /**
   * @private
   * @param {string} text
   * @returns {void}
   */
  onSend = text => {
    if (text.trim().length === 0) {
      return
    }

    this.setState(({ cachedSentMessages }) => ({
      cachedSentMessages: cachedSentMessages.concat({
        body: text,
        id: Math.random().toString() + Date.now().toString(),
        outgoing: true,
        timestamp: Date.now(),
      }),
    }))

    const theChat = this.getChat()

    if (!theChat) {
      return
    }

    const { recipientPublicKey } = theChat

    API.Actions.sendMessageNew(recipientPublicKey, text).catch(e => {
      Logger.log(`Error sending a message with text: ${text} -> ${e.message}`)
    })
  }

  /**
   * @private
   * @param {string} msgID
   */
  onPressUnpaidIncomingInvoice = msgID => {
    const theChat = this.getChat()

    const msg = this.getMessages().find(m => m.id === msgID)

    if (!Schema.isChatMessage(msg) || !theChat) {
      Logger.log(
        `<Chat /> -> onPressUnpaidIncomingInvoice() -> !API.Schema.isChatMessage(msg) || !theChat (aborting)`,
      )
      return
    }

    const rawInvoice = msg.body.slice('$$__SHOCKWALLET__INVOICE__'.length)

    const { recipientPublicKey } = theChat

    const dName = this.getRecipientDisplayName()

    /** @type {SendScreenParams} */
    const params = {
      isRedirect: true,
      data: {
        type: 'ln',
        request: rawInvoice,
        recipientAvatar: undefined,
        recipientDisplayName: dName ? dName : undefined,
        recipientPublicKey,
      },
    }
    this.props.navigation.navigate(SEND_SCREEN, params)
  }

  /**
   * @param {number} amt
   * @param {string} memo
   * @returns {void}
   */
  onPressSendPayment = (amt, memo) => {
    const theChat = this.getChat()

    if (!theChat) {
      return
    }

    const spontPaymentTempID = Math.random().toString()

    this.setState(({ spontPaymentsInTransit }) => ({
      spontPaymentsInTransit: {
        ...spontPaymentsInTransit,
        [spontPaymentTempID]: {
          amt,
          memo,
          preimage: '',
          timestamp: Date.now(),
          err: null,
        },
      },
    }))
    //TMP fix before connecting to redux
    const fees = {
      absoluteFee: '10',
      relativeFee: '0.006',
    }
    API.Actions.sendPayment(theChat.recipientPublicKey, amt, memo, fees)
      .then(preimage => {
        this.setState(({ spontPaymentsInTransit }) => ({
          spontPaymentsInTransit: {
            ...spontPaymentsInTransit,
            [spontPaymentTempID]: {
              ...spontPaymentsInTransit[spontPaymentTempID],
              // give this in-transit spontaneous payment the newly generated
              // preimage so this.updateSpontPaymentsInTransit() can delete the
              // placeholder.
              preimage,
            },
          },
        }))

        this.updateSpontPaymentsInTransit()
      })
      .catch(e => {
        this.setState(({ spontPaymentsInTransit }) => ({
          spontPaymentsInTransit: {
            ...spontPaymentsInTransit,
            [spontPaymentTempID]: {
              ...spontPaymentsInTransit[spontPaymentTempID],
              err: e.message,
            },
          },
        }))
      })
  }

  render() {
    const {
      ownPublicKey,
      rawInvoiceToDecodedInvoice,
      rawInvoiceToPaymentStatus,
    } = this.state
    const recipientDisplayName = this.getRecipientDisplayName()

    const messages = this.getMessages()

    const theChat = this.getChat()

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
        <StatusBar
          backgroundColor={Colors.BLUE_MEDIUM_DARK}
          barStyle="light-content"
          translucent={false}
        />
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
          spontPaymentsInTransit={this.state.spontPaymentsInTransit}
          invoicesInTransit={this.state.invoicesInTransit}
          lastSeenApp={theChat.lastSeenApp || null}
        />

        <PaymentDialog
          recipientPublicKey={recipientPublicKey}
          ref={this.payDialog}
          onPressSend={this.onPressSendPayment}
        />
      </>
    )
  }
}
