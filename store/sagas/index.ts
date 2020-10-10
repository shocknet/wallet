import * as Common from 'shock-common'
import { all, call } from 'redux-saga/effects'

import invoices from './invoices'
import payments from './payments'
import chainTXs from './chain-txs'

function* rootSaga() {
  yield all([
    call(Common.Store.rootSaga),
    call(invoices),
    call(payments),
    call(chainTXs),
  ])
}

export default rootSaga
