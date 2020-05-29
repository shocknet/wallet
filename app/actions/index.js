import * as ChatActions from './ChatActions'
import * as RequestActions from './RequestActions'
import * as UsersActions from './UsersActions'
import * as follow from './follows'

/**
 * @typedef {UsersActions.ReceivedUsersDataAction|ChatActions.ReceivedChatsAction|RequestActions.ReceivedRequestsAction|RequestActions.SentRequestsAction|follow.followAction|follow.unfollowAction} Action
 */

export { ChatActions, RequestActions, UsersActions }
