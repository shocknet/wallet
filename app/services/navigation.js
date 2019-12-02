/** @format  */
import { NavigationActions } from 'react-navigation'
/**
 * @typedef {import('react-navigation').NavigationNavigateAction} NavigationNavigateAction
 */

/**
 * @type {import('react-navigation').NavigationContainerComponent|null}
 */
let navRef = null

let currentRoute = ''

/**
 * @param {import('react-navigation').NavigationContainerComponent|null} navigatorRef
 * @returns {void}
 */
export const setTopLevelNavigator = navigatorRef => {
  navRef = navigatorRef
}

/**
 * @param {string} route
 */
export const setCurrentRoute = route => {
  currentRoute = route
}

/**
 * @returns {string}
 */
export const getCurrentRoute = () => {
  return currentRoute
}

/**
 * @param {string} routeName
 * @param {Record<string, any>=} params
 * @param {NavigationNavigateAction=} action
 * @returns {void}
 */
export const navigate = (routeName, params, action) => {
  if (navRef === null) {
    console.warn(
      'called navigate() at navigation service without providing a navigation container component reference first',
    )
  } else {
    navRef.dispatch(
      NavigationActions.navigate({
        routeName,
        params,
        action,
      }),
    )
  }
}
