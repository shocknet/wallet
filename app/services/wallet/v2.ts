import Http from 'axios'
import Logger from 'react-native-file-log'
import { Schema } from 'shock-common'
import { ToastAndroid } from 'react-native'

import { getStore } from '../../store'

// TODO: Move to common repo
interface ErrResponse {
  field?: string
  errorMessage: string
}

export const tip = async (
  amount: number,
  recipientsPublicKey: string,
  memo: string,
  feeLimit: number,
): Promise<Schema.PaymentV2> => {
  try {
    const { data, status } = await Http.post<Schema.PaymentV2 | ErrResponse>(
      `/api/lnd/unifiedTrx`,
      {
        type: 'spont',
        amt: amount,
        to: recipientsPublicKey,
        memo,
        feeLimit,
      },
    )

    if (status !== 200) {
      throw new Error(JSON.stringify(data))
    }

    ToastAndroid.show('Tip sent!', ToastAndroid.LONG)

    // cast: If status is 200 response will be PaymentV2
    return data as Schema.PaymentV2
  } catch (err) {
    const msg = `tip() -> ${JSON.stringify(err.response.data.errorMessage)}`
    Logger.log(msg)
    throw new Error(msg)
  }
}

interface DecodeInvoiceResponse {
  decodedRequest: Schema.InvoiceWhenDecoded
}

interface DecodeInvoiceRequest {
  /**
   * AKA Invoice
   */
  payReq: string
}

interface Awaiter {
  resolver: (inv: Schema.InvoiceWhenDecoded) => void
  rejector: (err: Error) => void
}

const inProcessToAwaiters = new Map<string, Awaiter[]>()

export const decodeInvoice = async ({
  payReq,
}: DecodeInvoiceRequest): Promise<DecodeInvoiceResponse> => {
  if (typeof payReq !== 'string') {
    throw new TypeError(
      `decodeInvoice() -> payReq is not an string, instead got: ${JSON.stringify(
        payReq,
      )}`,
    )
  }

  if (payReq.length < 10) {
    throw new TypeError(
      `decodeInvoice() -> payReq is an string but doesn't look like an invoice, got: ${JSON.stringify(
        payReq,
      )}`,
    )
  }

  try {
    const { decodedInvoices } = getStore().getState()
    const maybeDecoded = decodedInvoices[payReq]
    if (maybeDecoded) {
      return Promise.resolve({
        decodedRequest: maybeDecoded,
      })
    }

    // a request is already in process
    if (inProcessToAwaiters.has(payReq)) {
      const awaiter = {
        resolver: () => {},
        rejector: () => {},
      }
      inProcessToAwaiters.get(payReq)!.push(awaiter)

      return new Promise((res, rej) => {
        awaiter.resolver = res
        awaiter.rejector = rej
      })
    }

    inProcessToAwaiters.set(payReq, [])

    const { data } = await Http.post(`/api/lnd/decodePayReq`, { payReq })

    if (data.errorMessage) {
      throw new Error(data.errorMessage)
    }

    if (!Schema.isInvoiceWhenDecoded(data.decodedRequest)) {
      const msg = `data.decodedRequest is not a a decoded invoice, data: ${JSON.stringify(
        data,
      )}`
      Logger.log(msg)
      throw new Error(`API returned malformed data.`)
    }

    getStore().dispatch({
      type: 'invoice/load',
      data: {
        ...data.decodedRequest,
        payment_request: payReq,
      },
    })

    if (inProcessToAwaiters.has(payReq)) {
      const awaiters = inProcessToAwaiters.get(payReq)!

      inProcessToAwaiters.delete(payReq)

      setImmediate(() => {
        awaiters.forEach(({ resolver }) => {
          resolver(data.decodedRequest)
        })
      })
    }

    return data
  } catch (err) {
    const { response } = err
    throw new Error(
      (response &&
        response.data &&
        (response.data.errorMessage || response.data.message)) ||
        err.message ||
        'Unknown error.',
    )
  }
}

export interface ListPaymentsReq {
  include_incomplete?: boolean
  index_offset?: number
  max_payments?: number
  reversed?: boolean
}

export interface ListPaymentsRes {
  payments: Array<Schema.PaymentV2>
  first_index_offset: string
  last_index_offset: string
}

export const batchDecodePayReqs = async (
  payReqs: string[],
): Promise<Schema.InvoiceWhenDecoded[]> => {
  const res = await Promise.all(
    payReqs.map(payReq => decodeInvoice({ payReq })),
  )

  return res.map(r => r.decodedRequest)
}
