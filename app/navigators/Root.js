/**
 * @prettier
 */

import {
  createBottomTabNavigator,
  createStackNavigator,
  createSwitchNavigator,
  createDrawerNavigator,
} from 'react-navigation'

import * as CSS from '../res/css'

import Chat, { CHAT_ROUTE } from '../screens/Chat'
import Chats, { CHATS_ROUTE } from '../screens/Chats'
import Advanced, { ADVANCED_SCREEN } from '../screens/Advanced'
import WalletOverview, { WALLET_OVERVIEW } from '../screens/WalletOverview'

import Login, { LOGIN } from '../screens/Login'

import MyProfile, { MY_PROFILE } from '../screens/MyProfile'
import Loading, { LOADING } from '../screens/Loading'

import WalletManager, { WALLET_MANAGER } from './WalletManager'
import ConnectToNode, { CONNECT_TO_NODE } from '../screens/ConnectToNode'

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
      allowFontScaling: false,
      showLabel: false,
      style: {
        borderTopWidth: 0,
        backgroundColor: CSS.Colors.BACKGROUND_WHITE,
        height: CSS.BOTTOM_BAR_HEIGHT,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 12,
        },
        shadowOpacity: 0.58,
        shadowRadius: 16.0,

        elevation: 24,
      },
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
