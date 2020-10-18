import * as Common from 'shock-common'
import { all, call } from 'redux-saga/effects'

import invoices from './invoices'
import payments from './payments'
import chainTXs from './chain-txs'
import me from './me'

function* rootSaga() {
  yield all([
    call(Common.Store.rootSaga),
    call(invoices),
    call(payments),
    call(chainTXs),
    call(me),
  ])
}

export default rootSaga
