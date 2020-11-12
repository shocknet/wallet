import React from 'react'
import { Clipboard, StatusBar, ToastAndroid } from 'react-native'
import Logger from 'react-native-file-log'
import { Schema } from 'shock-common'
import { Color } from 'shock-common/dist/constants'
import produce from 'immer'

/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}>} Navigation
 */
import * as API from '../../services/contact-api'
import * as Cache from '../../services/cache'
import * as CSS from '../../res/css'
import { CHAT_ROUTE } from './../Chat'
import ShockIcon from '../../res/icons'
import * as Store from '../../store'

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
 * @typedef {object} StateProps
 * @prop {Schema.Chat[]} chats
 * @prop {Schema.SimpleReceivedRequest[]} receivedRequests
 * @prop {Schema.SimpleSentRequest[]} sentRequests
 */

/**
 * @typedef {object} DispatchProps
 * @prop {(publicKey: string) => void} onSendRequest
 */

/**
 * @typedef {object} OwnProps
 * @prop {Navigation} navigation
 */

/**
 * @typedef {StateProps & DispatchProps & OwnProps} Props
 */

/**
 * @typedef {object} State
 * @prop {string|null} acceptingRequest
 * @prop {Cache.LastReadMsgs} lastReadMsgs
 * @prop {Record<string, string|null>} sentRequestsState (If state is
 * `'sending'` the request hasn't been acked by API, if it's null it got sent,
 * any other string is an error message)
 * @prop {boolean} showingAddDialog
 * @prop {boolean} scanningUserQR
 */

/**
 * @augments React.PureComponent<Props, State>
 */
class Chats extends React.PureComponent {
  /**
   * @type {import('react-navigation-tabs').NavigationBottomTabOptions}
   */
  static navigationOptions = {
    tabBarIcon: ({ focused }) => {
      return ((
        <ShockIcon
          name="thin-chat"
          color={focused ? Color.BUTTON_BLUE : Color.TEXT_WHITE}
          size={32}
        />
      ))
    },
  }

  /** @type {State} */
  state = {
    acceptingRequest: null,
    lastReadMsgs: {},
    showingAddDialog: false,
    scanningUserQR: false,
    sentRequestsState: {},
  }

  onLastReadMsgsUnsub = () => {}

  componentDidMount() {
    this.onLastReadMsgsUnsub = Cache.onLastReadMsgs(lastReadMsgs => {
      this.setState({ lastReadMsgs })
    })
  }

  componentWillUnmount() {
    this.onLastReadMsgsUnsub()
  }

  /**
   * @param {string} id
   */
  onPressChat = id => {
    // CAST: If user is pressing on a chat, chats are loaded and not null.
    // TS wants the expression to be casted to `unknown` first. Not possible
    // with jsdoc
    const { chats } = this.props

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
    let pk = encodedShockUser
    if (encodedShockUser.startsWith('http')) {
      const parts = encodedShockUser.split('/')
      pk = parts[parts.length - 1]
    }

    this.setState(
      (prevState, { sentRequests }) => {
        const { sentRequestsState } = prevState

        if (typeof pk === 'string' && pk.length === 0) {
          Logger.log("typeof pk === 'string' && pk.length === 0")
          return null
        }

        if (
          sentRequests.some(r => r.recipientPublicKey === pk) ||
          sentRequestsState[pk]
        ) {
          ToastAndroid.show('Already sent request to this user', 800)
        }

        return produce(prevState, draft => {
          draft.sentRequestsState[pk] = 'sending'
        })
      },
      () => {
        API.Actions.sendHandshakeRequest(pk)
          .then(() => {
            this.setState(prevState =>
              produce(prevState, draft => {
                draft.sentRequestsState[pk] = null
              }),
            )
          })
          .catch(e => {
            this.setState(prevState =>
              produce(prevState, draft => {
                draft.sentRequestsState[pk] = e.message
              }),
            )
          })
      },
    )
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
    const { chats, receivedRequests, sentRequests } = this.props

    const {
      acceptingRequest,
      lastReadMsgs,
      showingAddDialog,
      scanningUserQR,
      sentRequestsState,
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
      <>
        <StatusBar
          backgroundColor={CSS.Colors.DARK_MODE_BACKGROUND_BLUEISH_GRAY}
          barStyle="light-content"
          translucent={false}
        />
        <ChatsView
          sentRequests={filteredSentRequests.map(sr => ({
            ...sr,
            state: sentRequestsState[sr.recipientPublicKey],
          }))}
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
      </>
    )
  }
}

/**
 * @param {Store.State} state
 * @returns {StateProps}
 */
const mapState = state => ({
  chats: Store.selectAllChats(state),
  receivedRequests: Store.selectAllReceivedReqs(state),
  sentRequests: Store.selectAllSentReqs(state),
})

/**
 * @param {Store.Dispatch} dispatch
 * @returns {DispatchProps}
 */
const mapDispatch = dispatch => ({
  onSendRequest(pk) {
    dispatch(
      Store.receivedSingleUserData({
        publicKey: pk,
      }),
    )
  },
})

const ConnectedChats = Store.connect(mapState, mapDispatch)(Chats)

export default ConnectedChats
