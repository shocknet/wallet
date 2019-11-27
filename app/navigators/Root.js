/**
 * @prettier
 */

import {
  createBottomTabNavigator,
  createStackNavigator,
  createSwitchNavigator,
  createDrawerNavigator,
  NavigationActions,
} from 'react-navigation'
import debounce from 'lodash/debounce'

import Chat, { CHAT_ROUTE } from '../screens/Chat'
import Chats, { CHATS_ROUTE } from '../screens/Chats'
import Advanced, { ADVANCED_SCREEN } from '../screens/Advanced'
import WalletOverview, { WALLET_OVERVIEW } from '../screens/WalletOverview'

import Login, { LOGIN } from '../screens/Login'
import Register, { REGISTER } from '../screens/Register'
import RegisterExisting, {
  REGISTER_EXISTING,
} from '../screens/RegisterExisting'

import MyProfile, { MY_PROFILE } from '../screens/MyProfile'
import Loading, { LOADING } from '../screens/Loading'

import * as ContactAPI from '../services/contact-api'
import * as Cache from '../services/cache'
import { walletExists } from '../services/auth'
import * as NavigationService from '../services/navigation'

export const APP = 'APP'
export const MAIN_NAV = 'MAIN_NAV'

const MainNav = createBottomTabNavigator(
  {
    [WALLET_OVERVIEW]: WalletOverview,
    [CHATS_ROUTE]: Chats,
    [MY_PROFILE]: MyProfile,
  },
  {
    initialRouteName: WALLET_OVERVIEW,
    tabBarOptions: {
      showLabel: false,
    },
  },
)

MainNav.navigationOptions = {
  header: null,
}

const MAIN_DRAWER = 'MAIN_DRAWER'

const MainDrawer = createDrawerNavigator(
  {
    [MAIN_NAV]: {
      screen: MainNav,
      navigationOptions: {
        title: 'Home',
      },
    },
    [ADVANCED_SCREEN]: {
      screen: Advanced,
      navigationOptions: {
        title: 'Advanced settings',
      },
    },
  },
  {
    initialRouteName: MAIN_NAV,
  },
)

MainDrawer.navigationOptions = {
  header: null,
}

const App = createStackNavigator(
  {
    [ADVANCED_SCREEN]: Advanced,
    [CHAT_ROUTE]: Chat,
    [MAIN_DRAWER]: MainDrawer,
  },
  {
    headerLayoutPreset: 'center',
    initialRouteName: MAIN_DRAWER,
  },
)

const AUTH = 'AUTH'

const Auth = createStackNavigator(
  {
    [LOGIN]: Login,
    [REGISTER]: Register,
    [REGISTER_EXISTING]: RegisterExisting,
  },
  {
    initialRouteName: REGISTER,
  },
)

const MainSwitch = createSwitchNavigator(
  {
    [AUTH]: Auth,
    [APP]: App,
    [LOADING]: Loading,
  },
  {
    initialRouteName: APP,
  },
)

export const setup = async () => {
  try {
    ContactAPI.Events.onAuth(
      debounce(async ad => {
        const currentRoute = NavigationService.getCurrentRoute()
        NavigationService.navigate(LOADING)
        const LNDWalletExists = await walletExists()
        console.log('Wallet Exists:', LNDWalletExists)
        // Anytime un-authentication happens immediately navigate to the login screen.

        if (ad === null && currentRoute !== AUTH && LNDWalletExists) {
          return NavigationService.navigate(
            AUTH,
            {},
            NavigationActions.navigate({ routeName: REGISTER_EXISTING }),
          )
        }

        if (ad === null && currentRoute !== AUTH) {
          NavigationService.navigate(AUTH)
        }

        if (ad !== null && currentRoute !== APP) {
          NavigationService.navigate(APP)
        }

        Cache.writeStoredAuthData(ad)
      }),
    )
  } catch (e) {
    console.warn(e)
  }
}

export default MainSwitch
