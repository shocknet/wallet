/**
 * @prettier
 */
import React from 'react'
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import moment from 'moment'
import { Divider, Icon } from 'react-native-elements'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Logger from 'react-native-file-log'
import { Schema } from 'shock-common'

/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}>} Navigation
 */

import ChangingText from '../../components/ChangingText'
import QRCodeScanner from '../../components/QRScanner'
import UserDetail from '../../components/UserDetail'
import { Colors, SCREEN_PADDING, styles as Styles } from '../../res/css'
import ShockDialog from '../../components/ShockDialog'
import Nav from '../../components/Nav'
import * as ContactAPI from '../../services/contact-api'

const ACCEPT_REQUEST_DIALOG_TEXT =
  'By accepting this request, this user will be able to send you messages. You can block the user from sending further messages down the line if you wish so.'
export const CHATS_ROUTE = 'CHATS_ROUTE'
/**
 * @typedef {import('.././Chat').Params} ChatParams
 */

const LIST_STYLE = [
  Styles.traslucentStatusBarPadding,
  Styles.backgroundWhiteDark,
  Styles.flex,
]

/**
 * @param {{ timestamp: number }} a
 * @param {{ timestamp: number }} b
 * @returns {number}
 */
const byTimestampFromOldestToNewest = (a, b) => a.timestamp - b.timestamp

/**
 * @type {React.FC}
 */
// const _NoChatsOrRequests = () => ((
//   <View style={styles.noChats}>
//     <Text>NO CHATS OR REQUESTS</Text>
//   </View>
// ))
//
// const NoChatsOrRequests = React.memo(_NoChatsOrRequests)

const _NoChatsOrRequestsDark = () => ((
  <View style={styles.noChatsDark}>
    <Text style={styles.noChatsTextDark}>NO CHATS OR REQUESTS</Text>
  </View>
))

const NoChatsOrRequestsDark = React.memo(_NoChatsOrRequestsDark)

/**
 * @param {Schema.Chat | Schema.SimpleReceivedRequest | Schema.SimpleSentRequest} item
 * @returns {string}
 */
const keyExtractor = item => item.id

/**
 * @typedef {object} Props
 * @prop {boolean} acceptingRequest True if in the process of accepting a
 * request (a dialog will pop up).
 *
 * @prop {Schema.Chat[]} chats
 * @prop {Schema.SimpleReceivedRequest[]} receivedRequests
 * @prop {(Schema.SimpleSentRequest & { state: string|null })[]} sentRequests
 *
 * @prop {(id: string) => void} onPressChat
 * @prop {(requestID: string) => void} onPressRequest
 *
 * @prop {() => void} onPressAcceptRequest
 * @prop {() => void} onPressRejectRequest
 * @prop {() => void} onRequestCloseRequestDialog
 *
 * @prop {() => void} onPressAdd
 * @prop {boolean} showingAddDialog
 * @prop {() => void} onRequestCloseAddDialog
 * @prop {() => void} userChoseQRScan
 * @prop {() => void} userChosePasteFromClipboard
 * @prop {boolean} showingQRScanner
 * @prop {() => void} onRequestCloseQRScanner
 * @prop {(e: { data: string }) => void} onQRRead
 *
 * @prop {string[]} readChatIDs List of chats that do NOT have unread messages.
 */

/**
 * @typedef {{ displayName: string|null , avatar: string|null, pk: string }} ShockUser
 */

/**
 * @typedef {object} State
 * @prop {string | null} avatar
 */

/**
 * @augments React.Component<Props>
 */
export default class ChatsView extends React.Component {
  /**
   * @private
   * @type {Record<string, () => void>}
   */
  choiceToHandler = {
    Accept: () => {
      this.props.onPressAcceptRequest()
    },
    Reject: () => {
      this.props.onPressRejectRequest()
    },
  }

  /**
   * @private
   * @param {string} id
   */
  onPressChat = id => {
    this.props.onPressChat(id)
  }

  /**
   * @private
   * @param {string} requestID
   */
  onPressRequest = requestID => {
    this.props.onPressRequest(requestID)
  }

  theme = 'dark'
  ////////////////////////////////////////////////////////////////////////////////

  addDialogChoiceToHandler = {
    'Scan QR': () => {
      this.props.userChoseQRScan()
    },

    'Paste from Clipboard': () => {
      this.props.userChosePasteFromClipboard()
    },
  }

  state = {
    avatar: ContactAPI.Events.getAvatar(),
  }

  ////////////////////////////////////////////////////////////////////////////////

