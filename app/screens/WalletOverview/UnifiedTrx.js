/**
 * @format
 */
import React from 'react'

import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import * as Wallet from '../../services/wallet'
import * as CSS from '../../css'

import UnifiedTransaction from './UnifiedTransaction'
/**
 * @typedef {import('./UnifiedTransaction').IUnifiedTransaction} IUnifiedTransaction
 */

/** @type {React.FC} */
const Separator = () => <View style={styles.separator} />

/** @type {React.FC} */
const Empty = () => ((
  <View>
    <Text>No recent transactions</Text>
  </View>
))

/**
 * @typedef {object} Props
 * @prop {((payReqOrPaymentHashOrTxHash: string) => void)=} onPressItem
 * (Optional)
 * @prop {IUnifiedTransaction[]|null} unifiedTrx Null when loading. When loading
 * a loading indicator will be shown.
 */

/**
 * @param {IUnifiedTransaction} unifiedTransaction
 * @returns {string}
 */
const keyExtractor = unifiedTransaction => {
  if (Wallet.isInvoice(unifiedTransaction)) {
    return unifiedTransaction.payment_request
  }

  if (Wallet.isPayment(unifiedTransaction)) {
    return unifiedTransaction.payment_hash
  }

  if (Wallet.isTransaction(unifiedTransaction)) {
    return unifiedTransaction.tx_hash
  }

  throw new TypeError(
    'UnifiedTrx.prototype.keyExtractor: unknown item type found',
  )
}

/**
 * @augments React.PureComponent<Props, {}, never>
 */
export default class UnifiedTransactions extends React.PureComponent {
  /**
   * @type {import('react-native').ListRenderItem<IUnifiedTransaction>}
   */
  renderItem = ({ item }) => {
    return ((
      <UnifiedTransaction
        unifiedTransaction={item}
        // onPress={this.props.onPressItem}
      />
    ))
  }

  render() {
    const { unifiedTrx } = this.props

    if (unifiedTrx === null) {
      return <ActivityIndicator />
    }

    const filtered = unifiedTrx.filter(unifiedTransaction => {
      if (Wallet.isInvoice(unifiedTransaction)) {
        return unifiedTransaction.settled
      }

      if (Wallet.isPayment(unifiedTransaction)) {
        return true
      }

      if (Wallet.isTransaction(unifiedTransaction)) {
        return true
      }

      console.warn(
        `<UnifiedTrx /> -> render() -> unknown kind of item found: ${JSON.stringify(
          unifiedTransaction,
        )}`,
      )

      return false
    })

    filtered.sort((a, b) => {
      const _a = (() => {
        if (Wallet.isInvoice(a)) {
          return Number(a.settle_date)
        }

        if (Wallet.isPayment(a)) {
          return Number(a.creation_date)
        }

        if (Wallet.isTransaction(a)) {
          return Number(a.time_stamp)
        }

        return 0
      })()

      const _b = (() => {
        if (Wallet.isInvoice(b)) {
          return Number(b.settle_date)
        }

        if (Wallet.isPayment(b)) {
          return Number(b.creation_date)
        }

        if (Wallet.isTransaction(b)) {
          return Number(b.time_stamp)
        }

        return 0
      })()

      return _b - _a
    })

    return (
      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={Empty}
        renderItem={this.renderItem}
      />
    )
  }
}

const styles = StyleSheet.create({
  separator: {
    backgroundColor: CSS.Colors.GRAY_MEDIUM,
    height: 1,
    width: '100%',
  },
})
