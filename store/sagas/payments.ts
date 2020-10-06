import { takeEvery, call, put, select } from 'redux-saga/effects'
import Logger from 'react-native-file-log'

import * as Actions from '../../app/actions'
import { ListPaymentsReq, ListPaymentsRes, post } from '../../app/services'
import { isOnline, getStateRoot } from '../selectors'

let oldIsOnline = false

function* fetchLatestPayments(action: Actions.Action) {
  try {
    const state = getStateRoot(yield select())

    if (!state.auth.token) {
      // If user was unauthenticated let's reset oldIsOnline to false, to avoid
      // wentOnline from being a false negative (and thus not fetching data).
      // Some false positives will occur but this is ok.
      oldIsOnline = false
      return
    }

    if (action.type !== 'payments/refreshForced') {
      const newIsOnline = isOnline(state)
      const wentOnline = !oldIsOnline && newIsOnline

      oldIsOnline = newIsOnline

      if (!wentOnline) return
    }

    const req: ListPaymentsReq = {
      reversed: true,
      max_payments: 50,
      include_incomplete: true,
    }

    const data: ListPaymentsRes = yield call(
      // @ts-expect-error WTF
      post,
      `/api/lnd/cb/listPayments`,
      req,
    )

    // we'll need to fetch them if not in decoded invoices
    const needsInvoiceDecoding = data.payments
      .filter(p => !state.decodedInvoices[p.payment_request])
      .map(p => p.payment_request)

    yield put(Actions.invoicesBatchDecodeReq(needsInvoiceDecoding))

    yield put(
      Actions.receivedOwnPayments({
        first_index_offset: Number(data.first_index_offset),
        last_index_offset: Number(data.last_index_offset),
        originRequest: req,
        payments: data.payments,
      }),
    )
  } catch (err) {
    Logger.log(`Error inside fetchLatestPayments* ()`)
    Logger.log(err.message)
  }
}

function* rootSaga() {
  yield takeEvery('*', fetchLatestPayments)
}

export default rootSaga
