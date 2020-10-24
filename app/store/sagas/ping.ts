import { takeEvery, select } from 'redux-saga/effects'
import Logger from 'react-native-file-log'
import SocketIO from 'socket.io-client'
import { Constants } from 'shock-common'

import * as Actions from '../actions'
import * as Selectors from '../selectors'
import { getStore } from '../store'

let socket: ReturnType<typeof SocketIO> | null = null

const setSocket = (s: ReturnType<typeof SocketIO> | null) => {
  if (socket && !!s) throw new Error('Tried to set socket twice')
  if (!socket && !s) throw new Error('Tried to null out socket twice')
  socket = s
}

function* ping() {
  try {
    const state = Selectors.getStateRoot(yield select())
    const { token, host } = state.auth

    if (token && !socket) {
      const _socket = SocketIO(`http://${host}/shockping`, {
        query: {
          token,
        },
      })

      setSocket(_socket)

      _socket.on('shockping', () => {
        getStore().dispatch(Actions.ping(Date.now()))
      })

      _socket.on(Constants.ErrorCode.NOT_AUTH, () => {
        getStore().dispatch(Actions.tokenDidInvalidate())
      })
    }

    if (!token && socket) {
      socket.off('*')
      socket.close()
      setSocket(null)
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
