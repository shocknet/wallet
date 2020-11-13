import { createSwitchNavigator, createAppContainer } from 'react-navigation'
import { createDrawerNavigator } from 'react-navigation-drawer'
import { createStackNavigator } from 'react-navigation-stack'
import { createBottomTabNavigator } from 'react-navigation-tabs'
import * as CSS from '../res/css'

import Chat from '../screens/Chat'
import Chats from '../screens/Chats'
import Advanced from '../screens/Advanced'
import WalletOverview from '../screens/WalletOverview'
import SeedBackup from '../screens/SeedBackup'
import WalletSettings from '../screens/WalletSettings'
import Feed from '../screens/Feed'
import AddPostToFeed from '../screens/AddPostToFeed'
import PublishContentDark from '../screens/PublishContentDark'
import CreatePost from '../screens/CreatePostDark'

import Login from '../screens/Login'

import MyProfile from '../screens/MyProfile'
import Loading from '../screens/Loading'

import WalletManager from './WalletManager'
import ConnectToNode from '../screens/ConnectToNode'
import SendScreen from '../screens/Send'
import ReceiveScreen from '../screens/Receive'
import Debug from '../screens/Debug'
import UserScreen from '../screens/User'
import NodeInfo from '../screens/node-info'
import LNURL from '../screens/LNURL'
import * as Routes from '../routes'

import CustomDrawer from '../components/CustomDrawer'

const BottomNav = createBottomTabNavigator(
  {
    [Routes.WALLET_OVERVIEW]: WalletOverview,
    [Routes.CHATS_ROUTE]: Chats,
    [Routes.MY_PROFILE]: MyProfile,
    [Routes.FEED]: Feed,
  },
  {
    initialRouteName: Routes.WALLET_OVERVIEW,
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
    [Routes.BOTTOM_NAV]: BottomNav,
    [Routes.SEND_SCREEN]: SendScreen,
    [Routes.RECEIVE_SCREEN]: ReceiveScreen,
    [Routes.USER]: UserScreen,
    [Routes.DEBUG]: {
      screen: Debug,
    },
  },
  {
    initialRouteName: Routes.BOTTOM_NAV,
    defaultNavigationOptions: {
      headerTitleAlign: 'center',
    },
  },
)

BottomNav.navigationOptions = {
  header: () => null,
}

const theme = 'dark'

/** @typedef {import('react-navigation-drawer').NavigationDrawerOptions} NavigationDrawerOptions */
/** @typedef {import('react-navigation').NavigationParams} NavigationParams */
/** @typedef {import('react-navigation').NavigationRoute<NavigationParams>} NavigationRoute */
/** @typedef {import('react-navigation-drawer').NavigationDrawerProp<NavigationRoute, any>} NavigationDrawerProp */
/** @typedef {import('react-navigation').NavigationRouteConfigMap<NavigationDrawerOptions, NavigationDrawerProp, unknown>} NavigationRouteConfigMap */

/** @type {NavigationRouteConfigMap} */
const drawerScreens = {
  [Routes.WALLET_NAV]: {
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
  [Routes.WALLET_SETTINGS]: {
    screen: WalletSettings,
    navigationOptions: {
      title: 'Wallet Settings',
    },
  },
  [Routes.ADVANCED_SCREEN]: {
    screen: Advanced,
    navigationOptions: {
      title: 'Advanced Lightning',
    },
  },
  [Routes.SEED_BACKUP]: {
    screen: SeedBackup,
    navigationOptions: {
      title: 'Seed Backup',
    },
  },

  [Routes.ADD_POST_TO_FEED]: {
    screen: AddPostToFeed,
    navigationOptions: {
      title: 'Add Post to Feed',
    },
  },
  [Routes.CREATE_POST]: {
    screen: CreatePost,
    navigationOptions: {
      title: 'Add Post to Feed',
    },
  },
  [Routes.LNURL_SCREEN]: {
    screen: LNURL,
    navigationOptions: {
      title: 'LNURL utils',
    },
  },
  [Routes.PUBLISH_CONTENT_DARK]: {
    screen: PublishContentDark,
    navigationOptions: {
      title: 'Publish Content',
    },
  },
}

if (theme === 'dark') {
  delete drawerScreens[Routes.ADD_POST_TO_FEED]
}

const MainDrawer = createDrawerNavigator(drawerScreens, {
  initialRouteName: Routes.WALLET_NAV,
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
    [Routes.ADVANCED_SCREEN]: Advanced,
    [Routes.CHAT_ROUTE]: Chat,
    [Routes.MAIN_DRAWER]: MainDrawer,
    [Routes.NODE_INFO]: NodeInfo,
  },
  {
    initialRouteName: Routes.MAIN_DRAWER,
  },
)

export const AUTH = 'AUTH'

const Auth = createSwitchNavigator(
  {
    [Routes.LOGIN]: Login,
    [Routes.WALLET_MANAGER]: WalletManager,
    [Routes.CONNECT_TO_NODE]: ConnectToNode,
  },
  {
    initialRouteName: Routes.CONNECT_TO_NODE,
  },
)

const MainSwitch = createSwitchNavigator(
  {
    [AUTH]: Auth,
    [Routes.APP]: App,
    [Routes.LOADING]: Loading,
  },
  {
    initialRouteName: AUTH,
  },
)

export default createAppContainer(MainSwitch)
