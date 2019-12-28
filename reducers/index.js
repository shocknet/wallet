import AuthReducer from './AuthReducer'
import HistoryReducer from './HistoryReducer'
import WalletReducer from './WalletReducer'
import NodeReducer from './NodeReducer'
import InvoiceReducer from './InvoiceReducer'

const rootReducer = {
  auth: AuthReducer,
  history: HistoryReducer,
  wallet: WalletReducer,
  node: NodeReducer,
  invoice: InvoiceReducer,
}

export default rootReducer
