import * as Common from 'shock-common'
import { all, call } from 'redux-saga/effects'

import invoices from './invoices'
import payments from './payments'

function* rootSaga() {
  yield all([call(Common.Store.rootSaga), call(invoices), call(payments)])
}

export default rootSaga
