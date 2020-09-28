import { AddInvoiceAction, InvoiceDecodedAction } from './v1'
import { ReceivedOwnInvoicesAction, InvoicesRefreshForcedAction } from './v2'

export type InvoicesAction =
  | AddInvoiceAction
  | InvoiceDecodedAction
  | ReceivedOwnInvoicesAction
  | InvoicesRefreshForcedAction

export * from './v1'
export * from './v2'
