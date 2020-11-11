/**
 * TODO: Change this to a more sane structure, we do it this way to not change
 * too much content in view layer.
 */
import { Schema } from 'shock-common'
import { createSelector } from 'reselect'

import { State } from '../reducers'

const selectAllNormalizedChats = (state: State) => state.chats.byId
const selectAllNormalizedMessages = (state: State) => state.messages.byId

export const selectAllChats = createSelector<
  State,
  string, // Props to selectors
  ReturnType<typeof selectAllNormalizedChats>,
  ReturnType<typeof selectAllNormalizedMessages>,
  Schema.Chat[] // Return type
>(
  selectAllNormalizedChats,
  selectAllNormalizedMessages,
  (normalizedChats, normalizedMessages) =>
    Schema.denormalizeChats(Object.keys(normalizedChats), {
      chats: normalizedChats,
      messages: normalizedMessages,
    }),
)
