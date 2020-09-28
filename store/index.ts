import { default as configureStore } from './store'
import { State as _State } from '../reducers'

export type State = _State

export * from './store'
export * from './selectors'

export default configureStore