  /**
   * @param {Schema.Chat} chat
   * @returns {React.ReactElement<any> | null}
   */
  chatRenderer = chat => {
    const { readChatIDs } = this.props
    const lastMsg = chat.messages.slice().sort(byTimestampFromOldestToNewest)[
      chat.messages.length - 1
    ]

    if (typeof lastMsg === 'undefined') {
      throw new TypeError(
        "<ChatsView/>->chatRenderer() typeof lastMsg === 'undefined'",
      )
    }

    const lastMsgTimestamp = lastMsg.timestamp

    const unread = !readChatIDs.includes(chat.recipientPublicKey)

    const theme = 'dark'

    return (
      <TouchableOpacity
        // eslint-disable-next-line react/jsx-no-bind
        onPress={() => {
          this.onPressChat(chat.id)
        }}
      >
        <View
          style={
            theme === 'dark' ? styles.itemContainerDark : styles.itemContainer
          }
        >
          <View style={styles.userDetailContainer}>
            <UserDetail
              alternateText={`(${moment(lastMsgTimestamp).fromNow()})`}
              alternateTextBold={unread}
              id={chat.id}
              lowerText={(() => {
                if (chat.didDisconnect) {
                  return 'Contact Disconnected'
                }

                if (lastMsg.body === '$$__SHOCKWALLET__INITIAL__MESSAGE') {
                  return 'Empty conversation'
                }

                if (lastMsg.body.indexOf('$$__SHOCKWALLET__INVOICE__') === 0) {
                  return 'Invoice'
                }

                return lastMsg.body
              })()}
              lowerTextStyle={unread ? styles.boldFontDark : styles.boldFont}
              name={
                chat.recipientDisplayName === null
                  ? chat.recipientPublicKey
                  : chat.recipientDisplayName
              }
              nameBold={unread}
              onPress={this.onPressChat}
              lastSeenApp={chat.lastSeenApp || 0}
              publicKey={chat.recipientPublicKey}
            />
          </View>
          {theme !== 'dark' && (
            <Icon
              color={Colors.ORANGE}
              name="chevron-right"
              size={28}
              type="font-awesome"
            />
          )}
        </View>
      </TouchableOpacity>
    )
  }

  /**
   * @param {Schema.SimpleReceivedRequest} receivedRequest
   * @returns {React.ReactElement<any>}
   */
  receivedRequestRenderer = receivedRequest => {
    const theme = 'dark'
    return (
      <View
        style={
          theme === 'dark' ? styles.itemContainerDark : styles.itemContainer
        }
      >
        <View style={styles.userDetailContainer}>
          <UserDetail
            alternateText={`(${moment(receivedRequest.timestamp).fromNow()})`}
            alternateTextBold
            id={receivedRequest.id}
            lowerText="Wants to contact you"
            lowerTextStyle={styles.boldFont}
            name={
              receivedRequest.requestorDisplayName === null
                ? receivedRequest.requestorPK
                : receivedRequest.requestorDisplayName
            }
            nameBold
            onPress={this.onPressRequest}
            lastSeenApp={0}
            publicKey={receivedRequest.requestorPK}
          />
        </View>
        {theme !== 'dark' && (
          <Icon
            color={Colors.ORANGE}
            name="chevron-right"
            size={28}
            type="font-awesome"
          />
        )}
      </View>
    )
  }

  /**
   * @param {Schema.SimpleSentRequest} sentRequest
   * @returns {React.ReactElement<any>}
   */
  sentRequestRenderer = sentRequest => {
    // @ts-ignore
    const isSending = sentRequest.state === 'sending'
    const hasError =
      // @ts-ignore
      typeof sentRequest.state === 'string' && sentRequest.state !== 'sending'

    const theme = 'dark'

    return (
      <View
        style={
          theme === 'dark' ? styles.itemContainerDark : styles.itemContainer
        }
      >
        <View style={styles.userDetailContainer}>
          <UserDetail
            alternateText={`(${moment(sentRequest.timestamp).fromNow()})`}
            alternateTextBold
            id={sentRequest.id}
            lowerText={(() => {
              if (isSending) {
                return (
                  <ChangingText poll={600} cycle>
                    {['Sending', 'Sending.', 'Sending..', 'Sending...']}
                  </ChangingText>
                )
              }

              if (hasError) {
                // @ts-ignore
                return sentRequest.state
              }

              return sentRequest.recipientChangedRequestAddress
                ? 'Request ignored'
                : 'Pending acceptance'
            })()}
            lowerTextStyle={hasError ? styles.redBoldFont : styles.boldFont}
            name={
              sentRequest.recipientDisplayName === null
                ? sentRequest.recipientPublicKey
                : sentRequest.recipientDisplayName
            }
            nameBold
            lastSeenApp={0}
            publicKey={sentRequest.recipientPublicKey}
          />
        </View>
        {/*<Icon*/}
        {/*  color={Colors.ORANGE}*/}
        {/*  name="chevron-right"*/}
        {/*  size={28}*/}
        {/*  type="font-awesome"*/}
        {/*/>*/}
      </View>
    )
  }

