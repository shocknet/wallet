/**
 * @prettier
 */
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

import moment from 'moment'

import { Colors } from '../../css'

/**
 * @typedef {object} Props
 * @prop {string} body
 * @prop {string} id
 * @prop {((id: string) => void)=} onPress
 * @prop {boolean=} outgoing
 * @prop {string} senderName
 * @prop {number} timestamp
 */

/**
 * @augments React.PureComponent<Props>
 */
export default class ChatMessage extends React.PureComponent {
  componentDidMount() {
    /**
     * Force-updates every minute so moment-formatted dates refresh.
     */
    this.intervalID = setInterval(() => {
      this.forceUpdate()
    }, 60000)
  }

  componentWillUnmount() {
    typeof this.intervalID === 'number' && clearInterval(this.intervalID)
  }

  onPress = () => {
    const { id, onPress } = this.props

    onPress && onPress(id)
  }

  render() {
    const { body, outgoing, senderName, timestamp } = this.props

    return (
      <TouchableOpacity onPress={this.onPress}>
        <View style={outgoing ? styles.container : styles.containerOutgoing}>
          <Text style={outgoing ? styles.name : styles.nameOutgoing}>
            {senderName}
          </Text>

          <Text style={styles.timestamp}>{moment(timestamp).fromNow()}</Text>

          <Text style={styles.body}>{body}</Text>
        </View>
      </TouchableOpacity>
    )
  }
}

const name = {
  color: Colors.BLUE_DARK,
  fontSize: 14,
  fontWeight: /** @type {'bold'} */ ('bold'),
}

const CONTAINER_HORIZONTAL_PADDING = 12
const CONTAINER_VERTICAL_PADDING = 18

const container = {
  alignItems: /** @type {'flex-start'} */ ('flex-start'),
  backgroundColor: Colors.BLUE_LIGHTEST,
  borderRadius: 10,
  justifyContent: /** @type {'center'} */ ('center'),
  margin: 15,
  paddingBottom: CONTAINER_VERTICAL_PADDING,
  paddingLeft: CONTAINER_HORIZONTAL_PADDING,
  paddingRight: CONTAINER_HORIZONTAL_PADDING,
  paddingTop: CONTAINER_VERTICAL_PADDING,
}

const styles = StyleSheet.create({
  body: {
    color: Colors.TEXT_STANDARD,
    fontSize: 15,
    marginTop: 8,
  },
  container,
  containerOutgoing: {
    ...container,
    backgroundColor: Colors.GRAY_MEDIUM,
  },
  name,
  nameOutgoing: {
    ...name,
    color: Colors.TEXT_STANDARD,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.TEXT_LIGHT,
  },
})
