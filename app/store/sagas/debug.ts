import { takeEvery, select } from 'redux-saga/effects'
import Logger from 'react-native-file-log'

import { getStateRoot } from '../selectors'
import { Action } from '../actions'

function* debug(action: Action) {
  try {
    const state = getStateRoot(yield select())

    // check not a log action else infinite recursion will happen
    if (state.debug.enabled && action.type !== 'debug/log') {
      Logger.log(JSON.stringify(action))
    }
  } catch (err) {
    Logger.log('Error inside debug* ()')
    Logger.log(err.message)
  }
}

function* rootSaga() {
  yield takeEvery('*', debug)
}

export default rootSaga
