import { takeEvery, select, all } from 'redux-saga/effects'
import Logger from 'react-native-file-log'
import SocketIO from 'socket.io-client'
import { Constants, Schema } from 'shock-common'
import pickBy from 'lodash/pickBy'
import size from 'lodash/size'

import * as Actions from '../actions'
import * as Selectors from '../selectors'
import { rifle, get as httpGet } from '../../services'

import { getStore } from './common'

/**
 * Maps public key to shared posts socket.
 */
const sockets: Record<string, ReturnType<typeof SocketIO>> = {}

function* sharedPosts() {
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
    Logger.log('Error inside sharedPosts* ()')
    Logger.log(err.message)
  }
}

const assignSocketToPublicKeys = (publicKeys: string[], host: string) => {
  for (const publicKey of publicKeys) {
    if (sockets[publicKey]) {
      continue
    }

    // TODO: send existing posts to RPC so it doesn't send repeat data.
    sockets[publicKey] = rifle(host, `${publicKey}::sharedPosts::on`)

    // Will not handle NOT_AUTH event here, enough sockets probably handle that
    // already and this is a multi socket saga will probably make app eat paint.

    sockets[publicKey].on('$shock', (data: unknown) => {
      try {
        if (!Schema.isObj(data)) {
          throw new TypeError(`Expected user.sharedPosts to be an object`)
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
          store.dispatch(
            Actions.removedSeveralSharedPosts(
              postsDeleted.map(postID => publicKey + postID),
            ),
          )
        }

        for (const postKey of postsReceived) {
          httpGet<{ data: Schema.SharedPostRaw }>(
            `api/gun/otheruser/${publicKey}/load/sharedPosts>${postKey}`,
            {},
            v => {
              if (!Schema.isObj(v)) {
                return 'not an object'
              }
              if (!Schema.isSharedPostRaw(v.data)) {
                return `id: ${postKey} from author: ${getStore().getState()
                  .users[publicKey].displayName ||
                  publicKey} not a raw shared post (sometimes expected): ${JSON.stringify(
                  v.data,
                )}`
              }
              return ''
            },
          )
            .then(({ data: { originalAuthor, shareDate } }) => {
              getStore().dispatch(
                Actions.receivedSharedPost(
                  originalAuthor,
                  postKey,
                  publicKey,
                  shareDate,
                ),
              )
            })
            .catch(e => {
              Logger.log('Error inside sharedPosts.httpGet* ()')
              Logger.log(e.message)
            })
        }
      } catch (err) {
        Logger.log('Error inside sharedPosts* ()')
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
      Logger.log('Error inside sharedPosts* ()')
      Logger.log(err)
    })
  }
}

function* rootSaga() {
  yield all([takeEvery('*', sharedPosts)])
}

export default rootSaga
