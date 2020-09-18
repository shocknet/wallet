import * as ChatActions from './ChatActions'
import * as RequestActions from './RequestActions'
import * as UsersActions from './UsersActions'
import * as Follows from './follows'
import * as Feed from './feed'
import * as FeedWall from './FeedAction'
import * as SingleFeed from './singleFeed'
import * as Me from './me'
import { TipsAction } from './tips'
import { InvoicesAction } from './InvoiceActions'
import { ConnectionAction } from './ConnectionActions'
import { AuthAction } from './auth'

import * as Common from 'shock-common'

export type Action =
  | UsersActions.ReceivedUsersDataAction
  | ChatActions.ReceivedChatsAction
  | RequestActions.ReceivedRequestsAction
  | RequestActions.SentRequestsAction
  | Follows.FollowsAction
  | Me.MeAction
  | Common.Store.Actions.FeedAction
  | Common.Store.Actions.PostsAction
  | Feed.FeedActions
  | FeedWall.FeedActions
  | TipsAction
  | InvoicesAction
  | ConnectionAction
  | AuthAction

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
  ChatActions,
  RequestActions,
  UsersActions,
  Follows,
  Feed,
  SingleFeed,
  FeedWall,
  Me,
}
