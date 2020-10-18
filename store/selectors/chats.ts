import { Schema } from 'shock-common'
import { createSelector } from 'reselect'

import { State } from '../../reducers'

const getMessages = (state: State) => state.chat.messages
const getPublicKey = (_: State, props: Schema.HasPublicKey) => props.publicKey

export const makeGetMessages = () =>
  createSelector<
    State,
    Schema.HasPublicKey,
    State['chat']['messages'],
    string,
    Schema.ChatMessage[]
  >(
    getMessages,
    getPublicKey,
    (messages, publicKey) => {
      const msgs = (messages as Record<string, Schema.ChatMessage[]>)[publicKey]

      return msgs
    },
  )

const getSearchTerm = (_: State, searchTerm: string) => searchTerm

export const makeSearchMessages = () =>
  createSelector(
    getMessages,
    getSearchTerm,
    (messages, searchTerm) => {
      const filtered: Record<string, Schema.ChatMessage[]> = {}

      Object.entries(messages as Record<string, Schema.ChatMessage[]>).forEach(
        ([pk, chatMessages]) => {
          filtered[pk] = chatMessages.filter(m => m.body.includes(searchTerm))
        },
      )

      return filtered
    },
  )

/**
 * Used for relating a TX to an user, until coordinates.
 */
export const makeSearchPublicKeyWithMsgBody = () =>
  createSelector(
    makeSearchMessages(),
    getSearchTerm,
    (messages, searchTerm) => {
      for (const [pk, chatMessages] of Object.entries(messages as Record<
        string,
        Schema.ChatMessage[]
      >)) {
        if (chatMessages.some(msg => msg.body.includes(searchTerm))) {
          return pk
        }
      }

      return null
    },
  )
