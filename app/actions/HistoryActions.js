import * as Wallet from '../services/wallet'
import Logger from 'react-native-file-log'

export const ACTIONS = {
  LOAD_CHANNELS: 'channels/load',
  LOAD_INVOICES: 'invoices/load',
  LOAD_MORE_INVOICES: 'invoices/loadMore',
  LOAD_PEERS: 'peers/load',
  LOAD_PAYMENTS: 'payments/load',
  LOAD_MORE_PAYMENTS: 'payments/loadMore',
  LOAD_TRANSACTIONS: 'transactions/load',
  LOAD_MORE_TRANSACTIONS: 'transactions/loadMore',
  LOAD_NEW_RECENT_TRANSACTION: 'transactions/new',
  LOAD_RECENT_TRANSACTIONS: 'recentTransactions/load',
  LOAD_RECENT_PAYMENTS: 'recentPayments/load',
  LOAD_RECENT_INVOICES: 'recentInvoices/load',
  LOAD_NEW_RECENT_INVOICE: 'recentInvoices/new',
  UNIFY_TRANSACTIONS: 'unifiedTransactions/unify',
}
/**
 * Fetches the Node's info
 * @returns {import('redux-thunk').ThunkAction<Promise<Wallet.Channel[]>, {}, {}, import('redux').AnyAction>}
 */
export const fetchChannels = () => async dispatch => {
  const data = await Wallet.listChannels()

  dispatch({
    type: ACTIONS.LOAD_CHANNELS,
    data,
  })

  return data
}

/**
 * Fetches the Node's info
 * @returns {import('redux-thunk').ThunkAction<Promise<Wallet.PaginatedListInvoicesResponse>, {}, {}, import('redux').AnyAction>}
 */
export const fetchInvoices = ({
  page = 1,
  itemsPerPage = 10,
  reset = false,
}) => async dispatch => {
  const data = await Wallet.listInvoices({ page, itemsPerPage })

  if (reset) {
    dispatch({
      type: ACTIONS.LOAD_INVOICES,
      data,
    })
    return data
  }

  dispatch({
    type: ACTIONS.LOAD_MORE_INVOICES,
    data,
  })

  return data
}

/**
 * Fetches the Node's info
 * @returns {import('redux-thunk').ThunkAction<Promise<Wallet.Peer[]>, {}, {}, import('redux').AnyAction>}
 */
export const fetchPeers = () => async dispatch => {
  const data = await Wallet.listPeers()

  dispatch({
    type: ACTIONS.LOAD_PEERS,
    data,
  })

  return data
}

/**
 * Fetches the Node's info
 * @returns {import('redux-thunk').ThunkAction<Promise<Wallet.PaginatedListPaymentsResponse>, {}, {}, import('redux').AnyAction>}
 */
export const fetchPayments = ({
  page = 1,
  itemsPerPage = 10,
  reset = false,
}) => async dispatch => {
  const data = await Wallet.listPayments({
    page,
    itemsPerPage,
    paginate: true,
    include_incomplete: false,
  })

  if (reset) {
    dispatch({
      type: ACTIONS.LOAD_PAYMENTS,
      data,
    })
    return data
  }

  dispatch({
    type: ACTIONS.LOAD_MORE_PAYMENTS,
    data,
  })

  return data
}

/**
 * Fetches the Node's info
 * @returns {import('redux-thunk').ThunkAction<Promise<Wallet.PaginatedTransactionsResponse>, {}, {}, import('redux').AnyAction>}
 */
export const fetchTransactions = ({
  page = 1,
  itemsPerPage = 10,
  reset = false,
}) => async dispatch => {
  const data = await Wallet.getTransactions({
    page,
    itemsPerPage,
    paginate: true,
  })

  if (reset) {
    dispatch({
      type: ACTIONS.LOAD_TRANSACTIONS,
      data,
    })
    return data
  }

  dispatch({
    type: ACTIONS.LOAD_MORE_TRANSACTIONS,
    data,
  })

  return data
}

