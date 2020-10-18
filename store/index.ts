import { Dispatch as _Dispatch } from 'redux'

import { default as configureStore } from './store'
import { State as _State } from '../reducers'
import { Action } from '../app/actions'

export type State = _State
export type Dispatch = _Dispatch<Action>

export * from './store'
export * from './selectors'

export default configureStore
