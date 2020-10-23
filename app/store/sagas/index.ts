import * as Common from 'shock-common'
import { all, call } from 'redux-saga/effects'

import invoices from './invoices'
import payments from './payments'
import chainTXs from './chain-txs'
import users from './users'
import posts from './posts'
import follows from './follows'

function* rootSaga() {
  yield all([
    call(Common.Store.rootSaga),
    call(invoices),
    call(payments),
    call(chainTXs),
    call(users),
    call(posts),
    call(follows),
  ])
}

export default rootSaga
