import { all, call } from 'redux-saga/effects'

import invoices from './invoices'
import payments from './payments'
import chainTXs from './chain-txs'
import users from './users'
import posts from './posts'
import follows from './follows'
import ping from './ping'
import debug from './debug'

function* rootSaga() {
  yield all([
    call(invoices),
    call(payments),
    call(chainTXs),
    call(users),
    call(posts),
    call(follows),
    call(ping),
    call(debug),
  ])
}

export default rootSaga
