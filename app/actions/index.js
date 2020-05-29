import * as ChatActions from './ChatActions'
import * as RequestActions from './RequestActions'
import * as UsersActions from './UsersActions'
import * as Follows from './follows'

/**
 * @typedef {UsersActions.ReceivedUsersDataAction|ChatActions.ReceivedChatsAction|RequestActions.ReceivedRequestsAction|RequestActions.SentRequestsAction|Follows.followsActions} Action
 */

export { ChatActions, RequestActions, UsersActions }
