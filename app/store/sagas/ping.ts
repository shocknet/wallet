import { takeEvery, select, put } from 'redux-saga/effects'
import Logger from 'react-native-file-log'
import SocketIO from 'socket.io-client'
import { Constants } from 'shock-common'

import * as Actions from '../actions'
import * as Selectors from '../selectors'
import { getStore } from '../store'

let socket: ReturnType<typeof SocketIO> | null = null

/**
 * Allow some leeway for the new socket to actually receive that first ping.
 */
let lastHandshake = Date.now()

function* ping() {
  try {
    const {
      auth: { token, host },
      connection: { lastPing },
    } = Selectors.getStateRoot(yield select())

    const socketIsDead =
      socket &&
      Date.now() - lastPing > 12000 &&
      Date.now() - lastHandshake > 12000

    if (socketIsDead) {
      Logger.log(
        `Socket is dead, claims ${
          socket!.connected ? 'to be connected' : 'to be offline'
        }`,
      )
    }

    if ((!token && socket) || socketIsDead) {
      Logger.log(`Will kill ping socket`)
      socket!.off('*')
      socket!.close()
      socket = null

      // force next tick
      yield put({ type: 'keepAlive' })
    }

    if (token && !socket) {
      lastHandshake = Date.now()
      Logger.log(`Will try to connect ping socket`)
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

      socket.on('$error', (e: string) => {
        Logger.log(`Error received by ping socket: ${e}`)
      })
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
