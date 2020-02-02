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
import { connect } from 'react-redux'
import Ionicons from 'react-native-vector-icons/Ionicons'

import * as Wallet from '../../services/wallet'
import * as CSS from '../../res/css'

import UnifiedTransaction from './UnifiedTransaction'

/**
 * @typedef {import('./UnifiedTransaction').IUnifiedTransaction} IUnifiedTransaction
 */

/**
 * @typedef {ReturnType<typeof mapStateToProps>} ConnectedRedux
 */

/** @type {React.FC} */
const Separator = () => <View style={styles.separator} />

/** @type {React.FC} */
const Empty = () => ((
  <View style={styles.emptyContainer}>
    <Ionicons
      name="ios-alert"
      size={60}
      color={CSS.Colors.TEXT_GRAY_LIGHTEST}
      style={styles.emptyIcon}
    />
    <Text style={styles.emptyText}>No recent transactions</Text>
  </View>
))

/**
 * @typedef {ConnectedRedux & object} Props
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
class UnifiedTransactions extends React.PureComponent {
  /**
   * @type {import('react-native').ListRenderItem<IUnifiedTransaction>}
   */
  renderItem = ({ item }) => {
    const { USDRate } = this.props.wallet
    return ((
      <UnifiedTransaction
        unifiedTransaction={item}
        // onPress={this.props.onPressItem}
        USDRate={USDRate}
      />
    ))
  }

  render() {
    const { unifiedTrx } = this.props

    if (unifiedTrx === null) {
      return (
        <>
          <Text style={styles.listTitle}>Recent Transactions</Text>
          <ActivityIndicator size="large" color={CSS.Colors.ORANGE} />
        </>
      )
    }

    return (
      <>
        {unifiedTrx ? (
          <Text style={styles.listTitle}>Recent Transactions</Text>
        ) : null}
        <FlatList
          data={unifiedTrx}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={Separator}
          ListEmptyComponent={Empty}
          renderItem={this.renderItem}
        />
      </>
    )
  }
}

/**
 * @param {typeof import('../../../reducers/index').default} state
 */
const mapStateToProps = ({ wallet }) => ({
  wallet,
})

export default connect(mapStateToProps)(UnifiedTransactions)

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyIcon: {
    marginTop: 30,
    opacity: 0.5,
  },
  emptyText: {
    color: CSS.Colors.TEXT_GRAY_LIGHTEST,
    fontFamily: 'Montserrat-700',
    textAlign: 'center',
    opacity: 0.5,
  },
  separator: {
    backgroundColor: CSS.Colors.GRAY_MEDIUM,
    height: 0,
    width: '100%',
  },
  listTitle: {
    textAlign: 'right',
    fontFamily: 'Montserrat-600',
    width: '100%',
    marginBottom: 20,
  },
})
