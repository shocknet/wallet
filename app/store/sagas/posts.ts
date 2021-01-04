import { takeEvery, select, all, put, call } from 'redux-saga/effects'
import Logger from 'react-native-file-log'
import SocketIO from 'socket.io-client'
import { Constants, Schema } from 'shock-common'
import pickBy from 'lodash/pickBy'
import size from 'lodash/size'

import * as Actions from '../actions'
import * as Selectors from '../selectors'
import { rifle, get as httpGet, post as httpPost } from '../../services'

import { getStore } from './common'

/**
 * Maps public key to posts socket.
 */
const sockets: Record<string, ReturnType<typeof SocketIO>> = {}

function* posts() {
  try {
    const state = Selectors.getStateRoot(yield select())
    const isReady = Selectors.isReady(state)
    const allPublicKeys = Selectors.getAllPublicKeys(state)
    const host = Selectors.selectHost(state)

    if (isReady) {
      assignSocketToPublicKeys(allPublicKeys, host)
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

const assignSocketToPublicKeys = (publicKeys: string[], host: string) => {
  for (const publicKey of publicKeys) {
    if (sockets[publicKey]) {
      continue
    }

    // TODO: send existing posts to RPC so it doesn't send repeat data.
    sockets[publicKey] = rifle(host, `${publicKey}::posts::on`)

    // Will not handle NOT_AUTH event here, enough sockets probably handle that
    // already and this is a multi socket saga will probably make app eat paint.

    sockets[publicKey].on('$shock', (data: unknown) => {
      try {
        if (!Schema.isObj(data)) {
          throw new TypeError(`Expected user.posts to be an object`)
        }

        const postsReceived = Object.keys(
          // filter deleted posts
          pickBy(data, v => v !== null),
        ).filter(k => k !== '_')

        const postsDeleted = Object.keys(
          // get deleted posts
          pickBy(data, v => v == null),
        ).filter(k => k !== '_')

        if (size(postsDeleted)) {
          const store = getStore()

          store.dispatch(Actions.postsRemovedSeveral(postsDeleted))
        }

        for (const postKey of postsReceived) {
          httpGet<{ data: Schema.RawPost }>(
            `api/gun/otheruser/${publicKey}/load/posts>${postKey}`,
            {},
            v => {
              if (!Schema.isObj(v)) {
                return 'not an object'
              }
              if (!Schema.isRawPost(v.data)) {
                return `id: ${postKey} from author: ${
                  getStore().getState().users[publicKey].displayName
                } not a raw post (sometimes expected): ${JSON.stringify(
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
    yield call(httpPost, `api/gun/put`, {
      path: `$user>posts>${postID}`,
      value: null,
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
  try {
    yield call(httpPost, `api/gun/put`, {
      path: `$user>Profile>pinnedPost`,
      value: postID,
    })

    yield put(Actions.pinnedPost(postID))
  } catch (e) {
    Logger.log('Error inside postPin* ()')
    Logger.log(e.message)
  }
}

function* postUnpin() {
  try {
    yield call(httpPost, `api/gun/put`, {
      path: `$user>Profile>pinnedPost`,
      value: null,
    })

    yield put(Actions.unpinnedPost())
  } catch (e) {
    Logger.log('Error inside postUnpin* ()')
    Logger.log(e.message)
  }
}

function* rootSaga() {
  yield all([
    takeEvery('*', posts),
    takeEvery(Actions.requestedPostRemoval, postRemoval),
    takeEvery(Actions.requestedPostPin, postPin),
    takeEvery(Actions.requestedPostUnpin, postUnpin),
  ])
}

export default rootSaga
