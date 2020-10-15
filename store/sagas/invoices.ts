import { takeEvery, call, put, select } from 'redux-saga/effects'
import Logger from 'react-native-file-log'
import { Schema } from 'shock-common'
import { default as SocketIO } from 'socket.io-client'

import * as Actions from '../../app/actions'
import {
  ListInvoiceRequest as ListInvoicesRequest,
  post,
  batchDecodePayReqs,
  rod,
} from '../../app/services'
import { isOnline, getStateRoot } from '../selectors'
import { getStore } from '../store'

let socket: ReturnType<typeof SocketIO> | null = null

const setSockedt = (s: ReturnType<typeof SocketIO> | null) => {
  if (socket && !!s) throw new Error('Tried to set socket twice')
  socket = s
}

let oldIsAuth = false

function* invoicesSocket() {
  try {
    const state = getStateRoot(yield select())

    if (!isOnline(state)) {
      oldIsAuth = false
      // We have no way of knowing if we'll be really authenticated (wallet
      // unlocked) when we connect again
      if (socket) {
        socket.off('*')
        socket.close()
        setSockedt(null)
      }
      return
    }

    const newIsAuth = !!state.auth.token
    const authed = !oldIsAuth && newIsAuth

    oldIsAuth = newIsAuth

    if (!authed) {
      return
    }

    setSockedt(rod('lightning', 'subscribeInvoices', {}))

    socket!.on('data', (invoice: unknown) => {
      if (!Schema.isInvoiceWhenListed(invoice)) {
        Logger.log(`Error inside invoicesSocket* ()`)
        Logger.log(`data received from subscribeInvoices() not a InvoiceLIsted`)
        Logger.log(invoice)
        return
      }

      const store = getStore()
      const state = store.getState()

      if (state.auth.token) {
        store.dispatch(Actions.receivedSingleInvoice(invoice))
      }
    })

    socket!.on('$error', (err: unknown) => {
      Logger.log(`Error inside invoicesSocket* ()`)
      Logger.log(err)
    })
  } catch (err) {
    Logger.log(`Error inside invoicesSocket* ()`)
    Logger.log(err.message)
  }
}

let oldIsOnline = false

function* fetchLatestInvoices(action: Actions.Action) {
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

    if (action.type !== 'invoicesRefreshForced') {
      const newIsOnline = isOnline(state)
      const wentOnline = !oldIsOnline && newIsOnline

      oldIsOnline = newIsOnline

      if (!wentOnline) return
    }

    const req: ListInvoicesRequest = {
      reversed: true,
      num_max_invoices: 50,
    }

    const data = yield call(post, `/api/lnd/cb/listInvoices`, req)

    yield put(
      Actions.receivedOwnInvoices({
        invoices: data.invoices,
        originRequest: req,
      }),
    )
  } catch (err) {
    Logger.log(`Error inside fetchLatestInvoices* ()`)
    Logger.log(err.message)
  }
}

function* batchDecodeInvoices(action: Actions.InvoicesBatchDecodeReqAction) {
  const { payReqs } = action.data

  const decoded: Schema.InvoiceWhenDecoded[] = yield call(
    batchDecodePayReqs,
    payReqs,
  )

  yield put(Actions.invoicesBatchDecodeRes(payReqs, decoded))
}

function* rootSaga() {
  yield takeEvery('*', fetchLatestInvoices)
  yield takeEvery(Actions.invoicesBatchDecodeReq, batchDecodeInvoices)
  yield takeEvery('*', invoicesSocket)
}

export default rootSaga
