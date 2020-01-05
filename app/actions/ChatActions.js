import * as API from '../services/contact-api'

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
 * @prop {string} type
 */

/**
 * @typedef {object} BTCAddress
 * @prop {string} address
 * @prop {string} type
 */

/**
 * @typedef {(Contact | BTCAddress) & object} SelectedContact
 * @prop {string} type
 */

/**
 * Fetches the Node's info
 * @param {((chats: API.Schema.Chat[]) => void)=} callback
 * @returns {import('redux-thunk').ThunkAction<Promise<API.Schema.Chat[]>, {}, {}, import('redux').AnyAction>}
 */
export const subscribeOnChats = callback => dispatch =>
  new Promise((resolve, reject) => {
    API.Events.onChats(chats => {
      try {
        const contacts = chats.map(chat => ({
          pk: chat.recipientPublicKey,
          avatar: chat.recipientAvatar,
          displayName: chat.recipientDisplayName,
        }))

        const messages = chats.reduce(
          (messages, chat) => ({
            ...messages,
            [chat.recipientPublicKey]: chat.messages,
          }),
          {},
        )

        dispatch({
          type: ACTIONS.LOAD_CONTACTS,
          data: contacts,
        })

        dispatch({
          type: ACTIONS.LOAD_MESSAGES,
          data: messages,
        })

        if (callback) {
          callback(chats)
        }

        resolve(chats)
      } catch (err) {
        reject(err)
      }
    })
  })

/**
 * Selects a contact (useful for easily referencing the currently focused contact)
 * @param {Contact|BTCAddress} contact
 * @returns {import('redux-thunk').ThunkAction<Contact|BTCAddress, {}, {}, import('redux').AnyAction>}
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
  console.log('Resetting selected contact')
  dispatch({
    type: ACTIONS.RESET_SELECTED_CONTACT,
    data: null,
  })
}
