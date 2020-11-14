import { takeEvery, select } from 'redux-saga/effects'
import Logger from 'react-native-file-log'
import SocketIO from 'socket.io-client'
import { Schema } from 'shock-common'

import * as Actions from '../actions'
import * as Selectors from '../selectors'
import { getStore } from './common'

let socket: ReturnType<typeof SocketIO> | null = null

function* receivedReqs() {
  try {
    const state = Selectors.getStateRoot(yield select())
    const isReady = Selectors.isReady(state)
    const {
      auth: { host },
    } = state

    if (isReady && !socket) {
      socket = SocketIO(`http://${host}/receivedReqs`, {
        query: {
          token: state.auth.token,
        },
      })

      socket.on('$shock', (receivedReqs: Schema.SimpleReceivedRequest[]) => {
        const received = receivedReqs.map(chat => ({
          id: chat.id,
          pk: chat.requestorPK,
          avatar: chat.requestorAvatar,
          displayName: chat.requestorDisplayName,
          // @ts-expect-error TODO
          response: chat.response,
          timestamp: chat.timestamp,
        }))

        /** @type {ReceivedRequestsAction} */
        const receivedRequestsAction = {
          type: Actions.RequestActions.ACTIONS.LOAD_RECEIVED_REQUESTS,
          data: received,
        }

        getStore().dispatch(receivedRequestsAction)
      })

      socket.on('$error', (e: string) => {
        Logger.log('Error inside receivedReqs* ()')
        Logger.log(e)
        socket!.off('*')
        socket!.close()
        socket = null
      })
    }

    if (!isReady && socket) {
      socket.off('*')
      socket.close()
      socket = null
    }
  } catch (e) {
    Logger.log('Error inside receivedReqs* ()')
    Logger.log(e.message)
    if (socket) {
      socket.off('*')
      socket.close()
      socket = null
    }
  }
}

function* rootSaga() {
  yield takeEvery('*', receivedReqs)
}

export default rootSaga
