import { takeEvery, call, put, select } from 'redux-saga/effects'
import Logger from 'react-native-file-log'
import { GetTransactionsRequest, TransactionDetails } from 'shock-common'

import * as Actions from '../../app/actions'
import { isOnline, getStateRoot } from '../selectors'
import { post } from '../../app/services'

let oldIsOnline = false

function* fetchLatestChainTransactions(action: Actions.Action) {
  try {
    const state = getStateRoot(yield select())

    if (!state.auth.token) {
      // If user was unauthenticated let's reset oldIsOnline to false, to avoid
      // wentOnline from being a false negative (and thus not fetching data).
      // Some false positives will occur but this is ok.
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
}

export default rootSaga
