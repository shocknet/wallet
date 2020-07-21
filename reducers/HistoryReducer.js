// @ts-nocheck
import reverse from 'lodash/reverse'
import { ACTIONS } from '../app/actions/HistoryActions'
import * as Wallet from '../app/services/wallet'

/**
 * @typedef {Wallet.Invoice | Wallet.Payment | Wallet.Transaction} UnifiedTransaction
 */

/**
 * @typedef {object} State
 * @prop {Wallet.Channel[]} channels
 * @prop {object} invoices
 * @prop {Wallet.Peer[]} peers
 * @prop {object} transactions
 * @prop {object} payments
 * @prop {Wallet.Transaction[]} recentTransactions
 * @prop {Wallet.Payment[]} recentPayments
 * @prop {Wallet.Invoice[]} recentInvoices
 * @prop {UnifiedTransaction[]} unifiedTransactions
 */
// TO DO: typings for data
/**
 * @typedef {object} Action
 * @prop {string} type
 * @prop {({}|any[]|number)=} data
 */

/** @type {State} */
const INITIAL_STATE = {
  channels: [],
  invoices: {
    content: [],
    page: 0,
    totalPages: 0,
    totalItems: 0,
  },
  peers: [],
  transactions: {
    content: [],
    page: 0,
    totalPages: 0,
    totalItems: 0,
  },
  payments: {
    content: [],
    page: 0,
    totalPages: 0,
    totalItems: 0,
  },
  recentTransactions: [],
  recentPayments: [],
  recentInvoices: [],
  unifiedTransactions: [],
}
/**
 * @param {State} state
 * @param {Action} action
 * @returns {State}
 */
const history = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ACTIONS.LOAD_CHANNELS: {
      const { data } = action
      return {
        ...state,

        channels: data,
      }
    }
    case ACTIONS.LOAD_INVOICES: {
      const { data } = action
      return {
        ...state,
        // @ts-ignore TODO
        invoices: data,
      }
    }
    case ACTIONS.LOAD_MORE_INVOICES: {
      const { data } = action
      const { invoices } = state
      return {
        ...state,
        invoices: {
          // @ts-ignore TODO
          ...data,
          content: [...invoices.content, ...data.content],
        },
      }
    }
    case ACTIONS.LOAD_PEERS: {
      const { data } = action
      return {
        ...state,
        // @ts-ignore TODO
        peers: data,
      }
    }
    case ACTIONS.LOAD_PAYMENTS: {
      const { data } = action
      return {
        ...state,
        // @ts-ignore TODO
        payments: data,
      }
    }
    case ACTIONS.LOAD_MORE_PAYMENTS: {
      const { data } = action
      const { payments } = state
      return {
        ...state,
        payments: {
          // @ts-ignore TODO
          ...data,
          content: [...payments.content, ...data.content],
        },
      }
    }
    case ACTIONS.LOAD_TRANSACTIONS: {
      const { data } = action
      return {
        ...state,
        // @ts-ignore TODO
        transactions: data,
      }
    }
    case ACTIONS.LOAD_MORE_TRANSACTIONS: {
      const { data } = action
      const { transactions } = state
      return {
        ...state,
        transactions: {
          // @ts-ignore TODO
          ...data,
          content: [...transactions.content, ...data.content],
        },
      }
    }
    case ACTIONS.LOAD_RECENT_TRANSACTIONS: {
      /**
       * @param {Wallet.Invoice | Wallet.Payment | Wallet.Transaction} unifiedTransaction
       */
      const { data } = action

      return {
        ...state,
        // @ts-ignore TODO
        recentTransactions: data.content,
      }
    }
    case ACTIONS.LOAD_NEW_RECENT_INVOICE: {
      const { data } = action

      return {
        ...state,
        // @ts-ignore TODO
        recentInvoices: [data, ...state.recentInvoices],
      }
    }
    case ACTIONS.UNIFY_TRANSACTIONS: {
      const filteredTransactions = [
        ...state.recentTransactions,
        ...state.recentPayments,
        ...state.recentInvoices,
      ].filter(
        /**
         * @param {Wallet.Invoice | Wallet.Payment | Wallet.Transaction} unifiedTransaction
         */
        unifiedTransaction => {
          if (Wallet.isInvoice(unifiedTransaction)) {
            return unifiedTransaction.settled
          }

          if (Wallet.isPayment(unifiedTransaction)) {
            return unifiedTransaction.status === 'SUCCEEDED'
          }

          if (Wallet.isTransaction(unifiedTransaction)) {
            return unifiedTransaction.num_confirmations > 0
          }

          return false
        },
      )

      const sortedTransactions = filteredTransactions.sort(
        /**
         * @param {Wallet.Invoice | Wallet.Payment | Wallet.Transaction} a
         * @param {Wallet.Invoice | Wallet.Payment | Wallet.Transaction} b
         */
        (a, b) => {
          const _a = (() => {
            if (Wallet.isInvoice(a)) {
              return Number(a.settle_date)
            }

            if (Wallet.isPayment(a)) {
              return Number(a.creation_date)
            }

            if (Wallet.isTransaction(a)) {
              return Number(a.time_stamp)
            }

            return 0
          })()

          const _b = (() => {
            if (Wallet.isInvoice(b)) {
              return Number(b.settle_date)
            }

            if (Wallet.isPayment(b)) {
              return Number(b.creation_date)
            }

            if (Wallet.isTransaction(b)) {
              return Number(b.time_stamp)
            }

            return 0
          })()

          return _b - _a
        },
      )

      return {
        ...state,
        unifiedTransactions: sortedTransactions,
      }
    }
    case ACTIONS.LOAD_NEW_RECENT_TRANSACTION: {
      const { data } = action

      return {
        ...state,
        // @ts-ignore TODO
        recentTransactions: [data, ...state.recentTransactions],
      }
    }
    case ACTIONS.LOAD_RECENT_INVOICES: {
      const { data } = action

      return {
        ...state,
        // @ts-ignore TODO
        recentInvoices: reverse(data),
      }
    }
    default:
      return state
  }
}

export default history
