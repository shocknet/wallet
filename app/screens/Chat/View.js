/**
 * @prettier
 */
import React from 'react'
import {
  StyleSheet,
  View,
  ActivityIndicator,
  StatusBar,
  TouchableWithoutFeedback,
  Modal,
  TouchableOpacity,
  ToastAndroid,
} from 'react-native'
import { Text } from 'react-native-elements'
import { GiftedChat } from 'react-native-gifted-chat'
/**
 * @typedef {import('react-native-gifted-chat').IMessage} GiftedChatMessage
 * @typedef {import('react-native-gifted-chat').User} GiftedChatUser
 */

import * as CSS from '../../res/css'
import BasicDialog from '../../components/BasicDialog'
import ShockInput from '../../components/ShockInput'
import Pad from '../../components/Pad'
import ShockButton from '../../components/ShockButton'
import { Actions } from '../../services/contact-api'

import ChatInvoice from './ChatInvoice'
import ChatMessage from './ChatMessage'
import InputToolbar, {
  ACTION_BTN_HEIGHT,
  OVAL_V_PAD,
  CONTAINER_H_PAD,
  OVAL_ELEV,
} from './InputToolbar'
import ShockDialog from '../../components/ShockDialog'

export const CHAT_ROUTE = 'CHAT_ROUTE'
const EMPTY_OBJ = {}

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
  <>
    <StatusBar
      backgroundColor={CSS.Colors.BLUE_DARK}
      barStyle="light-content"
    />

    <View style={styles.loading}>
      <ActivityIndicator />
    </View>
  </>
)

/**
 * @type {React.FC<import('react-native-gifted-chat').LoadEarlierProps>}
 */
const LoadingEarlier = ({ isLoadingEarlier }) =>
  (isLoadingEarlier ? (
    <View>
      <Pad amount={24} />
      <ActivityIndicator color="gray" />
    </View>
  ) : null)

const AlwaysNull = () => null

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
 * @prop {string|null} ownPublicKey
 * @prop {string|null} recipientDisplayName
 * @prop {string} recipientPublicKey
 *
 * @prop {(amount: number, memo: string) => void} onPressSendInvoice
 *
 * @prop {() => void} onPressSendBTC
 * @prop {string|null} recipientAvatar
 *
 * @prop {boolean} didDisconnect
 */

/**
 * @typedef {object} State
 * @prop {boolean} actionSheetOpen
 *
 * @prop {boolean} sendingInvoice True when showing the send invoice dialog.
 * @prop {number} sendInvoiceAmount
 * @prop {string} sendInvoiceMemo
 *
 * @prop {number} inputToolbarHeight
 *
 * @prop {'none'|'confirming'|'processing'|'err'} disconnectStatus
 * @prop {string} disconnectErr Empty string if disconnectStatus !== 'err'
 */

// TODO: Component instead of PureComponent is a temp fix
/**
 * @augments React.Component<Props, State, never>
 */
export default class ChatView extends React.Component {
  navigationOptions = {
    headerStyle: {
      backgroundColor: CSS.Colors.BLUE_DARK,
      elevation: 0,
    },
    headerTintColor: CSS.Colors.TEXT_WHITE,
    title: 'Talker',
  }

  /** @type {State} */
  state = {
    actionSheetOpen: false,

    sendingInvoice: false,
    sendInvoiceAmount: 0,
    sendInvoiceMemo: '',

    inputToolbarHeight: 40,

    disconnectStatus: 'none',
    disconnectErr: '',
  }

  actionSheetStyle = [
    styles.actionSheet,
    {
      bottom: this.state.inputToolbarHeight,
    },
  ]

  /**
   * @param {unknown} _
   * @param {State} prevState
   */
  componentDidUpdate(_, prevState) {
    if (prevState.inputToolbarHeight !== this.state.inputToolbarHeight) {
      // @ts-ignore
      this.actionSheetStyle[1].bottom = this.state.inputToolbarHeight
      this.forceUpdate()
    }
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
        : /** @type {string} */ (user._id)

    const timestamp =
      typeof currentMessage.createdAt === 'number'
        ? currentMessage.createdAt
        : currentMessage.createdAt.getTime()

    const isInvoice =
      currentMessage.text.indexOf('$$__SHOCKWALLET__INVOICE__') === 0

    if (isInvoice) {
      return (
        <View
          style={
            outgoing
              ? styles.invoiceWrapperOutgoing
              : styles.invoiceWrapperIncoming
          }
        >
          <ChatInvoice
            amount={invoiceToAmount[currentMessage._id]}
            id={/** @type {string} */ (currentMessage._id)}
            onPressUnpaidIncomingInvoice={onPressUnpaidIncomingInvoice}
            outgoing={outgoing}
            paymentStatus={msgIDToInvoicePaymentStatus[currentMessage._id]}
            senderName={senderName}
            timestamp={timestamp}
          />
        </View>
      )
    }

    return (
      <View
        style={outgoing ? styles.msgWrapperOutgoing : styles.msgWrapperIncoming}
      >
        <ChatMessage
          id={/** @type {string} */ (currentMessage._id)}
          body={currentMessage.text}
          outgoing={outgoing}
          timestamp={timestamp}
          avatar={this.props.recipientAvatar}
        />
      </View>
    )
  }

