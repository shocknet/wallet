import { all, call } from 'redux-saga/effects'

import invoices from './invoices'
import payments from './payments'
import chainTXs from './chain-txs'
import users from './users'
import posts from './posts'
import follows from './follows'
import ping from './ping'
import debug from './debug'
import wallet from './wallet'
import chats from './chats'
import sentReqs from './sent-reqs'
import receivedReqs from './received-reqs'
import sharedPosts from './shared-posts'
import auth from './auth'
import mediaLib from './mediaLib'

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
    call(wallet),
    call(chats),
    call(sentReqs),
    call(receivedReqs),
    call(sharedPosts),
    call(auth),
    call(mediaLib),
  ])
}

export default rootSaga
