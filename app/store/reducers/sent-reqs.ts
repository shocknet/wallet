import produce from 'immer'
import { Reducer } from 'redux'
import { Schema } from 'shock-common'

import { Action } from '../actions'

type SentReqsState = Record<string, Schema.SimpleSentRequest>

const reducer: Reducer<SentReqsState, Action> = (state = {}, action) =>
  produce(state, draft => {
    if (action.type === 'requests/sent') {
      const sentReqs = action.data

      sentReqs.forEach(sentReq => {
        draft[sentReq.id] = {
          id: sentReq.id,
          // we wont use
          recipientAvatar: null,
          recipientChangedRequestAddress: sentReq.changedRequestAddress,
          // we wont use
          recipientDisplayName: null,
          recipientPublicKey: sentReq.pk,
          timestamp: sentReq.timestamp,
        }
      })
    }

    if (action.type === 'chats/receivedChats') {
      const { chats } = action.data

      let willBeDeleted = []

      for (const chat of chats) {
        for (const [id, sentReq] of Object.entries(draft)) {
          if (sentReq.recipientPublicKey === chat.recipientPublicKey) {
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