  /**
   * @private
   * @param {string} msg
   * @returns {void}
   */
  onSend = msg => {
    this.props.onSendMessage(msg)
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
      sendingInvoice: false,
    })
  }

  toggleInvoiceDialog = () => {
    this.setState(({ sendingInvoice }) => ({
      sendingInvoice: !sendingInvoice,
    }))
  }

  toggleActionSheet = () => {
    this.setState(({ actionSheetOpen }) => ({
      actionSheetOpen: !actionSheetOpen,
    }))
  }

  /** @param {number} inputToolbarHeight */
  onInputToolbarHeight = inputToolbarHeight => {
    this.setState({ inputToolbarHeight })
  }

  onPressSendBTC = () => {
    this.toggleActionSheet()
    this.props.onPressSendBTC()
  }

  onPressReceive = () => {
    this.toggleActionSheet()
    this.toggleInvoiceDialog()
  }

  onPressBlock = () => {
    this.toggleActionSheet()
  }

  toggleDisconnectDialog = () => {
    this.setState(({ disconnectStatus }) => {
      const shouldCloseDialog =
        disconnectStatus === 'confirming' || disconnectStatus === 'err'
      const shouldOpenDialog = disconnectStatus === 'none'

      if (shouldCloseDialog) {
        return {
          disconnectStatus: 'none',
          disconnectErr: '',
        }
      }

      if (shouldOpenDialog) {
        return {
          disconnectStatus: 'confirming',
          disconnectErr: '',
        }
      }

      return null
    })
  }

  onPressDisconnect = () => {
    this.toggleActionSheet()
    this.toggleDisconnectDialog()
  }

  disconnectChoices = {
    Confirm: () => {
      this.setState(
        {
          disconnectStatus: 'processing',
        },
        async () => {
          try {
            await Actions.disconnect(this.props.recipientPublicKey)
          } catch (e) {
            this.setState({
              disconnectStatus: 'err',
              disconnectErr: e.message || 'Unknown Error',
            })
          }
        },
      )
    },
    'Go Back': this.toggleDisconnectDialog,
  }

  onPressRemove = () => {
    Actions.disconnect(this.props.recipientPublicKey)
      .then(() => {
        ToastAndroid.show('Removed', 800)
      })
      .catch(e => {
        ToastAndroid.show('Could not remove', 800)
        console.warn(e.message || 'unknown error')
      })
  }

  render() {
    const {
      messages,
      ownPublicKey,
      recipientDisplayName,
      recipientPublicKey,
      didDisconnect,
    } = this.props

    const { sendInvoiceAmount, sendInvoiceMemo } = this.state

    if (ownPublicKey === null) {
      return <Loading />
    }

    /** @type {GiftedChatUser} */
    const ownUser = {
      _id: ownPublicKey,
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

    const [firstMsg] = sortedMessages

    const thereAreMoreMessages =
      firstMsg.body !== '$$__SHOCKWALLET__INITIAL__MESSAGE' && !didDisconnect

    /** @type {GiftedChatMessage[]} */
    const giftedChatMsgs = sortedMessages
      .filter(m => {
        if (didDisconnect) {
          return m.outgoing
        }
        return true
      })
      .filter(msg => msg.body !== '$$__SHOCKWALLET__INITIAL__MESSAGE')
      .sort(byTimestampFromNewestToOldest)
      .map(msg => ({
        _id: msg.id,
        text: msg.body,
        createdAt: msg.timestamp,
        user: msg.outgoing ? ownUser : recipientUser,
      }))

    return (
      <>
        <StatusBar
          backgroundColor={CSS.Colors.BLUE_DARK}
          barStyle="light-content"
        />

        <Modal
          onRequestClose={this.toggleActionSheet}
          transparent
          visible={this.state.actionSheetOpen}
        >
          <TouchableWithoutFeedback onPress={this.toggleActionSheet}>
            <View style={CSS.styles.flex}>
              <TouchableWithoutFeedback>
                <View style={this.actionSheetStyle}>
                  <Text style={styles.action} onPress={this.onPressSendBTC}>
                    Send BTC
                  </Text>
                  <Pad amount={10} />
                  <Text style={styles.action} onPress={this.onPressReceive}>
                    Receive
                  </Text>
                  <Pad amount={10} />
                  <Text style={styles.action} onPress={this.onPressDisconnect}>
                    Disconnect
                  </Text>
                  <Pad amount={10} />
                  <Text style={styles.action} onPress={this.onPressBlock}>
                    Block
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <View style={xStyles.container}>
          <GiftedChat
            alignTop
            isLoadingEarlier={thereAreMoreMessages}
            messages={giftedChatMsgs}
            renderLoading={Loading}
            renderMessage={this.messageRenderer}
            user={ownUser}
            renderInputToolbar={AlwaysNull}
            minInputToolbarHeight={this.state.inputToolbarHeight + 24}
            // Overrides GiftedChat's grey oval box that contains both a load
            // earliers text and an activity spinner
            renderLoadEarlier={LoadingEarlier}
            loadEarlier
          />
        </View>

        {!didDisconnect && (
          <InputToolbar
            disableInput={false}
            onPressActionBtn={this.toggleActionSheet}
            onSend={this.onSend}
            onHeight={this.onInputToolbarHeight}
          />
        )}

        {didDisconnect && (
          <View style={styles.disconnectNotice}>
            <Text style={CSS.styles.fontMontserrat}>Contact Disconnected</Text>

            <Pad amount={24} />

            <TouchableOpacity
              style={styles.removeConvBtn}
              onPress={this.onPressRemove}
            >
              <Text style={xStyles.removeConv}>Remove Conversation</Text>
            </TouchableOpacity>
          </View>
        )}

        <BasicDialog
          title="Create a Lightning Invoice"
          onRequestClose={this.toggleInvoiceDialog}
          visible={this.state.sendingInvoice}
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

        <ShockDialog
          choiceToHandler={
            this.state.disconnectStatus === 'confirming'
              ? this.disconnectChoices
              : EMPTY_OBJ
          }
          onRequestClose={this.toggleDisconnectDialog}
          visible={this.state.disconnectStatus !== 'none'}
          message={(() => {
            const { disconnectStatus } = this.state

            if (disconnectStatus === 'confirming') {
              return 'Removing this contact will delete the conversation, are you sure?'
            }

            if (disconnectStatus === 'err') {
              return this.state.disconnectErr || ''
            }

            if (disconnectStatus === 'processing') {
              return 'Procesing...'
            }

            return ''
          })()}
        />
      </>
    )
  }
}

