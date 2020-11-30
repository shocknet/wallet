import { takeEvery, select } from 'redux-saga/effects'
import Logger from 'react-native-file-log'
import SocketIO from 'socket.io-client'
import { Constants } from 'shock-common'

import * as Actions from '../actions'
import * as Selectors from '../selectors'
import { rifle } from '../../services'

import { getStore } from './common'

let socket: ReturnType<typeof SocketIO> | null = null

function* mediaLib() {
  try {
    const state = Selectors.getStateRoot(yield select())
    const isReady = Selectors.isReady(state)
    const host = Selectors.selectHost(state)

    if (isReady && !socket) {
      socket = rifle(host, '$user::webTorrentSeed::on')

      socket.on('$shock', dataHandler)

      socket.on(Constants.ErrorCode.NOT_AUTH, () => {
        getStore().dispatch(Actions.tokenDidInvalidate())
        socket && socket.off('*')
        socket && socket.close()
      })

      socket.on('$error', (err: string) => {
        Logger.log('Error inside mediaLib* ()')
        Logger.log(err)
      })
    }

    if (!isReady && socket) {
      socket.off('*')
      socket.close()
      socket = null
    }
  } catch (err) {
    Logger.log('Error inside mediaLib* ()')
    Logger.log(err.message)
  }
}

const dataHandler = (webTorrentSeed: unknown) => {
  try {
    if (typeof webTorrentSeed === 'string') {
      getStore().dispatch(Actions.seedServerURLSet(webTorrentSeed))
    }
  } catch (err) {
    Logger.log('Error inside mediaLib* ()')
    Logger.log(err.message)
  }
}

function* rootSaga() {
  yield takeEvery('*', mediaLib)
}

export default rootSaga
