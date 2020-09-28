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
