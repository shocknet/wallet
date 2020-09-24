import { default as Http, AxiosResponse } from 'axios'
import { takeEvery, call, put, select } from 'redux-saga/effects'
import Logger from 'react-native-file-log'

import { receivedOwnInvoices } from '../../app/actions/InvoiceActions'
import {
  ListInvoiceResponse as ListInvoicesResponse,
  ListInvoiceRequest as ListInvoicesRequest,
} from '../../app/services'

let oldIsOnline = false

function* fetchLatestInvoices() {
  try {
    const newIsOnline = yield select(state => state.auth)
    const wentOnline = !oldIsOnline && newIsOnline

    oldIsOnline = newIsOnline

    if (!wentOnline) return

    const req: ListInvoicesRequest = {
      reversed: true,
      num_max_invoices: 50,
    }

    const { data, status }: AxiosResponse<ListInvoicesResponse> = yield call(
      Http.post,
      `api/lnd/cb`,
      req,
    )

    if (status !== 200) {
      throw new Error(JSON.stringify(data))
    }

    yield put(
      receivedOwnInvoices({
        first_index_offset: Number(data.first_index_offset),
        invoices: data.invoices,
        last_index_offset: Number(data.last_index_offset),
        originRequest: req,
      }),
    )
  } catch (err) {
    Logger.log(`Error inside fetchLatestInvoices* ()`)
    Logger.log(err)
  }
}

function* rootSaga() {
  yield takeEvery('*', fetchLatestInvoices)
}

export default rootSaga
