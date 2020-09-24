import React from 'react'

import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  ListRenderItem,
} from 'react-native'
import { connect } from 'react-redux'
import Ionicons from 'react-native-vector-icons/Ionicons'

import * as Wallet from '../../services/wallet'
import * as CSS from '../../res/css'
import * as Store from '../../../store'

import UnifiedTransaction, { IUnifiedTransaction } from './UnifiedTransaction'

const Separator = () => <View style={styles.separator} />

const Empty = () => (
  <View style={styles.emptyContainer}>
    <Ionicons
      name="ios-alert"
      size={60}
      color={CSS.Colors.TEXT_GRAY_LIGHTEST}
      style={styles.emptyIcon}
    />
    <Text style={styles.emptyText}>No recent transactions</Text>
  </View>
)

interface Props {
  onPressItem?: (payReqOrPaymentHashOrTxHash: string) => void

  /**
   *  Null when loading. When loading a loading indicator will be shown.
   */
  unifiedTrx: IUnifiedTransaction[] | null

  wallet: { USDRate: number }
}

const keyExtractor = (unifiedTransaction: IUnifiedTransaction): string => {
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

class UnifiedTransactions extends React.PureComponent<Props> {
  renderItem: ListRenderItem<IUnifiedTransaction> = ({ item }) => {
    const { USDRate } = this.props.wallet
    return (
      <UnifiedTransaction
        unifiedTransaction={item}
        // onPress={this.props.onPressItem}
        USDRate={USDRate}
      />
    )
  }

  render() {
    const { unifiedTrx } = this.props

    if (unifiedTrx === null) {
      return (
        <>
          <Text style={styles.listTitleDark}>Recent Activity</Text>
          <ActivityIndicator size="large" color={CSS.Colors.ORANGE} />
        </>
      )
    }

    return (
      <>
        {unifiedTrx ? (
          <Text style={styles.listTitleDark}>Recent Activity</Text>
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

const mapStateToProps = ({ wallet }: Store.State) => ({
  wallet,
})

// @ts-ignore TODO TODO
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
  // listTitle: {
  //   textAlign: 'right',
  //   fontFamily: 'Montserrat-600',
  //   width: '100%',
  //   marginBottom: 20,
  // },
  listTitleDark: {
    textAlign: 'left',
    fontFamily: 'Montserrat-600',
    width: '100%',
    marginBottom: 20,
    fontSize: 13,
    color: CSS.Colors.TEXT_WHITE,
  },
})
