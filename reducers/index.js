import AuthReducer from './AuthReducer'
import HistoryReducer from './HistoryReducer'
import WalletReducer from './WalletReducer'
import NodeReducer from './NodeReducer'
import ChatReducer from './ChatReducer'
import InvoiceReducer from './InvoiceReducer'
import ConnectionReducer from './ConnectionReducer'
import FeesReducer from './FeesReducer'
import UsersReducer, * as Users from './UsersReducer'
import FeedReducer from './feed'
import FeedWallReducer from './FeedReducer'
import FollowsReducer from './follows'
import SingleFeedReducer from './singleFeed'
import SettingsReducer from './SettingsReducer'
import paymentsV2s from './paymentV2s'
import tips from './tips'
import decodedInvoices from './decoded-invoices'

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
  feedWall: FeedWallReducer,
  follows: FollowsReducer,
  singleFeed: SingleFeedReducer,
  settings: SettingsReducer,
  paymentsV2s,
  tips,
  decodedInvoices,
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
