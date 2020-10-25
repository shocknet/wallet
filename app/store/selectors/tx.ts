import { Schema } from 'shock-common'
import { createSelector } from 'reselect'

import { State } from '../reducers'
import { Tip } from '../../schema'

import * as Invoices from './invoices'
import * as Payments from './payments'
import * as ChainTXs from './chain-txs'
import * as Tips from './tips'

type Invoice = Schema.InvoiceWhenListed
type Payment = Schema.PaymentV2
type ChainTX = Schema.ChainTransaction

export type UnifiedTx =
  | { type: 'invoice'; payReq: string }
  | { type: 'payment'; paymentHash: string }
  | { type: 'chain'; chainTXHash: string }
  | { type: 'tip'; publicKey: string }

export const getLatestTx = createSelector<
  State,
  Invoice[],
  Payment[],
  ChainTX[],
  Record<string, Tip>,
  UnifiedTx[]
>(
  Invoices.getLatestSettledInvoices,
  Payments.getLatestPayments,
  ChainTXs.getLatestChainTransactions,
  Tips.getTips,
  (invoices, payments, chainTXs, tips) => {
    const tx: UnifiedTx[] = [...invoices, ...payments, ...chainTXs]
      .sort((pOrIOrChain1, pOrIOrChain2) => {
        const a = Number(
          (pOrIOrChain1 as Invoice).settle_date ||
            (pOrIOrChain1 as Payment).creation_date ||
            (pOrIOrChain1 as ChainTX).time_stamp,
        )

        const b = Number(
          (pOrIOrChain2 as Invoice).settle_date ||
            (pOrIOrChain2 as Payment).creation_date ||
            (pOrIOrChain2 as ChainTX).time_stamp,
        )

        return b - a
      })
      .map(t => {
        const asPayment = t as Payment
        const asInvoice = t as Invoice
        const asChainTX = t as ChainTX

        if (asPayment.payment_hash) {
          return {
            type: 'payment',
            paymentHash: asPayment.payment_hash,
          }
        }

        if (asInvoice.payment_request) {
          return {
            type: 'invoice',
            payReq: asInvoice.payment_request,
          }
        }

        if (asChainTX.tx_hash) {
          return {
            type: 'chain',
            chainTXHash: asChainTX.tx_hash,
          }
        }

        throw new TypeError()
      })

    return [
      ...Object.keys(tips).map(
        publicKey =>
          ({
            type: 'tip',
            publicKey,
          } as const),
      ),
      ...tx,
    ]
  },
)
