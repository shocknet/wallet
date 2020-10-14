import { takeEvery, call, put, select } from 'redux-saga/effects'
import Logger from 'react-native-file-log'
import {
  GetTransactionsRequest,
  TransactionDetails,
  Schema,
} from 'shock-common'
import SocketIO from 'socket.io-client'

import * as Actions from '../../app/actions'
import { isOnline, getStateRoot } from '../selectors'
import { post, rod } from '../../app/services'
import { getStore } from '../store'

let socket: ReturnType<typeof SocketIO> | null = null

const setSocket = (s: ReturnType<typeof SocketIO> | null) => {
  if (socket && !!s) throw new Error('Tried to set socket twice')
  socket = s
}

let oldIsAuth = false

function* chainTXsSocket() {
  try {
    const state = getStateRoot(yield select())

    if (!isOnline(state)) {
      oldIsAuth = false
      // We have no way of knowing if we'll be really authenticated (wallet
      // unlocked) when we connect again
      if (socket) {
        socket.off('*')
        socket.close()
        setSocket(null)
      }
      return
    }

    const newIsAuth = !!state.auth.token
    const authed = !oldIsAuth && newIsAuth

    oldIsAuth = newIsAuth

    if (!authed) {
      return
    }

    setSocket(
      rod('lightning', 'subscribeTransactions', {
        end_height: -1,
      }),
    )

    socket!.on('data', (chainTX: unknown) => {
      if (!Schema.isChainTransaction(chainTX)) {
        Logger.log(`Error inside chainTXsSocket* ()`)
        Logger.log(
          `data received from subscribeTransactions() not a ChainTransaction`,
        )
        Logger.log(chainTX)
        return
      }

      const store = getStore()
      const state = store.getState()

      if (state.auth.token) {
        store.dispatch(Actions.receivedSingleChainTX(chainTX))
      }
    })

    socket!.on('$error', (err: unknown) => {
      Logger.log(`Error inside chainTXsSocket* ()`)
      Logger.log(err)
    })
  } catch (err) {
    Logger.log(`Error inside chainTXsSocket* ()`)
    Logger.log(err.message)
  }
}

let oldIsOnline = false

function* fetchLatestChainTransactions(action: Actions.Action) {
  try {
    const state = getStateRoot(yield select())

    if (!state.auth.token) {
      // If user was unauthenticated let's reset oldIsOnline to false, to avoid
      // wentOnline from being a false negative (and thus not fetching data).
      // Some false positives will occur but this is ok. In other words
      // unauthenticated is equivalent to disconnected from the server (no
      // interactions whatsoever).
      oldIsOnline = false
      return
    }

    if (action.type !== 'chainTXs/refreshForced') {
      const newIsOnline = isOnline(state)
      const wentOnline = !oldIsOnline && newIsOnline

      oldIsOnline = newIsOnline

      if (!wentOnline) return // let the socket handle it
    }

    const req: GetTransactionsRequest = {
      end_height: -1,
    }

    const data: TransactionDetails = yield call<typeof post>(
      post,
      `/api/lnd/cb/getTransactions`,
      req,
    )

    yield put(
      Actions.receivedChainTransactions({
        transactions: data.transactions,
        originRequest: req,
      }),
    )
  } catch (err) {
    Logger.log(`Error inside fetchLatestChainTransactions* ()`)
    Logger.log(err.message)
  }
}

function* rootSaga() {
  yield takeEvery('*', fetchLatestChainTransactions)
  yield takeEvery('*', chainTXsSocket)
}

export default rootSaga
