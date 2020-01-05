import * as Wallet from '../services/wallet'

export const ACTIONS = {
  SET_AMOUNT: 'invoice/amount',
  SET_DESCRIPTION: 'invoice/description',
  SET_INVOICE_MODE: 'invoice/mode',
  SET_RECIPIENT_ADDRESS: 'invoice/recipientAddress',
  SET_UNIT_SELECTED: 'invoice/unit',
  SET_ADDRESS: 'invoice/address',

  ADD_INVOICE: 'invoice/add',
  RESET_INVOICE: 'invoice/reset',
}

/**
 * @typedef {object} WalletBalance
 * @prop {string} confirmedBalance
 * @prop {string} pendingChannelBalance
 * @prop {string} channelBalance
 */

/**
 * Set Invoice Amount
 * @param {number} amount
 * @returns {import('redux-thunk').ThunkAction<void, {}, {}, import('redux').AnyAction>}
 */
export const setAmount = amount => dispatch => {
  dispatch({
    type: ACTIONS.SET_AMOUNT,
    data: amount,
  })
}

/**
 * Set Invoice Amount
 * @param {string} description
 * @returns {import('redux-thunk').ThunkAction<void, {}, {}, import('redux').AnyAction>}
 */
export const setDescription = description => dispatch => {
  dispatch({
    type: ACTIONS.SET_DESCRIPTION,
    data: description,
  })
}

/**
 * Set Invoice Mode
 * @param {boolean} invoiceMode
 * @returns {import('redux-thunk').ThunkAction<void, {}, {}, import('redux').AnyAction>}
 */
export const setInvoiceMode = invoiceMode => dispatch => {
  dispatch({
    type: ACTIONS.SET_INVOICE_MODE,
    data: invoiceMode,
  })
}

/**
 * Set Recipient Address
 * @param {string} recipientAddress
 * @returns {import('redux-thunk').ThunkAction<void, {}, {}, import('redux').AnyAction>}
 */
export const setRecipientAddress = recipientAddress => dispatch => {
  dispatch({
    type: ACTIONS.SET_RECIPIENT_ADDRESS,
    data: recipientAddress,
  })
}

/**
 * Set Unit Selected
 * @param {'BTC' | 'Sats' | 'Bits'} unit
 * @returns {import('redux-thunk').ThunkAction<void, {}, {}, import('redux').AnyAction>}
 */
export const setUnitSelected = unit => dispatch => {
  dispatch({
    type: ACTIONS.SET_UNIT_SELECTED,
    data: unit,
  })
}

/**
 * Reset Invoice
 * @returns {import('redux-thunk').ThunkAction<void, {}, {}, import('redux').AnyAction>}
 */
export const resetInvoice = () => dispatch => {
  dispatch({
    type: ACTIONS.RESET_INVOICE,
  })
}

/**
 * Create a new invoice
 * @param {import('../services/wallet').AddInvoiceRequest} invoice
 * @returns {import('redux-thunk').ThunkAction<void, {}, {}, import('redux').AnyAction>}
 */
export const addInvoice = invoice => async dispatch => {
  const newInvoice = await Wallet.addInvoice(invoice)
  dispatch({
    type: ACTIONS.ADD_INVOICE,
    data: newInvoice.payment_request,
  })
}

/**
 * Create a new invoice
 * @returns {import('redux-thunk').ThunkAction<void, {}, {}, import('redux').AnyAction>}
 */
export const newAddress = () => async dispatch => {
  const address = await Wallet.newAddress()
  dispatch({
    type: ACTIONS.SET_ADDRESS,
    data: address,
  })
}
