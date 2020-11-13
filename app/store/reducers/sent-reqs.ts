import { Reducer } from 'redux'
import { Schema } from 'shock-common'

import { Action } from '../actions'

type SentReqsState = Record<string, Schema.SimpleSentRequest>

const reducer: Reducer<SentReqsState, Action> = (state = {}, action) => {
  if (action.type === 'requests/sent') {
    const sentReqs = action.data
    const newState: SentReqsState = {}

    sentReqs.forEach(sentReq => {
      newState[sentReq.id] = {
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

    return newState
  }

  if (action.type === 'chats/receivedChats') {
    const { chats } = action.data

    let willBeDeleted = []

    for (const chat of chats) {
      for (const [id, sentReq] of Object.entries(state)) {
        if (sentReq.recipientPublicKey === chat.recipientPublicKey) {
          willBeDeleted.push(id)
        }
      }
    }

    if (willBeDeleted.length) {
      const newState = { ...state }
      for (const id of willBeDeleted) {
        delete newState[id]
      }
      return newState
    }
  }

  return state
}

export default reducer
