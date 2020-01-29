import React from 'react'
import { View, StyleSheet } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'

import * as API from '../../services/contact-api'
import * as Cache from '../../services/cache'
import * as CSS from '../../res/css'

/**
 * @typedef {object} Props
 * @prop {boolean} focused
 */

/**
 * @typedef {object} State
 * @prop {API.Schema.Chat[]} chats
 * @prop {Cache.LastReadMsgs} lastReads
 */

/**
 * @augments React.Component<Props, State, never>
 */
export default class TabBarIcon extends React.Component {
  /** @type {State} */
  state = {
    chats: [],
    lastReads: {},
  }

  componentDidMount() {
    this.onChatsUnsub = API.Events.onChats(chats => this.setState({ chats }))

    this.lastReadsUnsub = Cache.onLastReadMsgs(lastReads =>
      this.setState({ lastReads }),
    )
  }

  render() {
    const { focused } = this.props
    const { chats, lastReads } = this.state

    const allRead =
      chats.filter(c => {
        const lastMsg = c.messages[c.messages.length - 1]
        const tstamp = lastReads[c.recipientPublicKey]
        return lastMsg && tstamp && lastMsg.timestamp <= tstamp
      }).length === chats.length

    const unread = !allRead

    return (
      <View>
        <Ionicons
          color={
            focused ? CSS.Colors.BLUE_MEDIUM_DARK : CSS.Colors.GRAY_MEDIUM_LIGHT
          }
          name="md-chatboxes"
          // This one has to be larger than the others to match the design
          size={36}
        />

        {unread && <View style={styles.unreadDot} />}
      </View>
    )
  }
}

const unreadDotSize = 8
const unreadDotRadius = unreadDotSize / 2

/* eslint-disable react-native/no-color-literals */
const styles = StyleSheet.create({
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: CSS.Colors.CAUTION_YELLOW,
    height: unreadDotSize,
    width: unreadDotSize,
    borderRadius: unreadDotRadius,
  },
})

/* eslint-enable react-native/no-color-literals */
