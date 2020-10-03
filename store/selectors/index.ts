import { State } from '../../reducers'

export * from './connection'
export * from './invoices'
export * from './payments'
export * from './tx'

/**
 * For use inside sagas, allows typing of the return value from the select
 * effect.
 * @param state
 */
export const getStateRoot = (state: State) => state
