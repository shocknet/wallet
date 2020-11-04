import { Reducer } from 'redux'
import produce from 'immer'

import { Action, enableDebug, disableDebug } from '../actions'

const INITIAL_STATE = {
  enabled: __DEV__,
  logs: [] as string[],
}

type DebugState = typeof INITIAL_STATE

const insertLog = (line: string, logs: string[]) => {
  logs.push(line)

  if (logs.length > 100) {
    logs.splice(0, 1)
  }
}

const reducer: Reducer<DebugState, Action> = (state = INITIAL_STATE, action) =>
  produce(state, draft => {
    if (enableDebug.match(action)) {
      state.enabled = true
    }

    if (disableDebug.match(action)) {
      state.enabled = false
    }

    if (!state.enabled) {
      return
    }

    if (action.type === 'debug/log') {
      for (const line of action.payload.content) {
        insertLog(line, draft.logs)
      }
    }
  })

export default reducer
