import { Reducer } from 'redux'
import { Schema } from 'shock-common'

import { Action } from '../actions'

type ReceivedReqsState = Record<string, Schema.SimpleReceivedRequest>

const reducer: Reducer<ReceivedReqsState, Action> = (state = {}, action) => {
  if (action.type === 'requests/received') {
    const receivedReqs = action.data
    const newState: ReceivedReqsState = {}

    receivedReqs.forEach(receivedReq => {
      newState[receivedReq.id] = {
        id: receivedReq.id,
        // we won't use
        requestorAvatar: null,
        // we won't use
        requestorDisplayName: null,
        requestorPK: receivedReq.pk,
        timestamp: receivedReq.timestamp,
      }
    })

    return newState
  }

  if (action.type === 'chats/receivedChats') {
    const { chats } = action.data

    const willBeDeleted = []

    const pubKeysWithChats = chats.map(c => c.recipientPublicKey)

    for (const receivedReq of Object.values(state)) {
      if (pubKeysWithChats.includes(receivedReq.id)) {
        willBeDeleted.push(receivedReq.id)
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
