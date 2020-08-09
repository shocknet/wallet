import reverse from 'lodash/reverse'
import { ACTIONS } from '../app/actions/HistoryActions'
import * as Wallet from '../app/services/wallet'

/**
 * @typedef {Wallet.Invoice | Wallet.Payment | Wallet.Transaction} UnifiedTransaction
 */

/**
 * @typedef {object} State
 * @prop {Wallet.Channel[]} channels
 * @prop {Wallet.pendingChannels[]} pendingChannels
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
 * @typedef {import('../app/services/wallet').Channel} Channel
 * @typedef {import('../app/services/wallet').Peer} Peer
 */
/**
 * @typedef {object} Action
 * @prop {string} type
 * @prop {(object|Channel[]|Peer[])=} data
 */

/** @type {State} */
const INITIAL_STATE = {
  channels: [],
  pendingChannels:[],
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
      if (!Array.isArray(data)) {
        return state
      }
      return {
        ...state,
        //@ts-ignore
        channels: data,
      }
    }
    case ACTIONS.LOAD_PENDING_CHANNELS: {
      const { data } = action
      if(!Array.isArray(data)){
        return state
      }
      return {
        ...state,
        //@ts-ignore 
        pendingChannels: data,
      }
    }
    case ACTIONS.LOAD_INVOICES: {
      const { data } = action
      if (typeof data !== 'object') {
        return state
      }
      return {
        ...state,
        invoices: data,
      }
    }
    case ACTIONS.LOAD_MORE_INVOICES: {
      const { data } = action
      const { invoices } = state
      return {
        ...state,
        invoices: {
          ...data,
          //@ts-ignore
          content: [...invoices.content, ...data.content],
        },
      }
    }
    case ACTIONS.LOAD_PEERS: {
      const { data } = action
      if (!Array.isArray(data)) {
        return state
      }
      return {
        ...state,
        //@ts-ignore
        peers: data,
      }
    }
    case ACTIONS.LOAD_PAYMENTS: {
      const { data } = action
      if (typeof data !== 'object') {
        return state
      }
      return {
        ...state,
        payments: data,
      }
    }
    case ACTIONS.LOAD_MORE_PAYMENTS: {
      const { data } = action
      const { payments } = state
      return {
        ...state,
        payments: {
          ...data,
          //@ts-ignore
          content: [...payments.content, ...data.content],
        },
      }
    }
    case ACTIONS.LOAD_TRANSACTIONS: {
      const { data } = action
      if (typeof data !== 'object') {
        return state
      }
      return {
        ...state,
        transactions: data,
      }
    }
    case ACTIONS.LOAD_MORE_TRANSACTIONS: {
      const { data } = action
      const { transactions } = state
      return {
        ...state,
        transactions: {
          ...data,
          //@ts-ignore
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
        //@ts-ignore
        recentTransactions: data.content,
      }
    }
    case ACTIONS.LOAD_RECENT_PAYMENTS: {
      /**
       * @param {Wallet.Invoice | Wallet.Payment | Wallet.Transaction} unifiedTransaction
       */
      const { data } = action

      return {
        ...state,
        //@ts-ignore
        recentPayments: data,
      }
    }
    case ACTIONS.LOAD_NEW_RECENT_INVOICE: {
      const { data } = action
      if (!Array.isArray(data)) {
        return state
      }
      return {
        ...state,
        //@ts-ignore
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
            return true
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
      /**
       * @type {{data:import('../app/services/wallet').Transaction}}
       */
      //@ts-ignore
      const { data } = action
      const { recentTransactions } = state
      const {tx_hash : txHash} = data
      /**
       * 
       * @param {import('../app/services/wallet').Transaction} tx 
       */
      const sameTx = tx => tx.tx_hash === txHash
      const txIndex = recentTransactions.findIndex(sameTx)
      const newContent = [...recentTransactions]
      if(txIndex !== -1){
        newContent[txIndex] = data
      } else {
        newContent.unshift(data)
      }
      return {
        ...state,
        //@ts-ignore
        recentTransactions: newContent,
      }
    }
    case ACTIONS.LOAD_RECENT_INVOICES: {
      const { data } = action
      if (!Array.isArray(data)) {
        return state
      }
      return {
        ...state,
        //@ts-ignore
        recentInvoices: reverse(data),
      }
    }
    default:
      return state
  }
}

export default history