  /**
   * @private
   * @param {{ item: Schema.Chat|Schema.SimpleReceivedRequest|Schema.SimpleSentRequest }} args
   * @returns {React.ReactElement<any> | null}
   */
  itemRenderer = ({ item }) => {
    if (Schema.isChat(item)) {
      return this.chatRenderer(item)
    }

    if (Schema.isSimpleSentRequest(item)) {
      return this.sentRequestRenderer(item)
    }

    if (Schema.isSimpleReceivedRequest(item)) {
      return this.receivedRequestRenderer(item)
    }

    // if (item.type === 'chat') {
    //   return this.chatRenderer(item)
    // } else if (item.type === 'send') {
    //   return this.sentRequestRenderer(item)
    // } else if (item.type === 'receive') {
    //   return this.receivedRequestRenderer(item)
    // }
    Logger.log(`unknown kind of item found: ${JSON.stringify(item)}`)

    return null
  }

  onPressAdd = () => {
    this.props.onPressAdd()
  }

  header = () => (
    <View style={this.theme === 'dark' ? styles.headerDark : styles.header}>
      <Ionicons
        name="ios-add"
        color={this.theme === 'dark' ? Colors.TEXT_WHITE : Colors.BLUE_LIGHT}
        size={48}
        onPress={this.onPressAdd}
      />
    </View>
  )

  render() {
    const {
      acceptingRequest,
      chats,

      receivedRequests,
      sentRequests,

      showingAddDialog,
      onRequestCloseAddDialog,

      showingQRScanner,
      onQRRead,

      onRequestCloseQRScanner,
    } = this.props

    const { avatar } = this.state

    if (showingQRScanner) {
      return (
        <QRCodeScanner
          onRead={onQRRead}
          onRequestClose={onRequestCloseQRScanner}
        />
      )
    }

    const items = [...chats, ...receivedRequests, ...sentRequests]

    items.sort((a, b) => {
      /** @type {number} */
      let at = 0

      /** @type {number} */
      let bt = 0

      if (Schema.isChat(a)) {
        const sortedMessages = a.messages
          .slice()
          .sort(byTimestampFromOldestToNewest)

        const lastMsg = sortedMessages[sortedMessages.length - 1]

        if (typeof lastMsg === 'undefined') {
          throw new TypeError(
            "<ChatsView />->render()->API.Schema.isChat(a) typeof lastMsg === 'undefined'",
          )
        }

        at = lastMsg.timestamp
      } else {
        at = a.timestamp
      }

      if (Schema.isChat(b)) {
        const sortedMessages = b.messages
          .slice()
          .sort(byTimestampFromOldestToNewest)

        const lastMsg = sortedMessages[sortedMessages.length - 1]

        if (typeof lastMsg === 'undefined') {
          throw new TypeError(
            "<ChatsView />->render()->API.Schema.isChat(b) : typeof lastMsg === 'undefined' ",
          )
        }

        bt = lastMsg.timestamp
      } else {
        bt = b.timestamp
      }

      return bt - at
    })

    // const testdatas = [
    //   {
    //     timestamp: 1600093106,
    //     id: 1,
    //     didDisconnect: 1,
    //     body: 'hello',
    //     recipientDisplayName: 'Tomas',
    //     recipientPublicKey: 'recipientPublicKey1',
    //     lastSeenApp: 1,
    //     type: 'chat',
    //     messages: [
    //       {
    //         timestamp: 1600093106,
    //         body: 'hello',
    //       },
    //       {
    //         timestamp: 1600093106,
    //         body: 'hello',
    //       },
    //     ],
    //   },
    //   {
    //     timestamp: 1600090000,
    //     id: 2,
    //     didDisconnect: 1,
    //     body: 'hello',
    //     recipientDisplayName: 'Tomas2',
    //     recipientPublicKey: 'recipientPublicKey1',
    //     lastSeenApp: 1,
    //     type: 'chat',
    //     messages: [
    //       {
    //         timestamp: 1600093106,
    //         body: 'hello',
    //       },
    //       {
    //         timestamp: 1600093106,
    //         body: 'hello',
    //       },
    //     ],
    //   },
    //   {
    //     timestamp: 1600093100,
    //     id: 3,
    //     recipientChangedRequestAddress: 'recipientChangedRequestAddress3',
    //     recipientPublicKey: 'recipientPublicKey3',
    //     recipientDisplayName: 'recipientDisplayName3',
    //     state: 'sending',
    //     type: 'send',
    //   },
    //   {
    //     timestamp: 1600033558,
    //     id: 30,
    //     recipientChangedRequestAddress: 'recipientChangedRequestAddress30',
    //     recipientPublicKey: 'recipientPublicKey30',
    //     recipientDisplayName: 'recipientDisplayName30',
    //     lastSeenApp: 1,
    //     type: 'send',
    //   },
    //   {
    //     timestamp: 1600033106,
    //     id: 20,
    //     requestorDisplayName: 'Tomas20',
    //     requestorPK: 'recipientPublicKey20',
    //     type: 'receive',
    //   },
    //   {
    //     timestamp: 1600035578,
    //     id: 10,
    //     requestorDisplayName: 'Tomas10',
    //     requestorPK: 'recipientPublicKey10',
    //     type: 'receive',
    //   },
    // ]

    const theme = 'dark'

    return (
      <View style={theme === 'dark' ? styles.containerDark : {}}>
        <Nav title="Messages" showAvatar={avatar} style={styles.navBar} />
        <FlatList
          ListHeaderComponent={this.header}
          ItemSeparatorComponent={theme === 'dark' ? null : Divider}
          ListEmptyComponent={NoChatsOrRequestsDark}
          data={items}
          keyExtractor={keyExtractor}
          renderItem={this.itemRenderer}
          style={
            theme === 'dark'
              ? [LIST_STYLE, styles.chatListContainer]
              : LIST_STYLE
          }
          contentContainerStyle={styles.flatListContentContainerStyle}
        />

        <ShockDialog
          choiceToHandler={this.choiceToHandler}
          message={ACCEPT_REQUEST_DIALOG_TEXT}
          onRequestClose={this.props.onRequestCloseRequestDialog}
          visible={!!acceptingRequest}
        />

        <ShockDialog
          choiceToHandler={this.addDialogChoiceToHandler}
          message=""
          onRequestClose={onRequestCloseAddDialog}
          visible={showingAddDialog}
        />
      </View>
    )
  }
}

