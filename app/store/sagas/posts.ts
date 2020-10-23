import { takeEvery, select } from 'redux-saga/effects'
import Logger from 'react-native-file-log'
import SocketIO from 'socket.io-client'
import difference from 'lodash/difference'
import isEqual from 'lodash/isEqual'
import { Constants, Schema } from 'shock-common'
import pickBy from 'lodash/pickBy'

import * as Actions from '../actions'
import * as Selectors from '../selectors'
import { rifle, get as httpGet } from '../../services'
import { getStore } from '../store'

/**
 * Maps public key to posts socket.
 */
const sockets: Record<string, ReturnType<typeof SocketIO> | null> = {}

const setSocket = (
  publicKey: string,
  s: ReturnType<typeof SocketIO> | null,
) => {
  const socket = sockets[publicKey]
  if (socket && !!s) throw new Error('Tried to set socket twice')
  sockets[publicKey] = s
}

let wasOnline = false
let wasAuthed = false
let oldPublicKeys: string[] = []

function* posts() {
  try {
    const state = Selectors.getStateRoot(yield select())
    const isOnline = Selectors.isOnline(state)
    const wentOnline = !wasOnline && isOnline
    const wentOffline = wasOnline && !isOnline
    const isAuth = !!state.auth.token
    const authed = !wasAuthed && isAuth
    const unauthed = wasAuthed && !isAuth
    const allPublicKeys = Selectors.getAllPublicKeys(state)

    const publicKeysChanged = (() => {
      // Cheap but results in false positives when any user is updated (the
      // selector recomputes based on the whole users tree changing)
      if (allPublicKeys === oldPublicKeys) {
        return false
      }

      // Expensive but accurate
      return !isEqual(
        allPublicKeys.slice().sort(),
        oldPublicKeys.slice().sort(),
      )
    })()

    let newPublicKeys: string[] = []

    if (publicKeysChanged) {
      newPublicKeys = difference(allPublicKeys, oldPublicKeys)
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
        const theSocket = sockets[publicKey]

        if (theSocket) {
          theSocket.off('*')
          theSocket.close()
          setSocket(publicKey, null)
        }
      }
    } else if (authed || wentOnline) {
      wasAuthed = isAuth
      // if authed then it's online
      wasOnline = true

      if (!isAuth) {
        return
      }

      assignSocketToPublicKeys(allPublicKeys)
    } else if (isAuth && isOnline && publicKeysChanged) {
      assignSocketToPublicKeys(newPublicKeys)
    }
  } catch (err) {
    Logger.log('Error inside posts* ()')
    Logger.log(err.message)
  }
}

const assignSocketToPublicKeys = (publicKeys: string[]) => {
  for (const publicKey of publicKeys) {
    // TODO: send existing posts to RPC so it doesn't send repeat data.
    setSocket(publicKey, rifle(`${publicKey}::posts::on`))

    sockets[publicKey]!.on('$shock', (data: unknown) => {
      try {
        if (!Schema.isObj(data)) {
          throw new TypeError(`Expected user.posts to be an object`)
        }

        const existingPosts = Object.keys(getStore().getState().posts)

        const postsReceived = Object.keys(
          // filter deleted posts
          pickBy(data, v => v !== null),
        ).filter(k => k !== '_')

        // posts can't get edited for now
        const newPosts = difference(postsReceived, existingPosts)

        for (const postKey of newPosts) {
          httpGet<{ data: Schema.RawPost }>(
            `api/gun/otheruser/${publicKey}/load/posts.${postKey}`,
            {},
            v => {
              if (!Schema.isObj(v)) {
                return 'not an object'
              }
              if (!Schema.isRawPost(v.data)) {
                return `id: ${postKey} not a raw post (sometimes expected): ${JSON.stringify(
                  v.data,
                )}`
              }
              return ''
            },
          )
            .then(({ data: { contentItems, date, status, tags, title } }) => {
              getStore().dispatch(
                Actions.receivedRawPost(
                  {
                    contentItems,
                    date,
                    status,
                    tags,
                    title,
                  },
                  postKey,
                  publicKey,
                ),
              )
            })
            .catch(e => {
              Logger.log('Error inside posts.httpGet* ()')
              Logger.log(e.message)
            })
        }
      } catch (err) {
        Logger.log('Error inside posts* ()')
        Logger.log(err.message)
      }
    })

    sockets[publicKey]!.on('$error', (err: unknown) => {
      if (err === Constants.ErrorCode.NOT_AUTH) {
        getStore().dispatch(Actions.tokenDidInvalidate())
        return
      }
      Logger.log('Error inside posts* ()')
      Logger.log(err)
    })
  }
}

function* rootSaga() {
  yield takeEvery('*', posts)
}

export default rootSaga
