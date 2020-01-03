/**
 * @format
 */
import React from 'react'

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import moment from 'moment'

import * as Wallet from '../../services/wallet'
import * as CSS from '../../res/css'
import btcConvert from '../../services/convertBitcoin'
import Pad from '../../components/Pad'

/**
 * @typedef {Wallet.Invoice|Wallet.Payment|Wallet.Transaction} IUnifiedTransaction
 */

/**
 * @typedef {object} Props
 * @prop {IUnifiedTransaction} unifiedTransaction
 * @prop {((payReqOrPaymentHashOrTxHash: string) => void)=} onPress
 * @prop {number} USDRate
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
    const { unifiedTransaction, USDRate } = this.props

    let hash = ''
    let value = '0'
    let timestamp = 0
    let outbound = false
    let description = ''

    if (Wallet.isInvoice(unifiedTransaction)) {
      hash = unifiedTransaction.payment_request
      description = unifiedTransaction.memo
      // eslint-disable-next-line prefer-destructuring
      value = unifiedTransaction.value
      timestamp =
        unifiedTransaction.settle_date === '0'
          ? Number(unifiedTransaction.creation_date)
          : Number(unifiedTransaction.settle_date)

      outbound = false
    }

    if (Wallet.isPayment(unifiedTransaction)) {
      hash = unifiedTransaction.decodedPayment
        ? unifiedTransaction.decodedPayment.destination
        : 'Unknown'
      description = 'Payment'
      value = unifiedTransaction.value_sat
      timestamp = Number(unifiedTransaction.creation_date)

      outbound = true
    }

    if (Wallet.isTransaction(unifiedTransaction)) {
      hash = unifiedTransaction.tx_hash
      description = 'BTC Chain Transaction'
      value = unifiedTransaction.amount
      timestamp = Number(unifiedTransaction.time_stamp)

      // we don't know yet
      outbound = false
    }

    const formattedTimestamp = moment.unix(timestamp).fromNow()
    const BTCBalance = btcConvert(value, 'Satoshi', 'bit')
    const convertedBalance = (
      Math.round(btcConvert(value, 'Satoshi', 'BTC') * USDRate * 100) / 100
    ).toLocaleString()

    return (
      <TouchableOpacity style={styles.item} onPress={this.onPress}>
        <View style={styles.avatar}>
          {outbound ? (
            <Ionicons
              name="ios-arrow-up"
              size={25}
              color={CSS.Colors.TEXT_WHITE}
            />
          ) : (
            <Ionicons
              name="ios-arrow-down"
              size={25}
              color={CSS.Colors.TEXT_WHITE}
            />
          )}
        </View>
        <Pad amount={10} insideRow />
        <View style={styles.memo}>
          <Text
            style={styles.senderName}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {hash}
          </Text>
          <Text style={styles.memoText}>{description}</Text>
        </View>
        <View style={styles.valuesContainer}>
          <Text style={styles.timestamp}>{formattedTimestamp + ' ago'}</Text>
          <Text style={styles.value}>+{BTCBalance.toLocaleString()}</Text>
          <Text style={styles.USDValue}>{convertedBalance} USD</Text>
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  item: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    paddingVertical: 15,
  },

  avatar: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CSS.Colors.FUN_BLUE,
    borderRadius: 100,
  },

  memo: {
    alignItems: 'flex-start',
    flex: 1,
    justifyContent: 'center',
  },

  senderName: {
    width: '50%',
    color: CSS.Colors.TEXT_GRAY,
    fontSize: 16,
    fontFamily: 'Montserrat-700',
  },

  memoText: {
    color: CSS.Colors.TEXT_GRAY,
    fontSize: 11,
    fontFamily: 'Montserrat-500',
  },

  valuesContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },

  timestamp: {
    color: CSS.Colors.TEXT_DARK_WHITE,
    fontFamily: 'Montserrat-700',
    fontSize: 9,
  },

  value: {
    color: CSS.Colors.TEXT_LIGHT,
    fontFamily: 'Montserrat-600',
    fontSize: 15,
  },

  USDValue: {
    color: CSS.Colors.TEXT_ORANGE,
    fontFamily: 'Montserrat-700',
    fontSize: 10,
  },
})
