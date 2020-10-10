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

import { ConnectedShockAvatar } from '../../components/ShockAvatar'
import * as CSS from '../../res/css'
import btcConvert from '../../services/convertBitcoin'
import Pad from '../../components/Pad'
import * as Store from '../../../store'

const OUTBOUND_INDICATOR_RADIUS = 20

interface DispatchProps {}

interface StateProps {
  value: number
  timestamp: number
  outbound: boolean
  title: string
  subTitle: string
  relatedPublickey?: string

  USDRate: number

  err?: string
}

export interface OwnProps {
  payReq?: string
  paymentHash?: string
  chainTXHash?: string
}

type Props = DispatchProps & StateProps & OwnProps

export class UnifiedTransaction extends React.PureComponent<Props> {
  render() {
    const {
      err,
      USDRate,
      outbound,
      timestamp,
      value,
      title,
      subTitle,
      relatedPublickey,
    } = this.props

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
        {relatedPublickey ? (
          <View>
            <View style={styles.outboundIndicator2}>
              {outbound ? (
                <Ionicons
                  name="md-arrow-round-up"
                  size={15}
                  color={CSS.Colors.ICON_GREEN}
                />
              ) : (
                <Ionicons
                  name="md-arrow-round-down"
                  size={15}
                  color={CSS.Colors.ICON_RED}
                />
              )}
            </View>
            <ConnectedShockAvatar publicKey={relatedPublickey} height={45} />
          </View>
        ) : (
          <View style={styles.avatar}>
            <View style={styles.outboundIndicator}>
              {outbound ? (
                <Ionicons
                  name="md-arrow-round-up"
                  size={15}
                  color={CSS.Colors.ICON_GREEN}
                />
              ) : (
                <Ionicons
                  name="md-arrow-round-down"
                  size={15}
                  color={CSS.Colors.ICON_RED}
                />
              )}
            </View>
          </View>
        )}

        <Pad amount={10} insideRow />
        <View style={styles.memo}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="middle">
            {title}
          </Text>
          <Text style={styles.subTitle} numberOfLines={2} ellipsizeMode="tail">
            {subTitle}
          </Text>
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
  const getPayment = Store.makeGetPayment()
  const getChainTransaction = Store.makeGetChainTransaction()
  const searchPublicKeyWithMsgBody = Store.makeSearchPublicKeyWithMsgBody()

  return (state: Store.State, props: OwnProps): StateProps => {
    try {
      let tx:
        | ReturnType<typeof getInvoice>
        | ReturnType<typeof getPayment>
        | ReturnType<typeof getChainTransaction>

      if (props.payReq) {
        tx = getInvoice(
          state,
          props as Required<OwnProps> /* we just checked for props.payReq */,
        )
      }

      if (props.paymentHash) {
        tx = getPayment(
          state,
          props as Required<OwnProps> /* we just checked for props.payReq */,
        )
      }

      if (props.chainTXHash) {
        tx = getChainTransaction(state, props.chainTXHash)
      }

      if (!tx!) {
        throw new TypeError(`No TX found: ${JSON.stringify(props)}`)
      }

      const asInvoice = tx! as Schema.InvoiceWhenListed
      const asPayment = tx! as Schema.PaymentV2
      const asChainTX = tx! as Schema.ChainTransaction

      const isInvoice = !!asInvoice.r_preimage
      const isPayment = !!asPayment.payment_hash
      const isChainTX = !!asChainTX.tx_hash

      const maybeDecodedInvoice =
        state.decodedInvoices[asPayment.payment_request]

      // TODO inProces = isInvoice && orderInProcess(invoice.r_hash)
      const inProcess =
        (isPayment && asPayment.status !== 'SUCCEEDED') ||
        (isChainTX && asChainTX.num_confirmations < 1)

      const description = (() => {
        if (isInvoice) {
          return asInvoice.memo
        }

        if (isPayment) {
          if (maybeDecodedInvoice) {
            const a = maybeDecodedInvoice.description
            const b = inProcess ? ' (sending)' : ''

            return a + b
          }

          return 'Fetching memo...'
        }

        if (isChainTX) {
          return asChainTX.label
        }

        return ''
      })()

      // TODO for chain transactions
      const relatedPublickey = (() => {
        if (isChainTX) return null

        return searchPublicKeyWithMsgBody(
          state,
          isPayment ? asPayment.payment_preimage : asInvoice.payment_request,
        )
      })()

      const maybeUser = state.users[relatedPublickey as string]

      // TODO: get Name from order / coordinates
      let name = 'anonymous'

      if (maybeUser) {
        name = maybeUser.displayName || name
      }

      const outbound = isChainTX ? Number(asChainTX.amount) < 0 : isPayment

      return {
        USDRate:
          ((state.wallet
            .USDRate /* Typings fucked we know it's a number or null*/ as unknown) as
            | number
            | null) || 0,
        title: name,
        outbound,
        timestamp: Number(
          asInvoice.settle_date ||
            asPayment.creation_date ||
            asChainTX.time_stamp,
        ),
        // Math.abs for outbound chain tx where the amount is negative
        value: Math.abs(
          Number(
            asInvoice.amt_paid_sat || asPayment.value_sat || asChainTX.amount,
          ),
        ),
        subTitle: description,
        relatedPublickey: relatedPublickey || undefined,
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

  outboundIndicator2: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: OUTBOUND_INDICATOR_RADIUS,
    height: OUTBOUND_INDICATOR_RADIUS,
    elevation: 5,
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

  title: {
    width: '50%',
    color: CSS.Colors.TEXT_GRAY,
    fontSize: 16,
    fontFamily: 'Montserrat-700',
  },

  subTitle: {
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