const ITEM_CONTAINER_HORIZONTAL_PADDING = SCREEN_PADDING / 2
const ITEM_CONTAINER_VERTICAL_PADDING = 15

const styles = StyleSheet.create({
  boldFont: {
    // @ts-ignore
    fontWeight: 'bold',
    color: '#EBEBEB',
  },

  boldFontDark: {
    // @ts-ignore
    color: '#EBEBEB',
    fontFamily: 'Montserrat-600',
    fontSize: 11,
  },

  redBoldFont: {
    // @ts-ignore
    fontWeight: 'bold',
    color: 'red',
  },

  header: {
    backgroundColor: Colors.BACKGROUND_WHITE,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    paddingLeft: SCREEN_PADDING,
    paddingRight: SCREEN_PADDING,
    paddingTop: 12,
  },

  headerDark: {
    backgroundColor: '#1A2028',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    paddingLeft: SCREEN_PADDING,
    paddingRight: SCREEN_PADDING,
    paddingTop: 12,
  },

  itemContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: ITEM_CONTAINER_VERTICAL_PADDING,
    paddingLeft: ITEM_CONTAINER_HORIZONTAL_PADDING,
    paddingRight: ITEM_CONTAINER_HORIZONTAL_PADDING,
    paddingTop: ITEM_CONTAINER_VERTICAL_PADDING,
  },

  itemContainerDark: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: ITEM_CONTAINER_VERTICAL_PADDING,
    paddingLeft: ITEM_CONTAINER_HORIZONTAL_PADDING,
    paddingRight: ITEM_CONTAINER_HORIZONTAL_PADDING,
    paddingTop: ITEM_CONTAINER_VERTICAL_PADDING,
    borderBottomWidth: 1,
    borderBottomColor: '#4285B9',
    borderTopWidth: 1,
    borderTopColor: '#4285B9',
    backgroundColor: '#212937',
    marginBottom: 5,
  },

  // noChats: {
  //   alignItems: 'center',
  //   backgroundColor: Colors.BACKGROUND_WHITE,
  //   flex: 1,
  //   justifyContent: 'center',
  // },
  noChatsDark: {
    alignItems: 'center',
    backgroundColor: '#1A2028',
    flex: 1,
    justifyContent: 'center',
  },
  noChatsTextDark: {
    color: 'white',
  },
  userDetailContainer: {
    flex: 1,
    marginRight: 20,
  },
  containerDark: {
    flex: 1,
    backgroundColor: '#16191C',
    marginTop: 20,
  },
  chatListContainer: {
    backgroundColor: '#16191C',
    flex: 1,
  },
  flatListContentContainerStyle: {
    paddingBottom: 50,
    backgroundColor: '#16191C',
  },
  navBar: {
    paddingBottom: 30,
    borderBottomColor: '#707070',
    borderBottomWidth: 1,
    backgroundColor: '#212937',
    paddingTop: 30,
    marginBottom: 16,
  },
})
