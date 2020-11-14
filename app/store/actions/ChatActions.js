import * as Common from 'shock-common'
import Logger from 'react-native-file-log'

export const ACTIONS = {
  LOAD_CONTACTS: 'contacts/load',
  LOAD_MESSAGES: 'messages/load',
  SELECT_CONTACT: 'contact/select',
  RESET_SELECTED_CONTACT: 'contact/reset',
  RESET_CHAT: 'chat/reset',
}

/**
 * @typedef {object} Contact
 * @prop {string} pk
 * @prop {string} avatar
 * @prop {string} displayName
 * @prop {'contact'} type
 */

/**
 * @typedef {object} BTCAddress
 * @prop {string} address
 * @prop {'btc'} type
 */

/**
 * @typedef {object} Invoice
 * @prop {string} paymentRequest
 * @prop {'invoice'} type
 */

/**
 * @typedef {object} Keysend
 * @prop {string} dest
 * @prop {'keysend'} type
 */

/**
 * @typedef {(Contact | BTCAddress | Invoice | Keysend)} SelectedContact
 */

/**
 * @typedef {object} ReceivedChatsAction
 * @prop {'chats/receivedChats'} type
 * @prop {{ chats: Common.Schema.Chat[] }} data
 */

/**
 * @typedef {object} LoadMessagesAction
 * @prop {'messages/load'} type
 * @prop {Record<string, Common.Schema.ChatMessage>} data
 */

/**
 * Selects a contact (useful for easily referencing the currently focused contact)
 * @param {Contact|BTCAddress|Keysend} contact
 * @returns {import('redux-thunk').ThunkAction<Contact|BTCAddress|Keysend, {}, {}, import('redux').AnyAction>}
 */
export const selectContact = contact => dispatch => {
  dispatch({
    type: ACTIONS.SELECT_CONTACT,
    data: contact,
  })

  return contact
}

/**
 * Reset currently selected contact
 * @returns {import('redux-thunk').ThunkAction<void, {}, {}, import('redux').AnyAction>}
 */
export const resetSelectedContact = () => dispatch => {
  Logger.log('Resetting selected contact')
  dispatch({
    type: ACTIONS.RESET_SELECTED_CONTACT,
    data: null,
  })
}
