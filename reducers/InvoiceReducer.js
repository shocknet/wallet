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
 * @prop {boolean=} liquidityCheck
 * @prop {string=} decodeError
 */

// TO DO: typings for data
/**
 * @typedef {object} DecodedPaymentRequest
 * @prop {string} num_satoshis
 * @prop {string} destination
 * @prop {string} payment_request
 * @prop {string} description
 */
/**
 * @typedef {object} Action
 * @prop {string} type
 * @prop {(string|boolean|DecodedPaymentRequest)=} data
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
 */
const invoice = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ACTIONS.SET_AMOUNT: {
      const { data } = action
      if (typeof data !== 'string') {
        return state
      }
      return {
        ...state,
        amount: data,
      }
    }
    case ACTIONS.SET_DESCRIPTION: {
      const { data } = action
      if (typeof data !== 'string') {
        return state
      }
      return {
        ...state,
        description: data,
      }
    }
    case ACTIONS.SET_INVOICE_MODE: {
      const { data } = action
      if (typeof data !== 'boolean') {
        return state
      }
      return {
        ...state,
        invoiceMode: data,
      }
    }
    case ACTIONS.SET_RECIPIENT_ADDRESS: {
      const { data } = action
      if (typeof data !== 'string') {
        return state
      }
      return {
        ...state,
        recipientAddress: data,
      }
    }
    case ACTIONS.SET_UNIT_SELECTED: {
      const { data } = action
      if (typeof data !== 'string') {
        return state
      }
      return {
        ...state,
        unitSelected: data,
      }
    }
    case ACTIONS.ADD_INVOICE: {
      const { data } = action
      if (typeof data !== 'string') {
        return state
      }
      return {
        ...state,
        paymentRequest: data,
      }
    }
    case ACTIONS.SET_LIQUIDITY_CHECK:{
      const {data} = action
      return {
        ...state,
        liquidityCheck:data
      }
    }
    case ACTIONS.SET_ADDRESS: {
      const { data } = action
      if (typeof data !== 'string') {
        return state
      }
      return {
        ...state,
        btcAddress: data,
      }
    }
    case ACTIONS.DECODE_PAYMENT_REQUEST: {
      const { data } = action
      if(!data){
        return state
      }
      if(typeof data === 'string'){
        return state
      }
      if(typeof data === 'boolean'){
        return state
      }

      return {
        ...state,
        amount: data.num_satoshis,
        recipientAddress: data.destination,
        paymentRequest: data.payment_request,
        description: data.description,
      }
    }
    case ACTIONS.INVOICE_DECODE_ERROR:{
      const {data} = action
      return {
        ...state,
        decodeError:data
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
