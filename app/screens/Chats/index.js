/**
 * @prettier
 */
import React from 'react'
import { Clipboard, StatusBar, ToastAndroid } from 'react-native'
import zipObj from 'lodash/zipObject'
import Logger from 'react-native-file-log'
import { Schema } from 'shock-common'
// @ts-ignore
import ChatIcon from '../../assets/images/navbar-icons/chat.svg'
// @ts-ignore
import ChatIconFocused from '../../assets/images/navbar-icons/chat-focused.svg'

/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}>} Navigation
 */
import * as API from '../../services/contact-api'
import { defaultName } from '../../services/utils'
import * as Cache from '../../services/cache'
import * as CSS from '../../res/css'
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
 * @prop {Schema.Chat[]} chats
 * @prop {Cache.LastReadMsgs} lastReadMsgs
 * @prop {Schema.SimpleReceivedRequest[]} receivedRequests
 * @prop {(Schema.SimpleSentRequest & { state: string|null })[]} sentRequests (If state is sending the request hasn't been acked by API, if it's null it got sent, any other string is an error message)
 * @prop {boolean} showingAddDialog
 *
 * @prop {boolean} scanningUserQR
 */

// TODO: Component vs PureComponent

/**
 * @augments React.Component<Props, State>
 */
export default class Chats extends React.Component {
  /**
   * @type {import('react-navigation').NavigationBottomTabScreenOptions}
   */
  static navigationOptions = {
    // tabBarIcon: ({ focused }) => {
    //   return <TabBarIcon focused={focused} />
    // },
    tabBarIcon: ({ focused }) => {
      return (focused ? <ChatIconFocused size={32} /> : <ChatIcon size={32} />)
    },
  }

  /** @type {State} */
  state = {
    acceptingRequest: null,
    chats: API.Events.currentChats,
    lastReadMsgs: {},
    receivedRequests: API.Events.currReceivedReqs(),
    sentRequests: API.Events.getCurrSentReqs().map(r => ({
      ...r,
      state: null,
    })),
    showingAddDialog: false,

    scanningUserQR: false,
  }

  chatsUnsubscribe = () => {}

  receivedReqsUnsubscribe = () => {}

  sentReqsUnsubscribe = () => {}

  didFocus = { remove() {} }

  onLastReadMsgsUnsub = () => {}

  componentDidMount() {
    this.onLastReadMsgsUnsub = Cache.onLastReadMsgs(lastReadMsgs => {
      this.setState({ lastReadMsgs })
    })
    this.didFocus = this.props.navigation.addListener('didFocus', () => {
      StatusBar.setBackgroundColor(CSS.Colors.BACKGROUND_WHITE)
      StatusBar.setBarStyle('dark-content')
    })
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
    this.sentReqsUnsubscribe = API.Events.onSentRequests(newReqs => {
      this.setState(({ sentRequests: oldReqs }) => {
        const oldReqsMap = zipObj(
          oldReqs.map(r => r.recipientPublicKey),
          oldReqs,
        )
        const newReqsTransformed = newReqs.map(r => ({ ...r, state: null }))
        const newReqsMap = zipObj(
          newReqsTransformed.map(r => r.recipientPublicKey),
          newReqsTransformed,
        )

        const finalMap = {
          ...oldReqsMap,
          ...newReqsMap,
        }

        return {
          sentRequests: Object.values(finalMap),
        }
      })
    })
  }

  componentWillUnmount() {
    this.didFocus.remove()
    this.chatsUnsubscribe()
    this.receivedReqsUnsubscribe()
    this.sentReqsUnsubscribe()
    this.onLastReadMsgsUnsub()
  }

