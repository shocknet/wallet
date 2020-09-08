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
/**
 * @typedef {object} UserParams
 * @prop {string} publicKey
 */

export const FEED = 'FEED'
