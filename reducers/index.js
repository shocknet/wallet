import AuthReducer from './AuthReducer'
import HistoryReducer from './HistoryReducer'
import WalletReducer from './WalletReducer'
import NodeReducer from './NodeReducer'

const rootReducer = {
  auth: AuthReducer,
  history: HistoryReducer,
  wallet: WalletReducer,
  node: NodeReducer,
}

export default rootReducer
