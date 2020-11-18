import { takeEvery, select, put } from 'redux-saga/effects'
import Logger from 'react-native-file-log'
import { io as SocketIO } from 'socket.io-client'
import { Constants } from 'shock-common'

import * as Actions from '../actions'
import * as Selectors from '../selectors'
import { getStore } from './common'

let socket: ReturnType<typeof SocketIO> | null = null

function* ping() {
  try {
    const {
      auth: { token, host },
    } = Selectors.getStateRoot(yield select())

    if (!token && socket) {
      Logger.log(`Will kill ping socket because of token invalidation`)
      socket!.off('*')
      socket!.close()
      socket = null

      // force next tick
      yield put({ type: 'keepAlive' })
    }

    if (token && !socket) {
      Logger.log(`Will try to connect ping socket`)
      socket = SocketIO(`http://${host}/shockping`, {
        query: {
          token,
        },
        reconnection: true,
        reconnectionDelay: 500,
        reconnectionAttempts: Infinity,
        transports: ['websocket'],
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

      socket.on('connect_error', (e: unknown) => {
        Logger.log(`ping socket connect_error`)
        console.log(e)
        Logger.log(e)
      })

      socket.on('connect_timeout', (timeout: unknown) => {
        Logger.log(`ping socket connect_timeout`)
        console.log(timeout)
        Logger.log(timeout)
      })

      socket.on('connect', () => {
        Logger.log('ping socket connect')
      })

      socket.on('disconnect', (reason: string) => {
        Logger.log(`ping socket disconncted due to -> ${reason}`)

        // from docs
        if (reason === 'io server disconnect') {
          // the disconnection was initiated by the server, you need to reconnect manually
          socket && socket.connect()
        }
        // else the socket will automatically try to reconnect
      })

      socket.on('error', (e: unknown) => {
        Logger.log(`Error inside ping socket`)
        console.log(e)
        Logger.log(e)
      })

      socket.on('reconnect', (attemptNumber: number) => {
        Logger.log(`ping socket reconnect attempt -> ${attemptNumber}`)
      })

      socket.on('reconnecting', (attemptNumber: number) => {
        Logger.log(`ping socket reconnecting attempt -> ${attemptNumber}`)
      })

      socket.on('reconnect_error', (e: unknown) => {
        Logger.log(`ping socket reconnect_error`)
        console.log(e)
        Logger.log(e)
      })

      socket.on('reconnect_failed', () => {
        Logger.log(`ping socket reconnect_failed`)
      })

      socket.on('ping', () => {
        Logger.log(`ping socket pinging api (socket.io internal)`)
      })

      socket.on('pong', () => {
        Logger.log(`ping socket ponged by api (socket.io internal)`)

        getStore().dispatch(Actions.ping(Date.now()))
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
