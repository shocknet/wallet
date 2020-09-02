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
import SeedBackup, { SEED_BACKUP } from '../screens/SeedBackup'
//@ts-ignore
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

import MyProfile, { MY_PROFILE } from '../screens/MyProfile'
//import MyFeed, { MY_FEED } from '../screens/MyFeed'
import Loading, { LOADING } from '../screens/Loading'

import WalletManager, { WALLET_MANAGER } from './WalletManager'
import ConnectToNode, { CONNECT_TO_NODE } from '../screens/ConnectToNode'
import SendScreen, { SEND_SCREEN } from '../screens/Send'
import ReceiveScreen, { RECEIVE_SCREEN } from '../screens/Receive'
import Debug, { DEBUG } from '../screens/Debug'
import UserScreen from '../screens/User'

import * as Routes from '../routes'
import LNURL, { LNURL_SCREEN } from '../screens/LNURL'

import CustomDrawer from '../components/CustomDrawer'
//@ts-ignore
import IconDrawerProfile from '../assets/images/drawer-icons/icon-drawer-profile.svg'
//@ts-ignore
import IconDrawerWalletSettings from '../assets/images/drawer-icons/icon-drawer-wallet.svg'
//@ts-ignore
import IconDrawerSpendingRules from '../assets/images/drawer-icons/icon-drawer-spending-rule.svg'
//@ts-ignore
import IconDrawerAdvancedLightning from '../assets/images/drawer-icons/icon-drawer-advanced-lightning.svg'
//@ts-ignore
import IconDrawerHelp from '../assets/images/drawer-icons/icon-drawer-help.svg'
//@ts-ignore
import IconDrawerScan from '../assets/images/drawer-icons/icon-drawer-scan.svg'
//@ts-ignore
import IconDrawerPower from '../assets/images/drawer-icons/icon-drawer-power.svg'
// import IconDrawerHome from '../assets/images/drawer-icons/icon-drawer-help.svg'

export const APP = 'APP'
export const BOTTOM_NAV = 'BOTTOM_NAV'
export const WALLET_NAV = 'WALLET_NAV'
export const WALLET = 'WALLET'

const BottomNav = createBottomTabNavigator(
  {
    [WALLET_OVERVIEW]: WalletOverview,
    [CHATS_ROUTE]: Chats,
    [MY_PROFILE]: MyProfile,
    [Routes.FEED]: Feed,
  },
  {
    initialRouteName: WALLET_OVERVIEW,
    tabBarOptions: {
      allowFontScaling: false,
      showLabel: false,
      style: {
        borderTopWidth: 0,
        // backgroundColor: CSS.Colors.BACKGROUND_WHITE,
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
  // drawerIcon: () => {
  //   return <IconDrawerHome />
  // },
}

const MAIN_DRAWER = 'MAIN_DRAWER'
const theme = 'dark'

/** @type {import('react-navigation').NavigationRouteConfigMap} */

const drawerScreens = {
  [WALLET_NAV]: {
    screen: WalletNav,
    navigationOptions: {
      title: 'Home',
    },
  },
  [MY_PROFILE]: {
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
  /*[FEED]: {
    screen: Feed,
    navigationOptions: {
      title: 'Feed POC',
    },
  },*/
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
  /*[CREATE_POST]: { already declared
    screen: CreatePost,
    navigationOptions: {
      title: 'Publish Content Dark',
    },
  },*/
}

if (theme === 'dark') {
  //delete drawerScreens[SEED_BACKUP]
  //delete drawerScreens[FEED]
  delete drawerScreens[ADD_POST_TO_FEED]
  //delete drawerScreens[CREATE_POST]
  delete drawerScreens[LNURL_SCREEN]
  delete drawerScreens[PUBLISH_CONTENT_DARK]
}
//
// const drawerScreens = {
//   [WALLET_NAV]: {
//     screen: WalletNav,
//     navigationOptions: {
//       title: 'Home',
//     },
//   },
//   [ADVANCED_SCREEN]: {
//     screen: Advanced,
//     navigationOptions: {
//       title: 'Advanced Lightning',
//     },
//   },
//   [SEED_BACKUP]: {
//     screen: SeedBackup,
//     navigationOptions: {
//       title: 'Seed Backup',
//     },
//   },
//   [WALLET_SETTINGS]: {
//     screen: WalletSettings,
//     navigationOptions: {
//       title: 'Wallet Settings',
//     },
//   },
//   [FEED]: {
//     screen: Feed,
//     navigationOptions: {
//       title: 'Feed POC',
//     },
//   },
//   [ADD_POST_TO_FEED]: {
//     screen: AddPostToFeed,
//     navigationOptions: {
//       title: 'Add Post to Feed',
//     },
//   },
//   [CREATE_POST]: {
//     screen: CreatePost,
//     navigationOptions: {
//       title: 'Add Post to Feed',
//     },
//   },
//   [LNURL_SCREEN]: {
//     screen: LNURL,
//     navigationOptions: {
//       title: 'LNURL utils',
//     },
//   },
//   [PUBLISH_CONTENT_DARK]: {
//     screen: PublishContentDark,
//     navigationOptions: {
//       title: 'Publish Content',
//     },
//   },
//   [CREATE_POST_DARK]: {
//     screen: CreatePostDark,
//     navigationOptions: {
//       title: 'Publish Content Dark',
//     },
//   },
// }

if (__DEV__) {
  drawerScreens[DEBUG] = {
    screen: Debug,
    navigationOptions: {
      title: 'Debug',
    },
  }
}

const MainDrawer = createDrawerNavigator(drawerScreens, {
  initialRouteName: WALLET_NAV,
  drawerPosition: 'right',
  contentComponent: CustomDrawer,
  contentOptions: {
    labelStyle: {
      textAlign: 'right',
    },
  },
})

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
