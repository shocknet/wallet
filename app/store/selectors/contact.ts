/**
 * TODO: Change this to a more sane structure, we do it this way to not change
 * too much content in view layer.
 */
import { Schema } from 'shock-common'
import { createSelector } from 'reselect'

import { State } from '../reducers'

const selectAllNormalizedChats = (state: State) => state.chats.byId

const selectAllNormalizedMessages = (state: State) => state.messages.byId

const _selectAllSentReqs = (state: State) => state.sentReqs

const _selectAllReceivedReqs = (state: State) => state.receivedReqs

export const selectAllChats = createSelector<
  State,
  ReturnType<typeof selectAllNormalizedChats>,
  ReturnType<typeof selectAllNormalizedMessages>,
  Schema.Chat[] // Return type
>(
  selectAllNormalizedChats,
  selectAllNormalizedMessages,
  (normalizedChats, normalizedMessages) =>
    Schema.denormalizeChats(Object.keys(normalizedChats), {
      chats: normalizedChats,
      chatMessages: normalizedMessages,
    }),
)

export const selectAllSentReqs = createSelector(
  _selectAllSentReqs,
  selectAllChats,
  (reqs, chats) => {
    const reqsArr = Object.values(reqs)

    // if a chat is present, remove the request
    return reqsArr.filter(
      req => !chats.some(c => req.recipientPublicKey === c.recipientPublicKey),
    )
  },
)

export const selectAllReceivedReqs = createSelector(
  _selectAllReceivedReqs,
  selectAllChats,
  (reqs, chats) => {
    const reqsArr = Object.values(reqs)

    // if a chat is present, remove the request
    return reqsArr.filter(
      req => !chats.some(c => req.requestorPK === c.recipientPublicKey),
    )
  },
)
