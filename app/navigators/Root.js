import { createSwitchNavigator, createAppContainer } from 'react-navigation'
import { createDrawerNavigator } from 'react-navigation-drawer'
import { createStackNavigator } from 'react-navigation-stack'
import { createBottomTabNavigator } from 'react-navigation-tabs'
import * as CSS from '../res/css'

import Chat, { CHAT_ROUTE } from '../screens/Chat'
import Chats, { CHATS_ROUTE } from '../screens/Chats'
import Advanced, { ADVANCED_SCREEN } from '../screens/Advanced'
import WalletOverview, { WALLET_OVERVIEW } from '../screens/WalletOverview'
import SeedBackup, { SEED_BACKUP } from '../screens/SeedBackup'
import WalletSettings, { WALLET_SETTINGS } from '../screens/WalletSettings'
import Feed from '../screens/Feed'
import AddPostToFeed, { ADD_POST_TO_FEED } from '../screens/AddPostToFeed'
import PublishContentDark, {
  PUBLISH_CONTENT_DARK,
} from '../screens/PublishContentDark'
import {
  default as CreatePost,
  CREATE_POST_DARK as CREATE_POST,
} from '../screens/CreatePostDark'

import Login, { LOGIN } from '../screens/Login'

import MyProfile from '../screens/MyProfile'
import Loading, { LOADING } from '../screens/Loading'

import WalletManager, { WALLET_MANAGER } from './WalletManager'
import ConnectToNode, { CONNECT_TO_NODE } from '../screens/ConnectToNode'
import SendScreen, { SEND_SCREEN } from '../screens/Send'
import ReceiveScreen, { RECEIVE_SCREEN } from '../screens/Receive'
import Debug, { DEBUG } from '../screens/Debug'
import UserScreen from '../screens/User'
import NodeInfo, { NODE_INFO } from '../screens/node-info'
import LNURL, { LNURL_SCREEN } from '../screens/LNURL'
import * as Routes from '../routes'

import CustomDrawer from '../components/CustomDrawer'

export const APP = 'APP'
export const BOTTOM_NAV = 'BOTTOM_NAV'
export const WALLET_NAV = 'WALLET_NAV'
export const WALLET = 'WALLET'

const BottomNav = createBottomTabNavigator(
  {
    [WALLET_OVERVIEW]: WalletOverview,
    [CHATS_ROUTE]: Chats,
    [Routes.MY_PROFILE]: MyProfile,
    [Routes.FEED]: Feed,
  },
  {
    initialRouteName: WALLET_OVERVIEW,
    tabBarOptions: {
      allowFontScaling: false,
      showLabel: false,
      style: {
        borderTopWidth: 0,
        backgroundColor: CSS.Colors.BACKGROUND_BLACK,
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

const WalletNav = createStackNavigator(
  {
    [BOTTOM_NAV]: BottomNav,
    [SEND_SCREEN]: SendScreen,
    [RECEIVE_SCREEN]: ReceiveScreen,
    [Routes.USER]: UserScreen,
    [DEBUG]: {
      screen: Debug,
    },
  },
  {
    initialRouteName: BOTTOM_NAV,
    defaultNavigationOptions: {
      headerTitleAlign: 'center',
    },
  },
)

BottomNav.navigationOptions = {
  header: () => null,
}

const MAIN_DRAWER = 'MAIN_DRAWER'
const theme = 'dark'

/** @typedef {import('react-navigation-drawer').NavigationDrawerOptions} NavigationDrawerOptions */
/** @typedef {import('react-navigation').NavigationParams} NavigationParams */
/** @typedef {import('react-navigation').NavigationRoute<NavigationParams>} NavigationRoute */
/** @typedef {import('react-navigation-drawer').NavigationDrawerProp<NavigationRoute, any>} NavigationDrawerProp */
/** @typedef {import('react-navigation').NavigationRouteConfigMap<NavigationDrawerOptions, NavigationDrawerProp, unknown>} NavigationRouteConfigMap */

/** @type {NavigationRouteConfigMap} */
const drawerScreens = {
  [WALLET_NAV]: {
    screen: WalletNav,
    navigationOptions: {
      title: 'Home',
    },
  },
  [Routes.MY_PROFILE]: {
    screen: MyProfile,
    navigationOptions: {
      title: 'Profile',
    },
  },
  [WALLET_SETTINGS]: {
    screen: WalletSettings,
    navigationOptions: {
      title: 'Wallet Settings',
    },
  },
  [ADVANCED_SCREEN]: {
    screen: Advanced,
    navigationOptions: {
      title: 'Advanced Lightning',
    },
  },
  [SEED_BACKUP]: {
    screen: SeedBackup,
    navigationOptions: {
      title: 'Seed Backup',
    },
  },

  [ADD_POST_TO_FEED]: {
    screen: AddPostToFeed,
    navigationOptions: {
      title: 'Add Post to Feed',
    },
  },
  [CREATE_POST]: {
    screen: CreatePost,
    navigationOptions: {
      title: 'Add Post to Feed',
    },
  },
  [LNURL_SCREEN]: {
    screen: LNURL,
    navigationOptions: {
      title: 'LNURL utils',
    },
  },
  [PUBLISH_CONTENT_DARK]: {
    screen: PublishContentDark,
    navigationOptions: {
      title: 'Publish Content',
    },
  },
}

if (theme === 'dark') {
  delete drawerScreens[ADD_POST_TO_FEED]
}

const MainDrawer = createDrawerNavigator(drawerScreens, {
  initialRouteName: WALLET_NAV,
  drawerPosition: 'right',
  contentComponent: CustomDrawer,
  drawerBackgroundColor: 'transparent',
  contentOptions: {
    labelStyle: {
      textAlign: 'right',
    },
  },
})

MainDrawer.navigationOptions = {
  headerShown: false,
}

const App = createStackNavigator(
  {
    [ADVANCED_SCREEN]: Advanced,
    [CHAT_ROUTE]: Chat,
    [MAIN_DRAWER]: MainDrawer,
    [NODE_INFO]: NodeInfo,
  },
  {
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

export default createAppContainer(MainSwitch)
