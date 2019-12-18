import { createStackNavigator } from 'react-navigation'

import CreateWalletOrAlias, {
  CREATE_WALLET_OR_ALIAS,
} from './CreateWalletOrAlias'
import Landing, { LANDING } from './Landing'

export const WALLET_MANAGER = 'WALLET_MANAGER'

const WalletManager = createStackNavigator(
  {
    [CREATE_WALLET_OR_ALIAS]: CreateWalletOrAlias,
    [LANDING]: Landing,
  },
  {
    initialRouteName: LANDING,
  },
)

export default WalletManager
