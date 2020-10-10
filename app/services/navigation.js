/** @format  */
import { NavigationActions } from 'react-navigation'
import { DrawerActions } from 'react-navigation-drawer'
/**
 * @typedef {import('react-navigation').NavigationNavigateAction} NavigationNavigateAction
 * @typedef {import('react-navigation').NavigationContainerComponent} NavigationContainerComponent
 */

/**
 * @type {NavigationContainerComponent|null}
 */
let navRef = null

/**
 * @param {NavigationContainerComponent|null} navigatorRef
 * @returns {void}
 */
export const setTopLevelNavigator = navigatorRef => {
  navRef = navigatorRef
}

/**
 * @param {string} routeName
 * @param {Record<string, any>=} params
 * @param {NavigationNavigateAction=} action
 * @returns {void}
 */
export const navigate = (routeName, params, action) => {
  if (navRef === null) {
    throw new Error(
      'called navigate() at navigation service without providing a navigation container component reference first',
    )
  }
  navRef.dispatch(
    NavigationActions.navigate({
      routeName,
      params,
      action,
    }),
  )
}

/**
 * @returns {void}
 */
export const toggleDrawer = () => {
  if (navRef === null) {
    throw new Error(
      'called navigate() at navigation service without providing a navigation container component reference first',
    )
  }
  navRef.dispatch(DrawerActions.toggleDrawer())
}