const MSG_V_MARGIN = 20

const msgWrapperBase = {
  paddingLeft: 18,
  paddingRight: 18,
  marginTop: MSG_V_MARGIN,
  marginBottom: MSG_V_MARGIN,
}

const invoiceWrapperBase = {
  paddingTop: 42,
  paddingBottom: 42,
}

const styles = StyleSheet.create({
  action: {
    color: '#9B9999',
    fontSize: 11,
    fontFamily: 'Montserrat-500',
  },

  actionSheet: {
    backgroundColor: 'white',
    position: 'absolute',
    left: 8,

    elevation: 5,
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 22,
    paddingRight: 20,
    borderRadius: 30,
    minWidth: '40%',
  },

  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },

  msgWrapperOutgoing: {
    ...msgWrapperBase,
    alignSelf: 'flex-end',
  },

  msgWrapperIncoming: {
    ...msgWrapperBase,
    alignSelf: 'flex-start',
  },

  invoiceWrapperIncoming: {
    ...invoiceWrapperBase,
    alignItems: 'flex-start',
  },

  invoiceWrapperOutgoing: {
    ...invoiceWrapperBase,
    alignItems: 'flex-end',
  },

  disconnectNotice: {
    position: 'absolute',
    bottom: 24,

    paddingLeft: CONTAINER_H_PAD,
    paddingRight: CONTAINER_H_PAD,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  removeConvBtn: {
    backgroundColor: CSS.Colors.BACKGROUND_NEAR_WHITE,
    elevation: OVAL_ELEV,
    height: OVAL_V_PAD * 2 + ACTION_BTN_HEIGHT,
    width: '60%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
})

const xStyles = {
  container: [CSS.styles.flex, CSS.styles.backgroundWhite],
  removeConv: [CSS.styles.fontMontserratBold, CSS.styles.fontSize12],
}
