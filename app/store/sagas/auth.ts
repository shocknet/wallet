import { takeEvery } from 'redux-saga/effects'
import Logger from 'react-native-file-log'

import * as Actions from '../actions'
import { navigate } from '../../services'
import { AUTH } from '../../routes'

function* handleTokenInvalidation() {
  try {
    navigate(AUTH)
  } catch (err) {
    Logger.log(`Error inside handleTokenInvalidation* ()`)
    Logger.log(err.message)
  }
}

function* rootSaga() {
  yield takeEvery(Actions.tokenDidInvalidate, handleTokenInvalidation)
}

export default rootSaga
