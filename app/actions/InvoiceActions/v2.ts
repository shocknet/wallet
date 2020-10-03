import { Schema } from 'shock-common'

import { ListInvoiceRequest } from '../../services/wallet'

export const receivedOwnInvoices = (data: {
  invoices: Schema.InvoiceWhenListed[]
  last_index_offset: number
  first_index_offset: number
  originRequest: ListInvoiceRequest
}) =>
  ({
    type: 'invoices/receivedOwn',
    data,
  } as const)

export type ReceivedOwnInvoicesAction = ReturnType<typeof receivedOwnInvoices>

export const invoicesRefreshForced = () =>
  ({
    type: 'invoicesRefreshForced',
  } as const)

export type InvoicesRefreshForcedAction = ReturnType<
  typeof invoicesRefreshForced
>

const INVOICES_BATCH_DECODE_REQ = 'invoices/batchDecodeRequested' as const

export const invoicesBatchDecodeReq = (payReqs: string[]) =>
  ({
    type: INVOICES_BATCH_DECODE_REQ,
    data: {
      payReqs,
    },
  } as const)

invoicesBatchDecodeReq.toString = () => INVOICES_BATCH_DECODE_REQ

invoicesBatchDecodeReq.type = INVOICES_BATCH_DECODE_REQ

export type InvoicesBatchDecodeReqAction = ReturnType<
  typeof invoicesBatchDecodeReq
>

const INVOICES_BATCH_DECODE_RES = 'invoices/batchDecodeReceived' as const

export const invoicesBatchDecodeRes = (
  payReqs: string[],
  invoices: Schema.InvoiceWhenDecoded[],
) =>
  ({
    type: INVOICES_BATCH_DECODE_RES,
    data: {
      payReqs,
      invoices,
    },
  } as const)

invoicesBatchDecodeRes.toString = () => INVOICES_BATCH_DECODE_RES
invoicesBatchDecodeRes.type = INVOICES_BATCH_DECODE_RES

export type InvoicesBatchDecodeResAction = ReturnType<
  typeof invoicesBatchDecodeRes
>
