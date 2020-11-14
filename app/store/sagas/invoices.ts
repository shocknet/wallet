import { takeEvery, call, put, select } from 'redux-saga/effects'
import Logger from 'react-native-file-log'
import { Schema } from 'shock-common'
import { default as SocketIO } from 'socket.io-client'

import * as Actions from '../actions'
import {
  ListInvoiceRequest as ListInvoicesRequest,
  post,
  batchDecodePayReqs,
  rod,
} from '../../services'
import * as Selectors from '../selectors'

import { getStore } from './common'

let socket: ReturnType<typeof SocketIO> | null = null

function* invoicesSocket() {
  try {
    const state = Selectors.getStateRoot(yield select())
    const isReady = Selectors.isReady(state)

    if (isReady && !socket) {
      socket = rod('lightning', 'subscribeInvoices', {})

      socket.on('data', (invoice: unknown) => {
        if (!Schema.isInvoiceWhenListed(invoice)) {
          Logger.log(`Error inside invoicesSocket* ()`)
          Logger.log(
            `data received from subscribeInvoices() not a InvoiceLIsted`,
          )
          Logger.log(invoice)
          return
        }

        const store = getStore()
        const state = store.getState()

        if (state.auth.token) {
          store.dispatch(Actions.receivedSingleInvoice(invoice))
        }
      })

      socket.on('$error', (err: unknown) => {
        Logger.log(`Error inside invoicesSocket* ()`)
        Logger.log(err)
      })
    }
  } catch (err) {
    Logger.log(`Error inside invoicesSocket* ()`)
    Logger.log(err.message)
  }
}

let oldIsOnline = false

function* fetchLatestInvoices(action: Actions.Action) {
  try {
    const state = Selectors.getStateRoot(yield select())

    if (!state.auth.token) {
      // If user was unauthenticated let's reset oldIsOnline to false, to avoid
      // wentOnline from being a false negative (and thus not fetching data).
      // Some false positives will occur but this is ok. In other words
      // unauthenticated is equivalent to disconnected from the server (no
      // interactions whatsoever).
      oldIsOnline = false
      return
    }

    if (action.type === 'messages/load') {
      const { data } = action
      const bodies = Object.values(data).map(m => m.body)
      const invoices = bodies
        .filter(b => b.startsWith('$$__SHOCKWALLET__INVOICE__'))
        .map(b => b.slice('$$__SHOCKWALLET__INVOICE__'.length))

      yield put(Actions.invoicesBatchDecodeReq(invoices))
      return
    }

    if (action.type !== 'invoicesRefreshForced') {
      const newIsOnline = Selectors.isOnline(state)
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
  try {
    const { payReqs } = action.data

    const decoded: Schema.InvoiceWhenDecoded[] = yield call(
      batchDecodePayReqs,
      payReqs,
    )

    yield put(Actions.invoicesBatchDecodeRes(payReqs, decoded))
  } catch (e) {
    Logger.log(`Error inside batchDecodeInvoices* () -> ${e.message}`)
  }
}

function* rootSaga() {
  yield takeEvery('*', fetchLatestInvoices)
  yield takeEvery(Actions.invoicesBatchDecodeReq, batchDecodeInvoices)
  yield takeEvery('*', invoicesSocket)
}

export default rootSaga
