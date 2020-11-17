import Logger from 'react-native-file-log'

import HistoryReducer from './HistoryReducer'
import WalletReducer from './WalletReducer'
import NodeReducer from './NodeReducer'
import ChatReducer from './ChatReducer'
import InvoiceReducer from './InvoiceReducer'
import ConnectionReducer from './ConnectionReducer'
import FeesReducer from './FeesReducer'
import UsersReducer from './UsersReducer'
import FollowsReducer from './follows'
import SettingsReducer from './SettingsReducer'
import paymentsV2s from './paymentV2s'
import tips from './tips'
import decodedInvoices from './decoded-invoices'
import mediaLib from './mediaLib'
import auth from './auth'
import invoicesListed from './invoices-listed'
import invoicesAdded from './invoices-added'
import chainTXs from './chain-txs'
import posts from './posts'
import debug from './debug'
import chats from './chats'
import sentReqs from './sent-reqs'
import receivedReqs from './received-reqs'
import messages from './messages'
import sharedPosts from './shared-posts'

const rootReducer = {
  auth,
  history: HistoryReducer,
  wallet: WalletReducer,
  node: NodeReducer,
  chat: ChatReducer,
  connection: ConnectionReducer,
  invoice: InvoiceReducer,
  fees: FeesReducer,
  users: UsersReducer,
  follows: FollowsReducer,
  posts,
  settings: SettingsReducer,
  paymentsV2s,
  tips,
  decodedInvoices,
  mediaLib,
  invoicesListed,
  invoicesAdded,
  chainTXs,
  debug,
  chats,
  sentReqs,
  receivedReqs,
  messages,
  sharedPosts,
}

for (const [key, reducer] of Object.entries(rootReducer)) {
  // @ts-expect-error
  rootReducer[key] = (state: unknown, action: unknown) => {
    try {
      // @ts-expect-error
      return reducer(state, action)
    } catch (e) {
      Logger.log(`Error inside ${key} reducer -> ${e.message}`)
      return state
    }
  }
}

export type State = {
  [K in keyof typeof rootReducer]: ReturnType<typeof rootReducer[K]>
}

export default rootReducer
