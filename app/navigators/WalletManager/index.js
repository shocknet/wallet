import { createStackNavigator } from 'react-navigation'

import CreateWallet, { CREATE_WALLET } from './CreateWallet'
import Landing, { LANDING } from './Landing'

export const WALLET_MANAGER = 'WALLET_MANAGER'

const WalletManager = createStackNavigator(
  {
    [CREATE_WALLET]: CreateWallet,
    [LANDING]: Landing,
  },
  {
    initialRouteName: LANDING,
  },
)

export default WalletManager
