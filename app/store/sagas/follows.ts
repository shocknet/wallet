import { takeEvery, select } from 'redux-saga/effects'
import Logger from 'react-native-file-log'
import { io as SocketIO } from 'socket.io-client'
import { Schema, Constants } from 'shock-common'

import * as Actions from '../actions'
import * as Selectors from '../selectors'
import { rifle } from '../../services'

import { getStore } from './common'

let socket: ReturnType<typeof SocketIO> | null = null

function* follows() {
  try {
    const state = Selectors.getStateRoot(yield select())
    const isReady = Selectors.isReady(state)
    const host = Selectors.selectHost(state)

    if (isReady && !socket) {
      socket = rifle(host, '$user::follows::map.on')

      socket.on('$shock', dataHandler)

      socket.on(Constants.ErrorCode.NOT_AUTH, () => {
        getStore().dispatch(Actions.tokenDidInvalidate())
        socket && socket.off('*')
        socket && socket.close()
      })

      socket.on('$error', (err: string) => {
        Logger.log('Error inside follows* ()')

        Logger.log(err)
      })
    }

    if (!isReady && socket) {
      socket.off('*')
      socket.close()
      socket = null
    }
  } catch (err) {
    Logger.log('Error inside follows* ()')
    Logger.log(err.message)
  }
}

const dataHandler = (follow: Schema.Follow | null, key: string | undefined) => {
  try {
    if (typeof key !== 'string') {
      throw new TypeError(`Follow key not an string instead got: ${key}`)
    }

    if (follow === null) {
      getStore().dispatch(Actions.Follows.finishedUnfollow(key))
      return
    }

    if (!Schema.isFollow(follow)) {
      throw new TypeError(`Not a follow: ${JSON.stringify(follow)}`)
    }

    getStore().dispatch(Actions.Follows.finishedFollow(follow.user))
  } catch (err) {
    Logger.log('Error inside follows* ()')
    Logger.log(err.message)
  }
}

function* rootSaga() {
  yield takeEvery('*', follows)
}

export default rootSaga
