/**
 * This component for now will only render on-chain transactions, outbound
 * payments and settled invoices, basically actual money movements and not
 * drafts, orders or unsettled invoices.
 *
 * Decoded invoices do not contain settlement information so we ignore them for
 * now.
 *
 * Added invoices are outbound but could be settled, most likely recently so
 * we'll rely on its listed counterpart and ignore the added one.
 *
 * In the future we might need to use decoded invoices for orders.
 */
import React from 'react'

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import moment from 'moment'
import { Schema } from 'shock-common'
import { connect } from 'react-redux'

import * as CSS from '../../res/css'
import btcConvert from '../../services/convertBitcoin'
import Pad from '../../components/Pad'
import * as Store from '../../../store'

const OUTBOUND_INDICATOR_RADIUS = 20

export type IUnifiedTransaction = Schema.InvoiceWhenListed

interface DispatchProps {}

interface StateProps {
  value: number
  timestamp: number
  outbound: boolean
  description: string

  USDRate: number

  err?: string
}

export interface OwnProps {
  payReq?: string
}

type Props = DispatchProps & StateProps & OwnProps

export class UnifiedTransaction extends React.PureComponent<Props> {
  render() {
    const { err, USDRate, description, outbound, timestamp, value } = this.props

    if (err) {
      return <Text>{err}</Text>
    }

    const formattedTimestamp = moment.unix(timestamp).fromNow()
    const convertedBalance = (
      Math.round(
        btcConvert(value.toString(), 'Satoshi', 'BTC') * USDRate * 100,
      ) / 100
    ).toLocaleString()

    return (
      <TouchableOpacity style={styles.item}>
        <View style={styles.avatar}>
          <View style={styles.outboundIndicator}>
            {outbound ? (
              <Ionicons
                name="md-arrow-round-up"
                size={15}
                color={CSS.Colors.ICON_RED}
              />
            ) : (
              <Ionicons
                name="md-arrow-round-down"
                size={15}
                color={CSS.Colors.ICON_GREEN}
              />
            )}
          </View>
        </View>
        <Pad amount={10} insideRow />
        <View style={styles.memo}>
          <Text
            style={styles.senderName}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {'hash'}
          </Text>
          <Text style={styles.memoText}>{description}</Text>
        </View>
        <View style={styles.valuesContainer}>
          <Text style={styles.timestamp}>{formattedTimestamp + ' ago'}</Text>
          <Text style={styles.value}>
            +{value.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,')}
          </Text>
          <Text style={styles.USDValue}>{convertedBalance} USD</Text>
        </View>
      </TouchableOpacity>
    )
  }
}

const makeMapStateToProps = () => {
  const getInvoice = Store.makeGetInvoice()

  return (state: Store.State, props: OwnProps): StateProps => {
    const tx = getInvoice(
      state,
      props as Required<OwnProps> /* we just checked for props.payReq */,
    ) as Schema.InvoiceWhenListed /* We know we'll only be using InvoiceWhenListed for now. */

    try {
      return {
        USDRate:
          ((state.wallet
            .USDRate /* Typings fucked we know it's a number or null*/ as unknown) as
            | number
            | null) || 0,
        description: tx.memo,
        outbound: false,
        timestamp: Number(tx.settle_date),
        value: Number(tx.amt_paid_sat),
      }
    } catch (err) {
      return {
        err: err.message,
      } as StateProps
    }
  }
}

const ConnectedUnifiedTransaction = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  Store.State
>(makeMapStateToProps)(UnifiedTransaction)

export default ConnectedUnifiedTransaction

const styles = StyleSheet.create({
  item: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    paddingVertical: 15,
  },

  avatar: {
    width: 45,
    height: 45,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    backgroundColor: CSS.Colors.FUN_BLUE,
    borderRadius: 100,
  },

  outboundIndicator: {
    width: OUTBOUND_INDICATOR_RADIUS,
    height: OUTBOUND_INDICATOR_RADIUS,
    elevation: 5,
    transform: [
      { translateX: OUTBOUND_INDICATOR_RADIUS / 4 },
      { translateY: OUTBOUND_INDICATOR_RADIUS / 4 },
    ],
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CSS.Colors.BACKGROUND_WHITE,
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
