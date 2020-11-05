import React from 'react'
import Logger from 'react-native-file-log'

import TXBase from './TXBase'

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
 * @prop {string} id Preimage
 * @prop {(id: string) => void} onPressUnpaidIncomingInvoice Only called for
 * unpaid incoming invoices.
 * @prop {boolean} outgoing
 * @prop {PaymentStatus|undefined} paymentStatus
 * @prop {string} senderName
 * @prop {number} timestamp
 */

/**
 * @augments React.PureComponent<Props>
 */
export default class ChatInvoice extends React.PureComponent {
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
    const { paymentStatus } = this.props

    if (typeof paymentStatus === 'undefined') {
      Logger.log(
        `<ChatInvoice /> -> onPress() -> paymentStatus prop is undefined`,
      )
      return
    }

    if (paymentStatus === 'UNPAID') {
      onPressUnpaidIncomingInvoice(id)
    } else {
      Logger.log(
        `<ChatInvoice /> -> onPress() -> paymentStatus prop is 'UNPAID', skipping onPress call`,
      )
    }
  }

  /**
   * @returns {import('./TXBase').Type}
   */
  getTXType() {
    switch (this.props.paymentStatus) {
      case 'FAILED':
        return 'invoice-err'

      case 'IN_FLIGHT':
        return 'invoice-settling'

      case 'PAID':
        return 'invoice-settled'

      case 'UNKNOWN':
        return 'invoice-unk'

      case 'UNPAID':
      case undefined:
        return 'invoice'
      default:
        throw new TypeError(
          `Illegal paymentStatus prop passed to <ChatInvoice />, got: ${this.props.paymentStatus}`,
        )
    }
  }

  render() {
    return (
      <TXBase
        amt={this.props.amount}
        outgoing={this.props.outgoing}
        onPress={this.onPress}
        onPressDetails={this.onPress}
        otherDisplayName={this.props.senderName}
        preimage={this.props.id}
        timestamp={this.props.timestamp}
        type={this.getTXType()}
      />
    )
  }
}
