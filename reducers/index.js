// @ts-nocheck
import AuthReducer from './AuthReducer'
import HistoryReducer from './HistoryReducer'
import WalletReducer from './WalletReducer'
import NodeReducer from './NodeReducer'
import ChatReducer from './ChatReducer'
import InvoiceReducer from './InvoiceReducer'
import ConnectionReducer from './ConnectionReducer'
import FeesReducer from './FeesReducer'
import UsersReducer, * as Users from './UsersReducer'
import FeedReducer from './FeedReducer'

const rootReducer = {
  auth: AuthReducer,
  history: HistoryReducer,
  wallet: WalletReducer,
  node: NodeReducer,
  chat: ChatReducer,
  connection: ConnectionReducer,
  invoice: InvoiceReducer,
  fees: FeesReducer,
  users: UsersReducer,
  feed: FeedReducer,
}

/**
 * @typedef {{ [K in keyof rootReducer]: ReturnType<typeof rootReducer[K]> }} State
 */

/**
 * @param {State} state
 */
export const selectAllUsers = state => Users.selectAllUsers(state.users)

/**
 * @param {State} state
 * @param {{ publicKey: string }} props
 */
export const selectUser = (state, { publicKey }) =>
  Users.selectUser(state.users, { publicKey })

export default rootReducer
