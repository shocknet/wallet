/**
 * @prettier
 */
import React from 'react'
import { StyleSheet, View, ActivityIndicator } from 'react-native'
import { Icon, Text } from 'react-native-elements'
import { GiftedChat, Send } from 'react-native-gifted-chat'
/**
 * @typedef {import('react-native-gifted-chat').IMessage} GiftedChatMessage
 * @typedef {import('react-native-gifted-chat').User} GiftedChatUser
 */

import ChatInvoice from './ChatInvoice'
import ChatMessage from './ChatMessage'
import BasicDialog from '../../components/BasicDialog'
import ShockInput from '../../components/ShockInput'
import Pad from '../../components/Pad'
import ShockButton from '../../components/ShockButton'

export const CHAT_ROUTE = 'CHAT_ROUTE'

/**
 * @param {{ timestamp: number }} a
 * @param {{ timestamp: number }} b
 * @returns {number}
 */
const byTimestampFromOldestToNewest = (a, b) => a.timestamp - b.timestamp

/**
 * @param {{ timestamp: number }} a
 * @param {{ timestamp: number }} b
 * @returns {number}
 */
const byTimestampFromNewestToOldest = (a, b) => b.timestamp - a.timestamp

const Loading = () => (
  <View style={styles.loading}>
    <ActivityIndicator />
  </View>
)

/**
 * @param {Record<string, any>} props
 */
const SendRenderer = props => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <Send {...props}>
    <View style={styles.sendIcon}>
      <Icon name="paper-plane" type="font-awesome" />
    </View>
  </Send>
)

/**
 * @typedef {import('./ChatInvoice').PaymentStatus} PaymentStatus
 */

/**
 * @typedef {object} Props
 * @prop {Partial<Record<string, number>>} msgIDToInvoiceAmount Used for
 * displaying an amount on incoming/outgoing invoices. If undefined an spinner
 * will will be shown as a placeholder.
 * @prop {Partial<Record<string, number>>} msgIDToInvoiceExpiryDate Used for
 * displaying expiration status on invoices. If undefined for a given invoice,
 * an spinner will will be shown for that given invoice as a placeholder.
 * @prop {Partial<Record<string, PaymentStatus>>} msgIDToInvoicePaymentStatus
 * Used for displaying payment status on invoices. If undefined for a given
 * invoice, an spinner  will be shown for that given invoice as a placeholder.
 * Please refer to _PaymentStatus to see what each one represents.
 * @prop {import('../../services/contact-api').Schema.ChatMessage[]} messages
 * @prop {(msgID: string) => void} onPressUnpaidIncomingInvoice
 * @prop {(text: string) => void} onSendMessage
 * @prop {string|null} ownDisplayName
 * @prop {string|null} ownPublicKey
 * @prop {string|null} recipientDisplayName
 * @prop {string} recipientPublicKey
 *
 * @prop {boolean} sendingInvoice True when showing the send invoice dialog.
 * @prop {(amount: number, memo: string) => void} onPressSendInvoice
 * @prop {() => void} sendDialogOnRequestClose
 */

/**
 * @typedef {object} State
 * @prop {number} sendInvoiceAmount
 * @prop {string} sendInvoiceMemo
 */

/**
 * @augments React.PureComponent<Props, State, never>
 */
export default class ChatView extends React.PureComponent {
  state = {
    sendInvoiceAmount: 0,
    sendInvoiceMemo: '',
  }

  /**
   * @private
   * @type {import('react-native-gifted-chat').GiftedChatProps['renderMessage']}
   */
  messageRenderer = ({ currentMessage }) => {
    if (typeof currentMessage === 'undefined') {
      console.warn("typeof currentMessage === 'undefined'")
      return null
    }

    const {
      msgIDToInvoiceAmount: invoiceToAmount,
      msgIDToInvoicePaymentStatus,
      onPressUnpaidIncomingInvoice,
      recipientPublicKey,
    } = this.props

    const { user } = currentMessage

    const outgoing = user._id !== recipientPublicKey

    const senderName =
      typeof user.name === 'string' && user.name.length > 0
        ? user.name
        : user._id

    const timestamp =
      typeof currentMessage.createdAt === 'number'
        ? currentMessage.createdAt
        : currentMessage.createdAt.getTime()

    const isInvoice =
      currentMessage.text.indexOf('$$__SHOCKWALLET__INVOICE__') === 0

    if (isInvoice) {
      return (
        <View style={outgoing ? styles.alignFlexStart : styles.alignFlexEnd}>
          <View style={styles.maxWidth}>
            <ChatInvoice
              amount={invoiceToAmount[currentMessage._id]}
              id={currentMessage._id}
              onPressUnpaidIncomingInvoice={onPressUnpaidIncomingInvoice}
              outgoing={outgoing}
              paymentStatus={msgIDToInvoicePaymentStatus[currentMessage._id]}
              senderName={senderName}
              timestamp={timestamp}
            />
          </View>
        </View>
      )
    }

    return (
      <View style={outgoing ? styles.alignFlexStart : styles.alignFlexEnd}>
        <View style={styles.maxWidth}>
          <ChatMessage
            id={currentMessage._id}
            body={currentMessage.text}
            outgoing={outgoing}
            senderName={senderName}
            timestamp={timestamp}
          />
        </View>
      </View>
    )
  }

