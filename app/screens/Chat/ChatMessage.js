/**
 * @prettier
 */
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import moment from 'moment'
import { Svg, Polygon } from 'react-native-svg'

import { Colors, WIDTH } from '../../res/css'
import ShockAvatar from '../../components/ShockAvatar'
import Pad from '../../components/Pad'

const BUBBLE_TRIANGLE_VERTICAL_OFFSET = 6

/**
 * @typedef {object} Props
 * @prop {string} body
 * @prop {string} id
 * @prop {((id: string) => void)=} onPress
 * @prop {boolean=} outgoing
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
    const { body, outgoing, timestamp } = this.props

    const formattedTime = moment(timestamp).format('hh:mm')

    const SVG_EDGE = 25
    const UNIT = SVG_EDGE / 5
    const ZERO = UNIT * 0
    const THREE = UNIT * 3
    const FOUR = UNIT * 4
    const FIVE = UNIT * 5

    return (
      <View style={styles.container}>
        {!outgoing && (
          <>
            <View style={styles.avatarContainer}>
              <ShockAvatar height={40} image={null} />
            </View>
            <Pad insideRow amount={20} />
          </>
        )}

        {outgoing && (
          <>
            <Text style={styles.timestamp}>{formattedTime}</Text>
            <Pad insideRow amount={12} />
          </>
        )}

        <View>
          <View style={[styles.bubble, outgoing && styles.bubbleOutgoing]}>
            <TouchableOpacity onPress={this.onPress}>
              <Text style={styles.body}>{body}</Text>
            </TouchableOpacity>
          </View>

          <Svg
            height={SVG_EDGE}
            width={SVG_EDGE}
            style={outgoing ? styles.arrowOutgoing : styles.arrow}
          >
            <Polygon
              points={
                outgoing
                  ? `${ZERO},${THREE} ${FOUR},${ZERO} ${FIVE},${FIVE}`
                  : `${ZERO},${FIVE} ${UNIT},${ZERO} ${FIVE},${THREE}`
              }
              fill={outgoing ? Colors.ORANGE : Colors.BLUE_MEDIUM_DARK}
              strokeWidth="0"
            />
          </Svg>
        </View>

        {!outgoing && (
          <>
            <Pad insideRow amount={12} />
            <Text style={styles.timestamp}>{formattedTime}</Text>
          </>
        )}
      </View>
    )
  }
}

const BUBBLE_VERTICAL_PADDING = 14
const BUBBLE_HORIZONTAL_PADDING = 22.5

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    paddingBottom: BUBBLE_TRIANGLE_VERTICAL_OFFSET,
  },

  avatarContainer: {
    marginBottom: -BUBBLE_TRIANGLE_VERTICAL_OFFSET,
  },

  arrow: {
    position: 'absolute',
    bottom: -BUBBLE_TRIANGLE_VERTICAL_OFFSET,
    left: 0,
  },

  arrowOutgoing: {
    position: 'absolute',
    bottom: -BUBBLE_TRIANGLE_VERTICAL_OFFSET,
    right: 0,
  },

  bubble: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    maxWidth: WIDTH * 0.55,
    minWidth: WIDTH * 0.18,
    paddingTop: BUBBLE_VERTICAL_PADDING,
    paddingBottom: BUBBLE_VERTICAL_PADDING,
    paddingLeft: BUBBLE_HORIZONTAL_PADDING,
    paddingRight: BUBBLE_HORIZONTAL_PADDING,
    backgroundColor: Colors.BLUE_MEDIUM_DARK,
    borderRadius: 24,
  },

  bubbleOutgoing: {
    backgroundColor: Colors.ORANGE,
  },

  body: {
    color: Colors.TEXT_WHITE,
    fontSize: 10,
    fontFamily: 'Montserrat-700',
  },

  timestamp: {
    alignSelf: 'center',
    fontSize: 10,
    fontFamily: 'Montserrat-500',
    color: '#A59797',
  },
})
