import { takeEvery, select, all, put } from 'redux-saga/effects'
import Logger from 'react-native-file-log'
import SocketIO from 'socket.io-client'
import difference from 'lodash/difference'
import { Constants, Schema } from 'shock-common'
import pickBy from 'lodash/pickBy'

import * as Actions from '../actions'
import * as Selectors from '../selectors'
import { rifle, get as httpGet, post as httpPost } from '../../services'
import { getStore } from '../store'

/**
 * Maps public key to posts socket.
 */
const sockets: Record<string, ReturnType<typeof SocketIO>> = {}

function* posts() {
  try {
    const state = Selectors.getStateRoot(yield select())
    const isReady = Selectors.isOnline(state) && Selectors.isAuth(state)
    const allPublicKeys = Selectors.getAllPublicKeys(state)

    if (isReady) {
      assignSocketToPublicKeys(allPublicKeys)
    }

    if (!isReady) {
      for (const [publicKey, socket] of Object.entries(sockets)) {
        socket.off('*')
        socket.close()
        delete sockets[publicKey]
      }
    }
  } catch (err) {
    Logger.log('Error inside posts* ()')
    Logger.log(err.message)
  }
}

const assignSocketToPublicKeys = (publicKeys: string[]) => {
  for (const publicKey of publicKeys) {
    if (sockets[publicKey]) {
      continue
    }
    // TODO: send existing posts to RPC so it doesn't send repeat data.
    sockets[publicKey] = rifle(`${publicKey}::posts::on`)

    sockets[publicKey].on('$shock', (data: unknown) => {
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

        const postsDeleted = Object.keys(
          // get deleted posts
          pickBy(data, v => v == null),
        ).filter(k => k !== '_')

        for (const postKey of postsDeleted) {
          const store = getStore()
          const { posts } = store.getState()
          if (!!posts[postKey]) {
            store.dispatch(Actions.postRemoved(postKey))
          }
        }

        for (const postKey of newPosts) {
          httpGet<{ data: Schema.RawPost }>(
            `api/gun/otheruser/${publicKey}/load/posts>${postKey}`,
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

    sockets[publicKey].on(Constants.ErrorCode.NOT_AUTH, () => {
      getStore().dispatch(Actions.tokenDidInvalidate())
    })

    sockets[publicKey].on('$error', (err: unknown) => {
      if (err === Constants.ErrorCode.NOT_AUTH) {
        getStore().dispatch(Actions.tokenDidInvalidate())
        return
      }
      Logger.log('Error inside posts* ()')
      Logger.log(err)
    })
  }
}

function* postRemoval({
  payload: { postID },
}: ReturnType<typeof Actions.requestedPostRemoval>) {
  try {
    httpPost(`api/gun/put`, {
      path: `$user>posts>${postID}`,
      value: null,
    }).catch(e => {
      Logger.log('Error inside postRemoval* ()')
      Logger.log(e.message)
    })

    yield put(Actions.postRemoved(postID))
  } catch (err) {
    Logger.log('Error inside postRemoval* ()')
    Logger.log(err)
  }
}

function* postPin({
  payload: { postID },
}: ReturnType<typeof Actions.requestedPostPin>) {
  httpPost(`api/gun/put`, {
    path: `$user>Profile>pinnedPost`,
    value: postID,
  }).catch(e => {
    Logger.log('Error inside postPin* ()')
    Logger.log(e.message)
  })

  yield put(Actions.pinnedPost(postID))
}

function* rootSaga() {
  yield all([
    takeEvery('*', posts),
    takeEvery(Actions.requestedPostRemoval, postRemoval),
    takeEvery(Actions.requestedPostPin, postPin),
  ])
}

export default rootSaga
