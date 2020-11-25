import { eventChannel, END, EventChannel } from 'redux-saga'
import {
  takeEvery,
  select,
  fork,
  cancelled,
  call,
  take,
  cancel,
} from 'redux-saga/effects'
import Logger from 'react-native-file-log'
import * as Common from 'shock-common'
import pickBy from 'lodash/pickBy'
import size from 'lodash/size'

import * as Actions from '../actions'
import * as Selectors from '../selectors'
import { rifle, get as httpGet } from '../../services'

import { YieldReturn, put } from './common'

type RelevantAction = Actions.SharedPostsAction | Actions.AuthAction | END

const handleShockEvent = (
  emit: (a: RelevantAction) => void,
  publicKey: string,
) => (data: unknown) => {
  try {
    if (!Common.Schema.isObj(data)) {
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
      emit(
        Actions.removedSeveralSharedPosts(
          sharedPostsDeleted.map(id => publicKey + id),
        ),
      )
    }

    // TODO: change to one load()
    for (const sharedPostKey of sharedPostsReceived) {
      httpGet<{ data: Common.Schema.SharedPostRaw }>(
        `api/gun/otheruser/${publicKey}/load/sharedPosts>${sharedPostKey}`,
        {},
        v => {
          if (!Common.Schema.isObj(v)) {
            return 'not an object'
          }
          if (!Common.Schema.isSharedPostRaw(v.data)) {
            return `id: ${sharedPostKey} from author: ${publicKey} not a raw shared post (sometimes expected): ${JSON.stringify(
              v.data,
            )}`
          }
          return ''
        },
      )
        .then(({ data: { originalAuthor, shareDate } }) => {
          emit(
            Actions.receivedSharedPost(
              originalAuthor,
              sharedPostKey,
              publicKey,
              shareDate,
            ),
          )
        })
        .catch(e => {
          Logger.log('Error inside sharedPosts*.httpGet ()')
          Logger.log(e.message)
        })
    }
  } catch (err) {
    Logger.log('Error inside sharedPosts* ()')
    Logger.log(err.message)
  }
}

function createSocketChannel(
  publicKey: string,
  host: string,
): EventChannel<RelevantAction> {
  return eventChannel<RelevantAction>(emit => {
    const socket = rifle(host, `${publicKey}::sharedPosts::on`)

    socket.on('$shock', handleShockEvent(emit, publicKey))

    socket.on(Common.Constants.ErrorCode.NOT_AUTH, () => {
      emit(Actions.tokenDidInvalidate())
    })

    socket.on('$error', (err: unknown) => {
      if (err === Common.Constants.ErrorCode.NOT_AUTH) {
        emit(Actions.tokenDidInvalidate())
        return
      }
      Logger.log('Error inside sharedPosts* ()')
      Logger.log(err)
    })

    return () => {
      socket.off('*')
      socket.close()
    }
  })
}

function* handlePublicKeySocket(chan: EventChannel<RelevantAction>) {
  try {
    const action: RelevantAction = yield take(chan)

    if (action.type !== '@@redux-saga/CHANNEL_END') {
      yield put(action)
    }
  } finally {
    if (yield cancelled()) {
      chan.close()
    }
  }
}

const publicKeysWithSockets = new Set<string>()
const tasks: any[] = []

function* watchSharedPosts() {
  try {
    const state = Selectors.getStateRoot(yield select())
    const isReady = Selectors.isReady(state)
    const allPublicKeys = Selectors.getAllPublicKeys(state)
    const host = Selectors.selectHost(state)

    if (isReady) {
      const publicKeysWithoutSocket = allPublicKeys.filter(
        pk => !publicKeysWithSockets.has(pk),
      )

      for (const publicKey of publicKeysWithoutSocket) {
        console.log(
          `creating shared posts socket for pubulic key: ${publicKey}`,
        )
        const channel: YieldReturn<typeof createSocketChannel> = yield call(
          createSocketChannel,
          publicKey,
          host,
        )

        const task: YieldReturn<typeof fork> = yield fork(
          handlePublicKeySocket,
          channel,
        )

        tasks.push(task)
        publicKeysWithSockets.add(publicKey)
      }
    }

    if (!isReady) {
      while (tasks.length) {
        const task = tasks.pop()

        yield cancel(task)
      }
    }
  } catch (e) {
    Logger.log(`Error inside watchSharedPosts*()`)
    Logger.log(e)
  }
}

function* rootSaga() {
  yield takeEvery('*', watchSharedPosts)
}

export default rootSaga
