import * as ChatActions from './ChatActions'
import * as RequestActions from './RequestActions'
import * as UsersActions from './UsersActions'

export type Action =
  | UsersActions.ReceivedUsersDataAction
  | ChatActions.ReceivedChatsAction
  | RequestActions.ReceivedRequestsAction
  | RequestActions.SentRequestsAction

export { ChatActions, RequestActions, UsersActions }
