import { select, all, takeEvery } from 'redux-saga/effects'
import Logger from 'react-native-file-log'
import * as Common from 'shock-common'

import * as Actions from '../actions'
import * as Services from '../../services'
import * as Selectors from '../selectors'
import { getStore } from './common'

let USDRateTimeoutID: ReturnType<typeof setTimeout> | null = null
const USD_RATE_INTERVAL_TIME = 15000

let balanceTimeoutID: ReturnType<typeof setTimeout> | null = null
const BALANCE_INTERVAL_TIME = 4000

const USDRateFetcher = () => {
  Services.USDExchangeRate()
    .then(rate => {
      // Canary
      Logger.log(`Received exchange rate: ${rate}`)
      getStore().dispatch(Actions.loadedUSDRate(rate))
    })
    .catch(e => {
      if (e.message === Common.Constants.ErrorCode.NOT_AUTH) {
        getStore().dispatch(Actions.tokenDidInvalidate())
      } else {
        Logger.log(`Error inside USDRateFetcher -> ${e.message}`)
      }
    })
    .finally(() => {
      // check that poll wasn't killed
      if (USDRateTimeoutID) {
        USDRateTimeoutID = setTimeout(USDRateFetcher, USD_RATE_INTERVAL_TIME)
      }
    })
}

function* USDRateWatcher() {
  try {
    const state = Selectors.getStateRoot(yield select())
    const isReady = Selectors.isOnline(state) && Selectors.isAuth(state)

    if (isReady && !USDRateTimeoutID) {
      USDRateTimeoutID = setTimeout(USDRateFetcher, USD_RATE_INTERVAL_TIME)
    }

    if (!isReady && USDRateTimeoutID) {
      clearTimeout(USDRateTimeoutID)
      USDRateTimeoutID = null
    }
  } catch (e) {
    Logger.log(`Error inside USDRateWatcher* ()`)
    Logger.log(e.message)
  }
}

const balanceFetcher = () => {
  Services.balance()
    .then(({ channel_balance, confirmed_balance, pending_channel_balance }) => {
      getStore().dispatch(
        Actions.loadedBalance(
          confirmed_balance,
          pending_channel_balance,
          channel_balance,
        ),
      )
    })
    .catch(e => {
      if (e.message === Common.Constants.ErrorCode.NOT_AUTH) {
        getStore().dispatch(Actions.tokenDidInvalidate())
      } else {
        Logger.log(`Error inside balanceFetcher -> ${e.message}`)
      }
    })
    .finally(() => {
      // check that poll wasn't killed
      if (balanceTimeoutID) {
        balanceTimeoutID = setTimeout(balanceFetcher, BALANCE_INTERVAL_TIME)
      }
    })
}

function* balanceWatcher() {
  try {
    const state = Selectors.getStateRoot(yield select())
    const isReady = Selectors.isOnline(state) && Selectors.isAuth(state)

    if (isReady && !balanceTimeoutID) {
      balanceTimeoutID = setTimeout(balanceFetcher, BALANCE_INTERVAL_TIME)
    }

    if (!isReady && balanceTimeoutID) {
      clearTimeout(balanceTimeoutID)
      balanceTimeoutID = null
    }
  } catch (e) {
    Logger.log(`Error inside balanceWatcher* ()`)
    Logger.log(e.message)
  }
}

function* rootSaga() {
  yield all([takeEvery('*', USDRateWatcher), takeEvery('*', balanceWatcher)])
}

export default rootSaga
