import { Schema } from 'shock-common'
import { createSelector } from 'reselect'

import { State } from '../../reducers'

import * as Invoices from './invoices'
import * as Payments from './payments'

export type UnifiedTx =
  | { type: 'invoice'; payReq: string }
  | { type: 'payment'; paymentHash: string }

export const getLatestTx = createSelector<
  State,
  Schema.InvoiceWhenListed[],
  Schema.PaymentV2[],
  UnifiedTx[]
>(
  Invoices.getLatestSettledInvoices,
  Payments.getLatestPayments,
  (invoices, payments) => {
    const tx: UnifiedTx[] = [...invoices, ...payments]
      .sort((pOrI1, pOrI2) => {
        const a = Number(
          (pOrI1 as Schema.InvoiceWhenListed).settle_date ||
            pOrI1.creation_date,
        )

        const b = Number(
          (pOrI2 as Schema.InvoiceWhenListed).settle_date ||
            pOrI2.creation_date,
        )

        return b - a
      })
      .map(t => {
        const asPayment = t as Schema.PaymentV2
        const asInvoice = t as Schema.InvoiceWhenListed
        if (asPayment.payment_hash) {
          return {
            type: 'payment',
            paymentHash: asPayment.payment_hash,
          }
        }

        return {
          type: 'invoice',
          payReq: asInvoice.payment_request,
        }
      })

    return tx
  },
)
