/**
 * @prettier
 */

import {
  createBottomTabNavigator,
  createStackNavigator,
  createSwitchNavigator,
  createDrawerNavigator,
} from 'react-navigation'

import Chat, { CHAT_ROUTE } from '../screens/Chat'
import Chats, { CHATS_ROUTE } from '../screens/Chats'
import Advanced, { ADVANCED_SCREEN } from '../screens/Advanced'
import WalletOverview, { WALLET_OVERVIEW } from '../screens/WalletOverview'

import Login, { LOGIN } from '../screens/Login'

import MyProfile, { MY_PROFILE } from '../screens/MyProfile'
import Loading, { LOADING } from '../screens/Loading'

import WalletManager, { WALLET_MANAGER } from './WalletManager'
import ConnectToNode, { CONNECT_TO_NODE } from '../screens/ConnectToNode'
import SendScreen, { SEND_SCREEN } from '../screens/Send'

export const APP = 'APP'
export const BOTTOM_NAV = 'BOTTOM_NAV'
export const WALLET_NAV = 'WALLET_NAV'
export const WALLET = 'WALLET'

const BottomNav = createBottomTabNavigator(
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

const WalletNav = createStackNavigator(
  {
    [BOTTOM_NAV]: BottomNav,
    [SEND_SCREEN]: SendScreen,
  },
  {
    initialRouteName: BOTTOM_NAV,
    navigationOptions: {
      header: null,
    },
  },
)

BottomNav.navigationOptions = {
  header: null,
}

const MAIN_DRAWER = 'MAIN_DRAWER'

const MainDrawer = createDrawerNavigator(
  {
    [WALLET_NAV]: {
      screen: WalletNav,
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
    initialRouteName: WALLET_NAV,
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

export const AUTH = 'AUTH'

const Auth = createSwitchNavigator(
  {
    [LOGIN]: Login,
    [WALLET_MANAGER]: WalletManager,
    [CONNECT_TO_NODE]: ConnectToNode,
  },
  {
    initialRouteName: CONNECT_TO_NODE,
  },
)

const MainSwitch = createSwitchNavigator(
  {
    [AUTH]: Auth,
    [APP]: App,
    [LOADING]: Loading,
  },
  {
    initialRouteName: AUTH,
  },
)

export default MainSwitch
