/**
 * We store route constants here so that both screens and
 * withNavigation()-wrapped components can reference them without resulting in
 * circular dependencies. E.g. a go-to-user button that navigates to the User
 * and previously imported the constant from there is also imported by that same
 * screen resulting in a circular dependency.
 *
 * Same goes for parameter interfaces.
 */

export const USER = 'USER'

export interface UserParams {
  publicKey: string
}

export const FEED = 'FEED'

export const MY_PROFILE = 'MY_PROFILE'

export const WALLET_OVERVIEW = 'WALLET_OVERVIEW'

export const CHATS_ROUTE = 'CHATS_ROUTE'

export const SEND_SCREEN = 'SEND_SCREEN'

export const RECEIVE_SCREEN = 'RECEIVE_SCREEN'

export const DEBUG = 'DEBUG'

export const WALLET_SETTINGS = 'WALLET_SETTINGS'

export const ADVANCED_SCREEN = 'ADVANCED_SCREEN'

export const SEED_BACKUP = 'SEED_BACKUP'

export const ADD_POST_TO_FEED = 'ADD_POST_TO_FEED'

export const CREATE_POST = 'CREATE_POST'

export const LNURL_SCREEN = 'LNURL_SCREEN'

export const PUBLISH_CONTENT_DARK = 'PUBLISH_CONTENT_DARK'

export const CHAT_ROUTE = 'CHAT_ROUTE'

export const MAIN_DRAWER = 'MAIN_DRAWER'

export const NODE_INFO = 'NODE_INFO'

export const LOGIN = 'LOGIN'

export const WALLET_MANAGER = 'WALLET_MANAGER'

export const CONNECT_TO_NODE = 'CONNECT_TO_NODE'

export const APP = 'APP'

export const BOTTOM_NAV = 'BOTTOM_NAV'

export const WALLET_NAV = 'WALLET_NAV'

export const WALLET = 'WALLET'

export const LOADING = 'LOADING'

export const AUTH = 'AUTH'

export const MOONPAY_SCREEN = 'MOONPAY_SCREEN'