  /**
   * @private
   * @param {GiftedChatMessage[]} msgs
   * @returns {void}
   */
  onSend = msgs => {
    const [msg] = msgs

    if (typeof msg === 'undefined') {
      console.warn("typeof msg === 'undefined'")
      return
    }

    this.props.onSendMessage(msg.text)
  }

  /**
   * @type {import('../../components/ShockInput').Props['onChangeText']}
   */
  onChangeInvoiceAmount = amount => {
    const numbers = '0123456789'.split('')

    const chars = amount.split('')

    if (!chars.every(c => numbers.includes(c))) {
      return
    }

    this.setState({
      sendInvoiceAmount: Number(amount),
    })
  }

  /**
   * @type {import('../../components/ShockInput').Props['onChangeText']}
   */
  onChangeInvoiceMemo = memo => {
    this.setState({
      sendInvoiceMemo: memo,
    })
  }

  onPressSendInvoice = () => {
    this.props.onPressSendInvoice(
      this.state.sendInvoiceAmount,
      this.state.sendInvoiceMemo,
    )

    this.setState({
      sendInvoiceAmount: 0,
      sendInvoiceMemo: '',
    })
  }

  render() {
    const {
      messages,
      ownDisplayName,
      ownPublicKey,
      recipientDisplayName,
      recipientPublicKey,

      sendingInvoice,

      sendDialogOnRequestClose,
    } = this.props

    const { sendInvoiceAmount, sendInvoiceMemo } = this.state

    if (messages.length === 0) {
      return <Loading />
    }

    if (ownPublicKey === null) {
      return <Loading />
    }

    /** @type {GiftedChatUser} */
    const ownUser = {
      _id: ownPublicKey,
      name: typeof ownDisplayName === 'string' ? ownDisplayName : ownPublicKey,
    }

    /** @type {GiftedChatUser} */
    const recipientUser = {
      _id: recipientPublicKey,
      name:
        typeof recipientDisplayName === 'string'
          ? recipientDisplayName
          : recipientPublicKey,
    }

    const sortedMessages = messages.slice().sort(byTimestampFromOldestToNewest)

    if (sortedMessages.length === 0) {
      return <Loading />
    }

    const [firstMsg] = sortedMessages

    const thereAreMoreMessages =
      firstMsg.body !== '$$__SHOCKWALLET__INITIAL__MESSAGE'

    /** @type {GiftedChatMessage[]} */
    const giftedChatMsgs = sortedMessages
      .filter(msg => msg.body !== '$$__SHOCKWALLET__INITIAL__MESSAGE')
      .sort(byTimestampFromNewestToOldest)
      .map(msg => ({
        _id: msg.id,
        text: msg.body,
        createdAt: msg.timestamp,
        user: msg.outgoing ? ownUser : recipientUser,
      }))

    return (
      <React.Fragment>
        <GiftedChat
          isLoadingEarlier={thereAreMoreMessages}
          loadEarlier={thereAreMoreMessages}
          messages={giftedChatMsgs}
          onSend={this.onSend}
          renderLoading={Loading}
          renderMessage={this.messageRenderer}
          renderSend={SendRenderer}
          user={ownUser}
        />

        <BasicDialog
          title="Create a Lightning Invoice"
          onRequestClose={sendDialogOnRequestClose}
          visible={sendingInvoice}
        >
          <ShockInput
            placeholder="Memo (optional)"
            onChangeText={this.onChangeInvoiceMemo}
            value={sendInvoiceMemo}
          />

          <Pad amount={10} />

          <ShockInput
            keyboardType="number-pad"
            onChangeText={this.onChangeInvoiceAmount}
            placeholder="Amount (in sats)"
            value={
              sendInvoiceAmount === 0
                ? undefined // allow placeholder to show
                : sendInvoiceAmount.toString()
            }
          />

          <Pad amount={10} />

          <Text>Invoice will expire in 30min.</Text>

          <Pad amount={10} />

          <ShockButton onPress={this.onPressSendInvoice} title="Send" />
        </BasicDialog>
      </React.Fragment>
    )
  }
}

const styles = StyleSheet.create({
  alignFlexEnd: {
    alignItems: 'flex-end',
  },

  alignFlexStart: {
    alignItems: 'flex-start',
  },

  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },

  maxWidth: {
    maxWidth: '85%',
  },

  sendIcon: { marginRight: 10, marginBottom: 10 },
})
