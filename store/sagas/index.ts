import * as Common from 'shock-common'
import { all, call } from 'redux-saga/effects'

import invoices from './invoices'

function* rootSaga() {
  yield all([call(Common.Store.rootSaga), call(invoices)])
}

export default rootSaga
