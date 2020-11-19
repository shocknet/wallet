import { takeEvery, select } from 'redux-saga/effects'
import Logger from 'react-native-file-log'
import { io as SocketIO } from 'socket.io-client'
import { Schema } from 'shock-common'

import * as Actions from '../actions'
import * as Selectors from '../selectors'

import { getStore } from './common'

let socket: ReturnType<typeof SocketIO> | null = null

function* sentReqs() {
  try {
    const state = Selectors.getStateRoot(yield select())
    const isReady = Selectors.isReady(state)
    const {
      auth: { host },
    } = state

    if (isReady && !socket) {
      socket = SocketIO(`http://${host}/sentReqs`, {
        auth: {
          token: state.auth.token,
        },
      })

      socket.on('$shock', (sentReqs: Schema.SimpleSentRequest[]) => {
        const sent = sentReqs.map(sentReq => ({
          id: sentReq.id,
          pk: sentReq.recipientPublicKey,
          avatar: sentReq.recipientAvatar,
          displayName: sentReq.recipientDisplayName,
          changedRequestAddress: sentReq.recipientChangedRequestAddress,
          timestamp: sentReq.timestamp,
        }))

        /** @type {Actions.RequestActions.SentRequestsAction} */
        const sentRequestsAction = {
          type: Actions.RequestActions.ACTIONS.LOAD_SENT_REQUESTS,
          data: sent,
        }

        getStore().dispatch(sentRequestsAction)
      })

      socket.on('$error', (e: string) => {
        Logger.log('Error inside sentReqs* ()')
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
    Logger.log('Error inside sentReqs* ()')
    Logger.log(e.message)
    if (socket) {
      socket.off('*')
      socket.close()
      socket = null
    }
  }
}

function* rootSaga() {
  yield takeEvery('*', sentReqs)
}

export default rootSaga
