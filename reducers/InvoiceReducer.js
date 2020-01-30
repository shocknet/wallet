import { ACTIONS } from '../app/actions/InvoiceActions'

/**
 * @typedef {object} State
 * @prop {string} amount
 * @prop {string} description
 * @prop {boolean} invoiceMode
 * @prop {string} recipientAddress
 * @prop {string} paymentRequest
 * @prop {string} btcAddress
 * @prop {string} unitSelected
 */

// TO DO: typings for data
/**
 * @typedef {object} Action
 * @prop {string} type
 * @prop {(object|any[])=} data
 */

/** @type {State} */
const INITIAL_STATE = {
  amount: '',
  description: '',
  invoiceMode: true,
  paymentRequest: '',
  recipientAddress: '',
  btcAddress: '',
  unitSelected: 'Sats',
}

/**
 * @param {State} state
 * @param {Action} action
 * @returns {State}
 */
const invoice = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ACTIONS.SET_AMOUNT: {
      const { data } = action
      return {
        ...state,
        amount: data,
      }
    }
    case ACTIONS.SET_DESCRIPTION: {
      const { data } = action
      return {
        ...state,
        description: data,
      }
    }
    case ACTIONS.SET_INVOICE_MODE: {
      const { data } = action
      return {
        ...state,
        invoiceMode: data,
      }
    }
    case ACTIONS.SET_RECIPIENT_ADDRESS: {
      const { data } = action
      return {
        ...state,
        recipientAddress: data,
      }
    }
    case ACTIONS.SET_UNIT_SELECTED: {
      const { data } = action
      return {
        ...state,
        unitSelected: data,
      }
    }
    case ACTIONS.ADD_INVOICE: {
      const { data } = action
      return {
        ...state,
        paymentRequest: data,
      }
    }
    case ACTIONS.SET_ADDRESS: {
      const { data } = action
      return {
        ...state,
        btcAddress: data,
      }
    }
    case ACTIONS.DECODE_PAYMENT_REQUEST: {
      const { data } = action
      return {
        ...state,
        amount: data.num_satoshis,
        recipientAddress: data.destination,
        paymentRequest: data.payment_request,
        description: data.description,
      }
    }
    case ACTIONS.RESET_INVOICE: {
      return INITIAL_STATE
    }
    default:
      return state
  }
}

export default invoice
