import { takeEvery, select } from 'redux-saga/effects'
import Logger from 'react-native-file-log'
import SocketIO from 'socket.io-client'

import * as Actions from '../../app/actions'
import * as Selectors from '../selectors'
import { rifle } from '../../app/services'
import { getStore } from '../store'

const sockets: Record<string, ReturnType<typeof SocketIO> | null> = {}

const setSocket = (name: string, s: ReturnType<typeof SocketIO> | null) => {
  const socket = sockets[name]
  if (socket && !!s) throw new Error('Tried to set socket twice')
  sockets[name] = s
}

let wasOnline = false
let wasAuthed = false

function* me() {
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

      if (sockets['header']) {
        sockets['header'].off('*')
        sockets['header'].close()
        setSocket('header', null)
      }

      if (sockets['avatar']) {
        sockets['avatar'].off('*')
        sockets['avatar'].close()
        setSocket('avatar', null)
      }
    } else if (authed || wentOnline) {
      wasAuthed = isAuth
      // if authed then it's online
      wasOnline = true

      if (isAuth) {
        setSocket('header', rifle('$user::profileBinary.header::on'))

        sockets['header']!.on('$shock', (header: unknown) => {
          try {
            if (typeof header !== 'string') {
              Logger.log('Error inside me* ()')
              Logger.log("typeof header !== 'string'")
              return
            }

            getStore().dispatch(
              Actions.receivedMeData({
                header,
              }),
            )
          } catch (err) {
            Logger.log('Error inside me* ()')
            Logger.log(err)
          }
        })

        sockets['header']!.on('$error', (err: unknown) => {
          Logger.log('Error inside me* ()')
          Logger.log(err)
        })

        setSocket('avatar', rifle('$user::profileBinary.avatar::on'))

        sockets['avatar']!.on('$shock', (avatar: unknown) => {
          try {
            if (typeof avatar !== 'string' && avatar !== null) {
              throw new TypeError(
                "typeof avatar !== 'string' && avatar !== null",
              )
            }

            getStore().dispatch(
              Actions.receivedMeData({
                avatar,
              }),
            )
          } catch (err) {
            Logger.log('Error inside me* ()')
            Logger.log(err.message)
          }
        })

        sockets['avatar']!.on('$error', (err: unknown) => {
          Logger.log('Error inside me* ()')
          Logger.log(err)
        })
      }
    }
  } catch (err) {
    Logger.log('Error inside me* ()')
    Logger.log(err.message)
  }
}

function* rootSaga() {
  yield takeEvery('*', me)
}

export default rootSaga
