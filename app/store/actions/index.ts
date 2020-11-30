import * as Common from 'shock-common'
import { RehydrateAction } from 'redux-persist'

import * as ChatActions from './ChatActions'
import * as RequestActions from './RequestActions'
import { UsersAction } from './users'
import * as Follows from './follows'
import * as MediaLib from './mediaLib'
import { TipsAction } from './tips'
import {
  InvoicesAction,
  InvoicesBatchDecodeReqAction as _InvoicesBatchDecodeReqAction,
  InvoicesBatchDecodeResAction as _InvoicesBatchDecodeResAction,
} from './InvoiceActions'
import { ConnectionAction } from './ConnectionActions'
import { AuthAction } from './auth'
import { PaymentsAction } from './payments'
import { ChainTXsAction } from './chain-txs'
import { PostsAction } from './posts'
import { DebugAction } from './debug'
import { WalletAction } from './wallet'
import { SharedPostsAction } from './shared-posts'

export type Action =
  | UsersAction
  | ChatActions.ReceivedChatsAction
  | RequestActions.ReceivedRequestsAction
  | RequestActions.SentRequestsAction
  | Follows.FollowsAction
  | Common.Store.Actions.FeedAction
  | Common.Store.Actions.PostsAction
  | MediaLib.MediaLibAction
  | TipsAction
  | InvoicesAction
  | ConnectionAction
  | AuthAction
  | PaymentsAction
  | ChainTXsAction
  | RehydrateAction
  | PostsAction
  | DebugAction
  | WalletAction
  | ChatActions.LoadMessagesAction
  | SharedPostsAction

export const receivedBackfeed = Common.Store.Actions.receivedBackfeed
export const receivedFeed = Common.Store.Actions.receivedFeed
export const sawPost = Common.Store.Actions.sawPost
export const getMoreBackfeed = Common.Store.Actions.getMoreBackfeed
export const getMoreFeed = Common.Store.Actions.getMoreFeed
export const viewportChanged = Common.Store.Actions.viewportChanged

export * from './tips'
export * from './ConnectionActions'
export * from './auth'
export {
  invoicesRefreshForced,
  receivedOwnInvoices,
  decodePaymentRequest,
  invoicesBatchDecodeReq,
  invoicesBatchDecodeRes,
  receivedSingleInvoice,
} from './InvoiceActions'
export type InvoicesBatchDecodeReqAction = _InvoicesBatchDecodeReqAction
export type InvoicesBatchDecodeResAction = _InvoicesBatchDecodeResAction
export * from './payments'
export * from './chain-txs'
export { fetchNodeInfo } from './NodeActions'
export * from './users'
export * from './posts'
export * from './debug'
export * from './wallet'
export * from './shared-posts'
export * from './mediaLib'

export { ChatActions, RequestActions, Follows }
