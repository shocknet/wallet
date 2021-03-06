import { State } from '../reducers'

export const getMyPublicKey = (state: State) => state.auth.gunPublicKey

export const isAuth = (state: State): boolean => !!state.auth.token

export const selectHost = (state: State): string => state.auth.host
