import React from 'react'

import { FlatList, StyleSheet, Text, View, ListRenderItem } from 'react-native'
import { connect } from 'react-redux'
import Ionicons from 'react-native-vector-icons/Ionicons'

import * as CSS from '../../res/css'
import * as Store from '../../store'

import UnifiedTransaction, {
  OwnProps as UnifiedTransactionProps,
} from './UnifiedTransaction'

interface DispatchProps {}

interface StateProps {
  /**
   *  Null when loading. When loading a loading indicator will be shown.
   */
  unifiedTrx: Store.UnifiedTx[]
}

export interface OwnProps {}

type Props = DispatchProps & StateProps & OwnProps

class UnifiedTrx extends React.PureComponent<Props> {
  render() {
    const { unifiedTrx } = this.props

    return (
      <>
        <Text style={styles.listTitleDark}>Recent Activity</Text>
        <FlatList
          data={unifiedTrx}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={Separator}
          ListEmptyComponent={empty}
          renderItem={RenderItem}
        />
      </>
    )
  }
}

const mapStateToProps = (state: Store.State): StateProps => {
  return {
    unifiedTrx: Store.getLatestTx(state),
  }
}

const ConnectedUnifiedTrx = connect(mapStateToProps)(UnifiedTrx)

export default ConnectedUnifiedTrx

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
  listTitleDark: {
    textAlign: 'left',
    fontFamily: 'Montserrat-600',
    width: '100%',
    marginBottom: 20,
    fontSize: 13,
    color: CSS.Colors.TEXT_WHITE,
  },
})

const keyExtractor = (item: Store.UnifiedTx) => {
  if (item.type === 'invoice') return item.payReq
  if (item.type === 'chain') return item.chainTXHash
  if (item.type === 'payment') return item.paymentHash
  if (item.type === 'tip') return item.publicKey
  throw new TypeError(
    `<UnifiedTrx /> -> Unknown Kind of TX: ${JSON.stringify(item)}`,
  )
}

const Separator = () => <View style={styles.separator} />

const empty = (
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

const RenderItem: ListRenderItem<Store.UnifiedTx> = ({ item }) => {
  const props: UnifiedTransactionProps = {}

  if (item.type === 'invoice') props.payReq = item.payReq
  if (item.type === 'payment') props.paymentHash = item.paymentHash
  if (item.type === 'chain') props.chainTXHash = item.chainTXHash
  if (item.type === 'tip') props.tippingPublicKey = item.publicKey

  return <UnifiedTransaction {...props} />
}
