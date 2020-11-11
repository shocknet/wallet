import produce from 'immer'
import { Reducer } from 'redux'
import { Schema } from 'shock-common'

import { Action } from '../actions'

type ReceivedReqsState = Record<string, Schema.SimpleReceivedRequest>

const reducer: Reducer<ReceivedReqsState, Action> = (state = {}, action) =>
  produce(state, draft => {
    if (action.type === 'requests/received') {
      const receivedReqs = action.data

      receivedReqs.forEach(receivedReq => {
        draft[receivedReq.id] = {
          id: receivedReq.id,
          // we won't use
          requestorAvatar: null,
          // we won't use
          requestorDisplayName: null,
          requestorPK: receivedReq.pk,
          timestamp: receivedReq.timestamp,
        }
      })
    }

    if (action.type === 'chats/receivedChats') {
      const { chats } = action.data

      let willBeDeleted = []

      for (const chat of chats) {
        for (const [id, receivedReq] of Object.entries(draft)) {
          if (receivedReq.requestorPK === chat.recipientPublicKey) {
            willBeDeleted.push(id)
          }
        }
      }

      for (const id of willBeDeleted) {
        delete draft[id]
      }
    }
  })

export default reducer
