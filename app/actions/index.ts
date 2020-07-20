import * as ChatActions from './ChatActions'
import * as RequestActions from './RequestActions'
import * as UsersActions from './UsersActions'
import * as Follows from './follows'
import * as Feed from './feed'
import * as FeedWall from './FeedAction'
import * as SingleFeed from './singleFeed'

export type Action =
  | UsersActions.ReceivedUsersDataAction
  | ChatActions.ReceivedChatsAction
  | RequestActions.ReceivedRequestsAction
  | RequestActions.SentRequestsAction
  | Follows.FollowsAction
  | FeedWall.BeganLoadFeedAction
  | FeedWall.FinishedLoadFeedAction
  | FeedWall.LoadFeedErrorAction

export {
  ChatActions,
  RequestActions,
  UsersActions,
  Follows,
  Feed,
  SingleFeed,
  FeedWall,
}
