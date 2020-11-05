import { AddInvoiceAction, InvoiceDecodedAction } from './v1'
import {
  ReceivedOwnInvoicesAction,
  InvoicesRefreshForcedAction,
  InvoicesBatchDecodeReqAction,
  InvoicesBatchDecodeResAction,
  ReceivedSingleInvoiceAction,
} from './v2'

export type InvoicesAction =
  | AddInvoiceAction
  | InvoiceDecodedAction
  | ReceivedOwnInvoicesAction
  | InvoicesRefreshForcedAction
  | InvoicesBatchDecodeReqAction
  | InvoicesBatchDecodeResAction
  | ReceivedSingleInvoiceAction

export * from './v1'
export * from './v2'
