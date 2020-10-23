import { takeEvery, select } from 'redux-saga/effects'
import Logger from 'react-native-file-log'
import SocketIO from 'socket.io-client'
import { Schema } from 'shock-common'

import * as Actions from '../actions'
import * as Selectors from '../selectors'
import { rifle } from '../../services'
import { getStore } from '../store'

let socket: ReturnType<typeof SocketIO> | null = null

const setSocket = (s: ReturnType<typeof SocketIO> | null) => {
  if (socket && !!s) throw new Error('Tried to set socket twice')
  if (!socket && !s) throw new Error('Tried to null out socket twice')
  socket = s
}

let wasOnline = false
let wasAuthed = false

function* follows() {
  try {
    const state = Selectors.getStateRoot(yield select())
    const isOnline = Selectors.isOnline(state)
    const wentOnline = !wasOnline && isOnline
    const wentOffline = wasOnline && !isOnline
    const isAuth = !!state.auth.token
    const authed = !wasAuthed && isAuth
    const unauthed = wasAuthed && !isAuth

    if (wentOffline || unauthed) {
      // If user was unauthenticated let's reset oldIsOnline to false, to avoid
      // wentOnline from being a false negative (and thus not fetching data).
      // Some false positives will occur but this is ok. In other words
      // unauthenticated is equivalent to disconnected from the server (no
      // interactions whatsoever).
      wasOnline = false

      // We have no way of knowing if we'll be really authenticated (or wallet
      // unlocked or gun authed) when we connect again
      wasAuthed = false

      if (socket) {
        socket.off('*')
        socket.close()
        setSocket(null)
      }
    } else if (authed || wentOnline) {
      wasAuthed = isAuth
      // if authed then it's online
      wasOnline = true

      if (!isAuth) {
        return
      }

      const socket = rifle('$user::follows::map.on')

      socket.on('$shock', dataHandler)

      socket.on('$error', (err: string) => {
        Logger.log('Error inside follows* ()')
        Logger.log(err)
      })
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
