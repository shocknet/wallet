/**
 * @prettier
 */
import React from 'react'
import { Clipboard } from 'react-native'
import EntypoIcons from 'react-native-vector-icons/Entypo'
/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}>} Navigation
 */

import * as API from '../../services/contact-api'
import { CHAT_ROUTE } from './../Chat'

import ChatsView from './View'

export const CHATS_ROUTE = 'CHATS_ROUTE'
/**
 * @typedef {import('../Chat').Params} ChatParams
 */

/**
 * @param {{ timestamp: number }} a
 * @param {{ timestamp: number }} b
 * @returns {number}
 */
const byTimestampFromOldestToNewest = (a, b) => a.timestamp - b.timestamp

/**
 * @typedef {object} Props
 * @prop {Navigation} navigation
 */

/**
 * @typedef {object} State
 * @prop {string|null} acceptingRequest
 * @prop {API.Schema.Chat[]} chats
 * @prop {API.Schema.SimpleReceivedRequest[]} receivedRequests
 * @prop {API.Schema.SimpleSentRequest[]} sentRequests
 * @prop {boolean} showingAddDialog
 *
 * @prop {boolean} scanningUserQR
 */

/**
 * Add the last message's id of a chat to this set when opening. This will
 * simulate read status.
 * @type {Set<string>}
 */
const readMsgs = new Set()

/**
 * @augments React.PureComponent<Props, State>
 */
export default class Chats extends React.PureComponent {
  /**
   * @type {import('react-navigation').NavigationBottomTabScreenOptions}
   */
  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => {
      return ((
        <EntypoIcons
          color={tintColor === null ? undefined : tintColor}
          name="chat"
          // reverseColor={'#CED0CE'}
          size={22}
        />
      ))
    },
  }

  /** @type {State} */
  state = {
    acceptingRequest: null,
    chats: [],
    receivedRequests: [],
    sentRequests: [],
    showingAddDialog: false,

    scanningUserQR: false,
  }

  chatsUnsubscribe = () => {}
  receivedReqsUnsubscribe = () => {}
  sentReqsUnsubscribe = () => {}

  componentDidMount() {
    this.chatsUnsubscribe = API.Events.onChats(chats => {
      this.setState({
        chats,
      })
    })
    this.receivedReqsUnsubscribe = API.Events.onReceivedRequests(
      receivedRequests => {
        this.setState({
          receivedRequests,
        })
      },
    )
    this.sentReqsUnsubscribe = API.Events.onSentRequests(sentRequests => {
      this.setState({
        sentRequests,
      })
    })
  }

  componentWillUnmount() {
    this.chatsUnsubscribe()
    this.receivedReqsUnsubscribe()
    this.sentReqsUnsubscribe()
  }

  /**
   * @param {string} recipientPublicKey
   */
  onPressChat = recipientPublicKey => {
    // CAST: If user is pressing on a chat, chats are loaded and not null.
    // TS wants the expression to be casted to `unknown` first. Not possible
    // with jsdoc
    //  @ts-ignore
    const chats = /** @type  {API.Schema.Chat[]} */ (this.state.chats)

    // CAST: If user is pressing on a chat, that chat exists
    const { messages } = /** @type {API.Schema.Chat} */ (chats.find(
      chat => chat.recipientPublicKey === recipientPublicKey,
    ))

    const sortedMessages = messages.slice().sort(byTimestampFromOldestToNewest)

    const lastMsg = sortedMessages[sortedMessages.length - 1]

    if (typeof lastMsg === 'undefined') {
      throw new TypeError("typeof lastMsg === 'undefined'")
    }

    readMsgs.add(lastMsg.id)

    /** @type {ChatParams} */
    const params = {
      recipientPublicKey,
    }

    this.props.navigation.navigate(CHAT_ROUTE, params)
  }

  /**
   * @private
   * @param {string} receivedRequestID
   * @returns {void}
   */
  onPressReceivedRequest = receivedRequestID => {
    this.setState({
      acceptingRequest: receivedRequestID,
    })
  }

  acceptRequest = () => {
    const { acceptingRequest } = this.state

    if (acceptingRequest === null) {
      console.warn('acceptingRequest === null')
      return
    }

    API.Actions.acceptRequest(acceptingRequest)

    this.setState({
      acceptingRequest: null,
    })
  }

  /**
   * @private
   * @returns {void}
   */
  cancelAcceptingRequest = () => {
    this.setState({
      acceptingRequest: null,
    })
  }

  ///

  toggleAddDialog = () => {
    this.setState(({ showingAddDialog }) => ({
      showingAddDialog: !showingAddDialog,

      scanningUserQR: false,
    }))
  }

  /**
   * @param {string} encodedShockUser
   */
  sendHR = encodedShockUser => {
    const pk = encodedShockUser.slice('$$__SHOCKWALLET__USER__'.length)

    if (typeof pk === 'string' && pk.length === 0) {
      console.warn("typeof pk === 'string' && pk.length === 0")
      return
    }

    API.Actions.sendHandshakeRequest(pk)
  }

  sendHRToUserFromClipboard = () => {
    this.toggleAddDialog()

    Clipboard.getString()
      .then(this.sendHR)
      .catch(e => {
        console.warn(
          `sendHRToUserFromClipboard()->Clipboard.getString() error: ${e.message}`,
        )
      })
  }

  toggleContactQRScanner = () => {
    this.setState(({ scanningUserQR }) => ({
      showingAddDialog: false,

      scanningUserQR: !scanningUserQR,
    }))
  }

  /**
   * @param {{ data: string }} e
   */
  onQRRead = e => {
    try {
      if (typeof e.data !== 'string') {
        throw new TypeError(`typeof e.data !== 'string' :: ${typeof e.data}`)
      }

      const encodedShockUser = e.data

      this.toggleContactQRScanner()

      this.sendHR(encodedShockUser)
    } catch (err) {
      console.warn(`<Chats />.index -> onQRRead() -> ${err.message}`)
    }
  }

  ///

  render() {
    const {
      acceptingRequest,
      chats,
      receivedRequests,
      sentRequests,

      showingAddDialog,

      scanningUserQR,
    } = this.state

    const filteredSentRequests = sentRequests.filter(sr => {
      const chatEstablishedWithRecipient = chats.some(
        chat => chat.recipientPublicKey === sr.recipientPublicKey,
      )

      return !chatEstablishedWithRecipient
    })

    const filteredReceivedRequests = receivedRequests.filter(rr => {
      const chatEstablishedWithRequestor = chats.some(
        chat => chat.recipientPublicKey === rr.requestorPK,
      )

      return !chatEstablishedWithRequestor
    })

    return (
      <ChatsView
        sentRequests={filteredSentRequests}
        chats={chats}
        onPressChat={this.onPressChat}
        acceptingRequest={!!acceptingRequest}
        receivedRequests={filteredReceivedRequests}
        onPressRequest={this.onPressReceivedRequest}
        onPressAcceptRequest={this.acceptRequest}
        onPressIgnoreRequest={this.cancelAcceptingRequest}
        onPressAdd={this.toggleAddDialog}
        showingAddDialog={showingAddDialog}
        onRequestCloseAddDialog={this.toggleAddDialog}
        userChosePasteFromClipboard={this.sendHRToUserFromClipboard}
        userChoseQRScan={this.toggleContactQRScanner}
        showingQRScanner={scanningUserQR}
        onQRRead={this.onQRRead}
        onRequestCloseQRScanner={this.toggleContactQRScanner}
      />
    )
  }
}
