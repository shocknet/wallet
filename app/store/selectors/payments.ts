import { Schema } from 'shock-common'
import { createSelector } from 'reselect'

import { State } from '../reducers'

interface HasPaymentHash {
  paymentHash: string
}

const getPayments = (state: State) => state.paymentsV2s

const getPaymentHash = (_: State, props: HasPaymentHash) => props.paymentHash

export const makeGetPayment = () =>
  createSelector<
    State,
    HasPaymentHash, // Props to selectors
    ReturnType<typeof getPayments>,
    ReturnType<typeof getPaymentHash>,
    Schema.PaymentV2 | null // Return type
  >(
    getPayments,
    getPaymentHash,
    (payments, paymentHash) => payments[paymentHash] || null,
  )

export const getLatestPaymentHashes = (state: State) =>
  state.paymentsV2s.$$__LATEST__PERFORMED

export const getLatestPayments = createSelector<
  State,
  string[],
  ReturnType<typeof getPayments>,
  Schema.PaymentV2[]
>(
  getLatestPaymentHashes,
  getPayments,
  (paymentHashes, payments) => paymentHashes.map(phash => payments[phash]),
)
