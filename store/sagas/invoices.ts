import { takeEvery, call, put, select } from 'redux-saga/effects'
import Logger from 'react-native-file-log'
import { Schema } from 'shock-common'

import * as Actions from '../../app/actions'
import {
  ListInvoiceRequest as ListInvoicesRequest,
  post,
  batchDecodePayReqs,
} from '../../app/services'
import { isOnline, getStateRoot } from '../selectors'

let oldIsOnline = false

function* fetchLatestInvoices(action: Actions.Action) {
  try {
    if (action.type !== 'invoicesRefreshForced') {
      const state = getStateRoot(yield select())

      if (!state.auth.token) {
        // If user was unauthenticated let's reset oldIsOnline to false, to avoid
        // wentOnline from being a false negative (and thus not fetching data).
        // Some false positives will occur but this is ok.
        oldIsOnline = false
        return
      }

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
        first_index_offset: Number(data.first_index_offset),
        invoices: data.invoices,
        last_index_offset: Number(data.last_index_offset),
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
}

export default rootSaga
