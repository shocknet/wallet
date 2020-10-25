import { takeEvery, select } from 'redux-saga/effects'
import Logger from 'react-native-file-log'
import SocketIO from 'socket.io-client'
import { Constants } from 'shock-common'

import * as Actions from '../actions'
import * as Selectors from '../selectors'
import { getStore } from '../store'

let socket: ReturnType<typeof SocketIO> | null = null

function* ping() {
  try {
    const state = Selectors.getStateRoot(yield select())
    const { token, host } = state.auth

    if (token && !socket) {
      socket = SocketIO(`http://${host}/shockping`, {
        query: {
          token,
        },
      })

      socket.on('shockping', () => {
        getStore().dispatch(Actions.ping(Date.now()))
      })

      socket.on(Constants.ErrorCode.NOT_AUTH, () => {
        getStore().dispatch(Actions.tokenDidInvalidate())
      })
    }

    if (!token && socket) {
      socket.off('*')
      socket.close()
      socket = null
    }
  } catch (err) {
    Logger.log('Error inside ping* ()')
    Logger.log(err.message)
  }
}

function* rootSaga() {
  yield takeEvery('*', ping)
}

export default rootSaga
