import * as ChatActions from './ChatActions'
import * as RequestActions from './RequestActions'
import * as UsersActions from './UsersActions'

/**
 * @typedef {UsersActions.ReceivedUsersDataAction|ChatActions.ReceivedChatsAction|RequestActions.ReceivedRequestsAction|RequestActions.SentRequestsAction} Action
 */

export { ChatActions, RequestActions, UsersActions }
