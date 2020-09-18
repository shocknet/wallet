import { Reducer } from 'redux'
import produce from 'immer'

import { Action } from '../app/actions'

interface State {
  alias: string
  host: string
  token: string
  gunPublicKey: string
  lightningPublicKey: string
}

const INITIAL_STATE: State = {
  alias: '',
  host: '',
  lightningPublicKey: '',
  gunPublicKey: '',
  token: '',
}

const auth: Reducer<State, Action> = (state = INITIAL_STATE, action) =>
  produce(state, draft => {
    if (action.type === 'authed') {
      Object.assign(draft, action.data)
    }

    if (action.type === 'tokenDidInvalidate') {
      Object.assign(draft, INITIAL_STATE)
    }

    if (action.type === 'hostWasSet') {
      draft.host = action.data.host
    }
  })

export default auth
