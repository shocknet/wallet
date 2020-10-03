import { AddInvoiceAction, InvoiceDecodedAction } from './v1'
import {
  ReceivedOwnInvoicesAction,
  InvoicesRefreshForcedAction,
  InvoicesBatchDecodeReqAction,
  InvoicesBatchDecodeResAction,
} from './v2'

export type InvoicesAction =
  | AddInvoiceAction
  | InvoiceDecodedAction
  | ReceivedOwnInvoicesAction
  | InvoicesRefreshForcedAction
  | InvoicesBatchDecodeReqAction
  | InvoicesBatchDecodeResAction

export * from './v1'
export * from './v2'
