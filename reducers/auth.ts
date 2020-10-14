import { Reducer } from 'redux'
import produce from 'immer'

import { Action } from '../app/actions'

interface State {
  alias: string
  host: string
  token: string
  gunPublicKey: string
}

const INITIAL_STATE: State = {
  alias: '',
  host: '',
  gunPublicKey: '',
  token: '',
}

const auth: Reducer<State, Action> = (state = INITIAL_STATE, action) =>
  produce(state, draft => {
    if (action.type === 'authed') {
      Object.assign(draft, action.data)
    }

    if (action.type === 'tokenDidInvalidate') {
      draft.token = ''
    }

    if (action.type === 'hostWasSet') {
      draft.host = action.data.host
    }
  })

export default auth
