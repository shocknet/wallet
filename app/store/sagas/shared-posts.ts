import { takeEvery, select } from 'redux-saga/effects'
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
 * Maps public key to sharedPosts socket.
 */
const sockets: Record<string, ReturnType<typeof SocketIO>> = {}

function* sharedPosts() {
  try {
    const state = Selectors.getStateRoot(yield select())
    const isReady = Selectors.isReady(state)
    const allPublicKeys = Selectors.getAllPublicKeys(state)
    const host = Selectors.selectHost(state)

    if (isReady) {
      assignSocketsToPublicKeysIfNeeded(allPublicKeys, host)
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

const assignSocketsToPublicKeysIfNeeded = (
  publicKeys: string[],
  host: string,
) => {
  for (const publicKey of publicKeys) {
    if (sockets[publicKey]) {
      continue
    }

    // TODO: send existing shared posts to RPC so it doesn't send repeat data.
    sockets[publicKey] = rifle(host, `${publicKey}::sharedPosts::on`)

    // Will not handle NOT_AUTH event here, enough sockets probably handle that
    // already and this is a multi socket saga will probably make app eat paint.

    sockets[publicKey].on('$shock', (data: unknown) => {
      try {
        if (!Schema.isObj(data)) {
          throw new TypeError(`Expected user.sharedPosts to be an object`)
        }

        const sharedPostsReceived = Object.keys(
          // filter deleted sharedPosts
          pickBy(data, v => v !== null),
        ).filter(k => k !== '_')

        const sharedPostsDeleted = Object.keys(
          // get deleted sharedPosts
          pickBy(data, v => v == null),
        ).filter(k => k !== '_')

        if (size(sharedPostsDeleted)) {
          const store = getStore()
          store.dispatch(Actions.sharedPostsRemovedSeveral(sharedPostsDeleted))
        }

        for (const sharedPostKey of sharedPostsReceived) {
          httpGet<{ data: Schema.SharedPostRaw }>(
            `api/gun/otheruser/${publicKey}/load/sharedPosts>${sharedPostKey}`,
            {},
            v => {
              if (!Schema.isObj(v)) {
                return 'not an object'
              }
              if (!Schema.isSharedPostRaw(v.data)) {
                return `id: ${sharedPostKey} from author: ${
                  getStore().getState().users[publicKey].displayName
                } not a raw shared post (sometimes expected): ${JSON.stringify(
                  v.data,
                )}`
              }
              return ''
            },
          )
            .then(
              ({
                data: {
                  originalAuthor,
                  originalDate,
                  originalPostID,
                  shareDate,
                },
              }) => {
                getStore().dispatch(
                  Actions.receivedRawSharedPost(
                    originalAuthor,
                    originalDate,
                    originalPostID,
                    publicKey,
                    sharedPostKey,
                    shareDate,
                  ),
                )
              },
            )
            .catch(e => {
              Logger.log('Error inside sharedPosts*.httpGet ()')
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
  yield takeEvery('*', sharedPosts)
}

export default rootSaga
