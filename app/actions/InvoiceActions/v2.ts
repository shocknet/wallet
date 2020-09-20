import { Schema } from 'shock-common'

export const receivedOwnInvoices = (data: {
  invoices: Schema.InvoiceWhenListed[]
  last_index_offset: number
  first_index_offset: number
}) =>
  ({
    type: 'invoices/receivedOwn',
    data,
  } as const)

export type ReceivedOwnInvoicesAction = ReturnType<typeof receivedOwnInvoices>