/**
 * Unifies and sorts all of the currently loaded transactions, payments and invoices
 * @returns {import('redux-thunk').ThunkAction<void, {}, {}, import('redux').AnyAction>}
 */
export const unifyTransactions = () => dispatch => {
  dispatch({
    type: ACTIONS.UNIFY_TRANSACTIONS,
  })
}

/**
 * Fetches the Node's info
 * @returns {import('redux-thunk').ThunkAction<Promise<[
 *   Wallet.PaginatedListInvoicesResponse,
 *   Wallet.Peer[],
 *   Wallet.Channel[],
 *   Wallet.PaginatedListPaymentsResponse,
 *   Wallet.PaginatedTransactionsResponse
 * ]>, {}, {}, import('redux').AnyAction>}
 */
export const fetchHistory = () => async dispatch => {
  const history = await Promise.all([
    dispatch(fetchInvoices({ reset: true })),
    dispatch(fetchPeers()),
    dispatch(fetchChannels()),
    dispatch(fetchPayments({ reset: true })),
    dispatch(fetchTransactions({ reset: true })),
  ])

  dispatch(unifyTransactions())

  return history
}

/**
 * Fetches the recent transactions
 * @returns {import('redux-thunk').ThunkAction<Promise<void>, {}, {}, import('redux').AnyAction>}
 */
export const fetchRecentInvoices = () => async dispatch => {
  const invoiceResponse = await Wallet.listInvoices({
    itemsPerPage: 100,
    page: 1,
  })

  dispatch({
    type: ACTIONS.LOAD_RECENT_INVOICES,
    data: invoiceResponse.content,
  })

  dispatch(unifyTransactions())
}

/**
 * Fetches the latest payments
 * @returns {import('redux-thunk').ThunkAction<Promise<void>, {}, {}, import('redux').AnyAction>}
 */
export const fetchRecentPayments = () => async dispatch => {
  const payments = await Wallet.listPayments({
    include_incomplete: false,
    itemsPerPage: 100,
    page: 1,
    paginate: true,
  })

  const decodedRequests = await Promise.all(
    payments.content.map(payment =>
      Wallet.decodeInvoice({ payReq: payment.payment_request }).catch(e => {
        Logger.log(`HistoryActions.fetchRecentPayments() -> ${e.message}`)
      }),
    ),
  )

  const recentPayments = payments.content.map((payment, key) => ({
    ...payment,
    decodedPayment: decodedRequests[key],
  }))

  dispatch({
    type: ACTIONS.LOAD_RECENT_PAYMENTS,
    data: recentPayments,
  })

  dispatch(unifyTransactions())
}

/**
 * Fetches the recent transactions
 * @returns {import('redux-thunk').ThunkAction<Promise<void>, {}, {}, import('redux').AnyAction>}
 */
export const fetchRecentTransactions = () => async dispatch => {
  const invoiceResponse = await Wallet.getTransactions({
    itemsPerPage: 100,
    page: 1,
    paginate: true,
  })

  dispatch({
    type: ACTIONS.LOAD_RECENT_TRANSACTIONS,
    data: invoiceResponse,
  })

  dispatch(unifyTransactions())
}

/**
 * Loads a new invoice into the Redux reducer
 * @param {Wallet.Invoice} invoice
 * @returns {import('redux-thunk').ThunkAction<void, {}, {}, import('redux').AnyAction>}
 */
export const loadNewInvoice = invoice => dispatch => {
  dispatch({
    type: ACTIONS.LOAD_NEW_RECENT_INVOICE,
    data: invoice,
  })

  dispatch(unifyTransactions())
}

/**
 * Loads a new transaction into the Redux reducer
 * @param {Wallet.Transaction} transaction
 * @returns {import('redux-thunk').ThunkAction<void, {}, {}, import('redux').AnyAction>}
 */
export const loadNewTransaction = transaction => dispatch => {
  dispatch({
    type: ACTIONS.LOAD_NEW_RECENT_TRANSACTION,
    data: transaction,
  })

  dispatch(unifyTransactions())
}
