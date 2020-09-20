import { AddInvoiceAction, InvoiceDecodedAction } from './v1'
import { ReceivedOwnInvoicesAction } from './v2'

export type InvoicesAction =
  | AddInvoiceAction
  | InvoiceDecodedAction
  | ReceivedOwnInvoicesAction

export * from './v1'
