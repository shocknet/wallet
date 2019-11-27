/**
 * @format
 */
import React from 'react'

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Entypo from 'react-native-vector-icons/Entypo'
import moment from 'moment'

import * as Wallet from '../../services/wallet'
import * as CSS from '../../css'
import Pad from '../../components/Pad'

/**
 * @typedef {Wallet.Invoice|Wallet.Payment|Wallet.Transaction} IUnifiedTransaction
 */

/**
 * @typedef {object} Props
 * @prop {IUnifiedTransaction} unifiedTransaction
 * @prop {((payReqOrPaymentHashOrTxHash: string) => void)=} onPress
 */

/**
 * "Component" suffix in name to avoid collision with Transaction interface.
 * @augments React.PureComponent<Props, {}, never>
 */
export default class UnifiedTransaction extends React.PureComponent {
  state = {}

  onPress = () => {
    const { onPress, unifiedTransaction } = this.props

    if (!onPress) {
      return
    }

    if (Wallet.isInvoice(unifiedTransaction)) {
      onPress(unifiedTransaction.payment_request)
    }

    if (Wallet.isPayment(unifiedTransaction)) {
      onPress(unifiedTransaction.payment_hash)
    }

    if (Wallet.isTransaction(unifiedTransaction)) {
      onPress(unifiedTransaction.tx_hash)
    }
  }

  render() {
    const { unifiedTransaction } = this.props

    let value = 0
    let timestamp = 0
    let outbound = false
    let description = ''

    if (Wallet.isInvoice(unifiedTransaction)) {
      description = unifiedTransaction.memo
      value = Number(unifiedTransaction.value)
      timestamp =
        unifiedTransaction.settle_date === '0'
          ? Number(unifiedTransaction.creation_date)
          : Number(unifiedTransaction.settle_date)

      outbound = false
    }

    if (Wallet.isPayment(unifiedTransaction)) {
      description = 'Payment'
      value = Number(unifiedTransaction.value_sat)
      timestamp = Number(unifiedTransaction.creation_date)

      outbound = true
    }

    if (Wallet.isTransaction(unifiedTransaction)) {
      description = 'BTC Chain Transaction'
      value = Number(unifiedTransaction.amount)
      timestamp = Number(unifiedTransaction.time_stamp)

      // we don't know yet
      outbound = false
    }

    const formattedTimestamp = moment.unix(timestamp).fromNow()

    return (
      <TouchableOpacity onPress={this.onPress}>
        <View style={styles.item}>
          <Entypo
            color={CSS.Colors.GRAY_MEDIUM}
            name={outbound ? 'arrow-with-circle-up' : 'arrow-with-circle-down'}
            size={48}
          />
          <Pad amount={10} insideRow />
          <View style={styles.memo}>
            <Text style={styles.memoText}>{description}</Text>
          </View>
          <View style={{ alignSelf: 'flex-end' }}>
            <Text style={styles.timestamp}>{formattedTimestamp + ' ago'}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  item: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 16,
    paddingRight: 16,
  },

  memo: {
    alignItems: 'flex-start',
    flex: 1,
    justifyContent: 'center',
  },

  memoText: {
    color: CSS.Colors.TEXT_GRAY,
  },

  timestamp: {
    color: CSS.Colors.TEXT_LIGHT,
  },

  value: {
    color: CSS.Colors.TEXT_LIGHT,
  },
})