  /**
   * @param {string} id
   */
  onPressChat = id => {
    // CAST: If user is pressing on a chat, chats are loaded and not null.
    // TS wants the expression to be casted to `unknown` first. Not possible
    // with jsdoc
    const { chats } = this.state

    // CAST: If user is pressing on a chat, that chat exists
    const chat = /** @type {Schema.Chat} */ (chats.find(chat => chat.id === id))

    const sortedMessages = chat.messages
      .slice()
      .sort(byTimestampFromOldestToNewest)

    const lastMsg = sortedMessages[sortedMessages.length - 1]

    if (typeof lastMsg === 'undefined') {
      throw new TypeError("typeof lastMsg === 'undefined'")
    }

    /** @type {ChatParams} */
    const params = {
      id,
      // performance
      _title: chat.recipientDisplayName || chat.recipientPublicKey,
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
      Logger.log('acceptingRequest === null')
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

  onPressRejectRequest = () => {
    API.Actions.generateNewHandshakeNode()
    this.cancelAcceptingRequest()
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
      Logger.log("typeof pk === 'string' && pk.length === 0")
      return
    }

    if (this.state.sentRequests.some(r => r.recipientPublicKey === pk)) {
      ToastAndroid.show('Already sent request to this user', 800)
    }

    /** @type {Schema.SimpleSentRequest & { state: string|null}} */
    const fakeReq = {
      id: Math.random().toString(),
      recipientAvatar: null,
      recipientDisplayName: defaultName(pk),
      recipientPublicKey: pk,
      recipientChangedRequestAddress: false,
      timestamp: Date.now(),
      state: 'sending',
    }

    this.setState(({ sentRequests }) => ({
      sentRequests: [...sentRequests, fakeReq],
    }))

    /**
     * @param {string} publicKey
     * @param {string} error
     * @returns {<T extends {recipientPublicKey: string}>(t: T) => (T & { state: string|null }) }
     */
    const placeErrorOnPk = (publicKey, error) => sentRequest => ({
      ...sentRequest,
      state: sentRequest.recipientPublicKey === publicKey ? error : null,
    })

    API.Actions.sendHandshakeRequest(pk)
      .then(() => {
        this.setState(({ sentRequests }) => ({
          sentRequests: sentRequests.map(r => {
            if (r.recipientPublicKey === pk) {
              return {
                ...r,
                state: null,
              }
            }

            return r
          }),
        }))
      })
      .catch(e => {
        this.setState(({ sentRequests }) => ({
          sentRequests: sentRequests.map(placeErrorOnPk(pk, e.message)),
        }))
      })
  }

  sendHRToUserFromClipboard = () => {
    this.toggleAddDialog()

    Clipboard.getString()
      .then(this.sendHR)
      .catch(e => {
        Logger.log(
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
      Logger.log(`<Chats />.index -> onQRRead() -> ${err.message}`)
    }
  }

  ///

  render() {
    const {
      acceptingRequest,
      chats,
      lastReadMsgs,
      receivedRequests,
      sentRequests,

      showingAddDialog,

      scanningUserQR,
    } = this.state

    /**
     * @type {string[]}
     */
    const readChatIDs = chats
      .filter(c => {
        const lastMsg = c.messages[c.messages.length - 1]
        const tstamp = lastReadMsgs[c.recipientPublicKey]
        return lastMsg && tstamp && lastMsg.timestamp <= tstamp
      })
      .map(c => c.recipientPublicKey)

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
        onRequestCloseRequestDialog={this.cancelAcceptingRequest}
        onPressRejectRequest={this.onPressRejectRequest}
        onPressAdd={this.toggleAddDialog}
        showingAddDialog={showingAddDialog}
        onRequestCloseAddDialog={this.toggleAddDialog}
        userChosePasteFromClipboard={this.sendHRToUserFromClipboard}
        userChoseQRScan={this.toggleContactQRScanner}
        showingQRScanner={scanningUserQR}
        onQRRead={this.onQRRead}
        onRequestCloseQRScanner={this.toggleContactQRScanner}
        readChatIDs={readChatIDs}
      />
    )
  }
}
