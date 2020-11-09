import React from 'react'

import TXBase from './TXBase'

/**
 * @typedef {object} Props
 * @prop {number} amt
 * @prop {string} memo
 * @prop {string} id Can be the preimage for existing spontaneous payments, or
 * the temp id for in-transit spontaneous payments.
 * @prop {(id: string) => void} onPress
 * @prop {boolean} outgoing
 * @prop {string} preimage
 * @prop {string|null} recipientDisplayName
 * @prop {'in-flight'|'sent'|'error'} state
 * @prop {number} timestamp
 */

/**
 * @augments React.PureComponent<Props>
 */
export default class SpontPayment extends React.PureComponent {
  onPress = () => {
    const { onPress, id } = this.props
    onPress && onPress(id)
  }

  render() {
    return (
      <TXBase
        amt={this.props.amt}
        onPressDetails={this.onPress}
        otherDisplayName={this.props.recipientDisplayName}
        outgoing={this.props.outgoing}
        preimage={this.props.preimage}
        timestamp={this.props.timestamp}
        type={(() => {
          const { state } = this.props

          if (state === 'error') {
            return 'payment-err'
          }

          if (state === 'in-flight') {
            return 'payment-sending'
          }

          if (state === 'sent') {
            return 'payment-sent'
          }

          throw new Error(
            `Illegal value supplied for state prop in <SpontPayment />`,
          )
        })()}
      />
    )
  }
}
