/**
 * @prettier
 */
import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import Entypo from 'react-native-vector-icons/Entypo'

import moment from 'moment'

import { Colors } from '../../css'

/**
 * @typedef {object} _PaymentStatus
 * @prop {string} UNKNOWN If a payment is found for an incoming invoice and
 * payment status is UNKNOWN.
 * @prop {string} PAID If an outgoing invoice's status is SETTLED, or a payment
 * for an incoming invoice is found and its status is SUCCEEDED.
 * @prop {string} FAILED If a payment is found for an incoming invoice, and its
 * status is FAILED.
 * @prop {string} IN_FLIGHT If a payment is found for an incoming invoice, and
 * its status is IN_FLIGHT.
 * @prop {string} UNPAID If no payment is found for an incoming invoice.
 */

/**
 * @typedef {keyof _PaymentStatus} PaymentStatus
 */

/**
 * @typedef {object} Props
 * @prop {number|undefined} amount
 * @prop {string} id
 * @prop {((id: string) => void)} onPressUnpaidIncomingInvoice Only called for
 * unpaid incoming invoices.
 * @prop {boolean=} outgoing
 * @prop {PaymentStatus|undefined} paymentStatus
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
    const { id, onPressUnpaidIncomingInvoice } = this.props
    const { amount, outgoing, paymentStatus } = this.props

    if (
      typeof amount === 'undefined' ||
      typeof paymentStatus === 'undefined' ||
      outgoing
    ) {
      return
    }

    if (paymentStatus === 'UNPAID') {
      onPressUnpaidIncomingInvoice(id)
    }
  }

  renderPaymentStatus() {
    const { amount, outgoing, paymentStatus } = this.props

    if (typeof amount === 'undefined' || typeof paymentStatus === 'undefined') {
      return <ActivityIndicator />
    }

    switch (paymentStatus) {
      case 'FAILED': {
        return (
          <View>
            <Text style={styles.body}>{amount + ' sats'}</Text>
            <Text>Payment failed.</Text>
          </View>
        )
      }

      case 'IN_FLIGHT': {
        return (
          <View>
            <Text style={styles.body}>{amount + ' sats'}</Text>
            <Text>Payment being processed</Text>
          </View>
        )
      }

      case 'PAID': {
        return (
          <View>
            <Text style={styles.body}>{amount + ' sats'}</Text>
            <Entypo name="check" />
          </View>
        )
      }

      case 'UNKNOWN': {
        return (
          <View>
            <Text style={styles.body}>{amount + ' sats'}</Text>
            {<Text>Unknown payment status</Text>}
          </View>
        )
      }

      case 'UNPAID': {
        return (
          <View>
            <Text style={styles.body}>{amount + ' sats'}</Text>
            {!outgoing && <Text>Press here to Pay</Text>}
          </View>
        )
      }
    }
  }

  render() {
    const { outgoing, senderName, timestamp } = this.props

    return (
      <TouchableOpacity onPress={this.onPress}>
        <View style={outgoing ? styles.container : styles.containerOutgoing}>
          <Text style={outgoing ? styles.name : styles.nameOutgoing}>
            {senderName}
          </Text>

          <Text style={styles.timestamp}>{moment(timestamp).fromNow()}</Text>

          <View style={[styles.row, styles.alignItemsCenter]}>
            <Entypo color={Colors.BLUE_DARK} name="text-document" size={32} />
            {this.renderPaymentStatus()}
          </View>
        </View>
      </TouchableOpacity>
    )
  }
}

const name = {
  color: Colors.BLUE_DARK,
  fontSize: 14,
  fontWeight: 'bold',
}

const CONTAINER_HORIZONTAL_PADDING = 12
const CONTAINER_VERTICAL_PADDING = 18

const container = {
  alignItems: 'flex-start',
  backgroundColor: Colors.BLUE_LIGHTEST,
  borderRadius: 10,
  justifyContent: 'center',
  margin: 15,
  paddingBottom: CONTAINER_VERTICAL_PADDING,
  paddingLeft: CONTAINER_HORIZONTAL_PADDING,
  paddingRight: CONTAINER_HORIZONTAL_PADDING,
  paddingTop: CONTAINER_VERTICAL_PADDING,
}

const styles = StyleSheet.create({
  alignItemsCenter: {
    alignItems: 'center',
  },

  body: {
    color: Colors.TEXT_STANDARD,
    fontSize: 15,
    marginTop: 8,
  },
  // @ts-ignore
  container,
  // @ts-ignore
  containerOutgoing: {
    ...container,
    backgroundColor: Colors.GRAY_MEDIUM,
  },
  // @ts-ignore
  name,
  // @ts-ignore
  nameOutgoing: {
    ...name,
    color: Colors.TEXT_STANDARD,
  },

  row: {
    flexDirection: 'row',
  },

  timestamp: {
    fontSize: 12,
    color: Colors.TEXT_LIGHT,
  },
})
