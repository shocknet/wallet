import { Schema } from 'shock-common'

import * as Wallet from '../../services/wallet'

export const ACTIONS = {
  SET_AMOUNT: 'invoice/amount',
  SET_DESCRIPTION: 'invoice/description',
  SET_INVOICE_MODE: 'invoice/mode',
  SET_RECIPIENT_ADDRESS: 'invoice/recipientAddress',
  SET_UNIT_SELECTED: 'invoice/unit',
  SET_ADDRESS: 'invoice/address',
  DECODE_PAYMENT_REQUEST: /** @type {'invoice/load'} */ ('invoice/load'),
  SET_LIQUIDITY_CHECK: 'invoice/liquidityCheck',
  INVOICE_DECODE_ERROR: 'invoice/error',
  ADD_INVOICE: /** @type {'invoice/add'} */ ('invoice/add'),
  RESET_INVOICE: 'invoice/reset',
}

/**
 * @typedef {({ type: 'error', error: Error }|undefined)} DecodeResponse
 */
/**
 * @typedef {'BTC' | 'sats' | 'Bits'} SelectedUnit
 */

/**
 * @typedef {object} WalletBalance
 * @prop {string} confirmedBalance
 * @prop {string} pendingChannelBalance
 * @prop {string} channelBalance
 */

/**
 * Set Invoice Amount
 * @param {string} amount
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
 * @typedef {object} InvoiceDecodedAction
 * @prop {typeof ACTIONS.DECODE_PAYMENT_REQUEST} type
 * @prop {Schema.InvoiceWhenDecoded & { payment_request: string }} data
 */

/**
 * Decode payment request
 * @param {string} paymentRequest
 * @returns {import('redux-thunk').ThunkAction<Promise<DecodeResponse>, {}, {}, import('redux').AnyAction>}
 */
export const decodePaymentRequest = paymentRequest => async dispatch => {
  try {
    const decodedInvoice = await Wallet.decodeInvoice({
      payReq: paymentRequest,
    })
    dispatch({
      type: ACTIONS.DECODE_PAYMENT_REQUEST,
      data: {
        ...decodedInvoice.decodedRequest,
        payment_request: paymentRequest,
      },
    })
    return
  } catch (err) {
    dispatch({
      type: ACTIONS.INVOICE_DECODE_ERROR,
      data: 'invalid invoice',
    })
    return {
      type: 'error',
      error: err,
    }
  }
}

/**
 * Set Invoice Mode
 * @param {boolean} invoiceMode
 * @returns {(dispatch:any)=>void}
 */
export const setInvoiceMode = invoiceMode => dispatch => {
  dispatch({
    type: ACTIONS.SET_INVOICE_MODE,
    data: invoiceMode,
  })
}

/**
 * Set Unit Selected
 * @param {SelectedUnit} unit
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
 * @typedef {object} AddInvoiceAction
 * @prop {typeof ACTIONS.ADD_INVOICE} type
 * @prop {string} data
 * @prop {Schema.InvoiceWhenAdded} invoice
 */

/**
 * Create a new invoice
 * @param {import('../../services/wallet').AddInvoiceRequest} invoice
 * @returns {import('redux-thunk').ThunkAction<void, {}, {}, import('redux').AnyAction>}
 */
export const addInvoice = invoice => async dispatch => {
  const newInvoice = await Wallet.addInvoice(invoice)
  /** @type {AddInvoiceAction} */
  const addInvoiceAction = {
    type: ACTIONS.ADD_INVOICE,
    data: newInvoice.payment_request,
    invoice: newInvoice,
  }
  dispatch(addInvoiceAction)
  if (newInvoice.liquidityCheck !== undefined) {
    dispatch({
      type: ACTIONS.SET_LIQUIDITY_CHECK,
      data: newInvoice.liquidityCheck,
    })
  }
}

/**
 * Create a new address and set it
 * @returns {import('redux-thunk').ThunkAction<void, {}, {}, import('redux').AnyAction>}
 */
export const newAddress = () => async dispatch => {
  const address = await Wallet.newAddress()
  dispatch({
    type: ACTIONS.SET_ADDRESS,
    data: address,
  })
}
