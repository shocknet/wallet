import { takeEvery, select } from 'redux-saga/effects'
import Logger from 'react-native-file-log'
import SocketIO from 'socket.io-client'
import difference from 'lodash/difference'

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
let oldPublicKeys: string[] = []

function* users() {
  try {
    const state = Selectors.getStateRoot(yield select())
    const isOnline = Selectors.isOnline(state)
    const wentOnline = !wasOnline && isOnline
    const wentOffline = wasOnline && !isOnline
    const isAuth = !!state.auth.token
    const authed = !wasAuthed && isAuth
    const unauthed = wasAuthed && !isAuth
    const allPublicKeys = Selectors.getAllOtherPublicKeys(state)
    const publicKeysChanged = allPublicKeys !== oldPublicKeys
    let newPublicKeys: string[] = []

    if (publicKeysChanged) {
      newPublicKeys = difference(allPublicKeys, oldPublicKeys)
      console.warn(`newPublicKeys: ${JSON.stringify(newPublicKeys)}`)
    }

    oldPublicKeys = allPublicKeys

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

      for (const publicKey of allPublicKeys) {
        const normalSocket = sockets['normal' + publicKey]
        const binarySocket = sockets['binary' + publicKey]

        if (normalSocket) {
          normalSocket.off('*')
          normalSocket.close()
          setSocket('normal' + publicKey, null)
        }

        if (binarySocket) {
          binarySocket.off('*')
          binarySocket.close()
          setSocket('binary' + publicKey, null)
        }
      }
    } else if (authed || wentOnline) {
      wasAuthed = isAuth
      // if authed then it's online
      wasOnline = true

      if (!isAuth) {
        return
      }
    } else if (isAuth && isOnline && publicKeysChanged) {
      assignSocketsToPublicKeys(newPublicKeys)
    }
  } catch (err) {
    Logger.log('Error inside users* ()')
    Logger.log(err.message)
  }
}

const assignSocketsToPublicKeys = (publicKeys: string[]) => {
  for (const publicKey of publicKeys) {
    const normalSocketName = 'normal' + publicKey
    const binarySocketName = 'binary' + publicKey

    setSocket(normalSocketName, rifle(`${publicKey}::Profile::on`))

    sockets[normalSocketName]!.on('$shock', (data: any) => {
      try {
        getStore().dispatch(
          Actions.receivedSingleUserData({
            bio: data.bio,
            displayName: data.displayName,
            lastSeenApp: data.lastSeenApp,
            lastSeenNode: data.lastSeenNode,
            publicKey,
          }),
        )
      } catch (err) {
        Logger.log('Error inside users* ()')
        Logger.log(err.message)
      }
    })

    sockets[normalSocketName]!.on('$error', (err: unknown) => {
      Logger.log('Error inside users* ()')
      Logger.log(err)
    })

    setSocket(binarySocketName, rifle(`${publicKey}::profileBinary::map.on`))

    sockets[binarySocketName]!.on('$shock', (data: any, key: string) => {
      try {
        if (key === 'avatar') {
          getStore().dispatch(
            Actions.receivedSingleUserData({
              publicKey,
              avatar: data,
            }),
          )
        } else if (key === 'header') {
          getStore().dispatch(
            Actions.receivedSingleUserData({
              publicKey,
              header: data,
            }),
          )
        } else {
          throw new TypeError(
            `Unknown key: ${key} for other user binary profile data gun RPC socket`,
          )
        }
      } catch (err) {
        Logger.log('Error inside users* ()')
        Logger.log(err.message)
      }
    })

    sockets[binarySocketName]!.on('$error', (err: unknown) => {
      Logger.log('Error inside users* ()')
      Logger.log(err)
    })
  }
}

function* rootSaga() {
  yield takeEvery('*', users)
}

export default rootSaga
