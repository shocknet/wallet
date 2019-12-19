import * as Wallet from '../services/wallet'

export const ACTIONS = {
  LOAD_CHANNELS: 'channels/load',
  LOAD_INVOICES: 'invoices/load',
  LOAD_MORE_INVOICES: 'invoices/loadMore',
  LOAD_PEERS: 'peers/load',
  LOAD_PAYMENTS: 'payments/load',
  LOAD_MORE_PAYMENTS: 'payments/loadMore',
  LOAD_TRANSACTIONS: 'transactions/load',
  LOAD_MORE_TRANSACTIONS: 'transactions/loadMore',
  LOAD_RECENT_TRANSACTIONS: 'recentTransactions/load',
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
 * Fetches the Node's info
 * @returns {import('redux-thunk').ThunkAction<Promise<[
 *   Wallet.PaginatedListInvoicesResponse,
 *   Wallet.Peer[],
 *   Wallet.Channel[],
 *   Wallet.PaginatedListPaymentsResponse,
 *   Wallet.PaginatedTransactionsResponse
 * ]>, {}, {}, import('redux').AnyAction>}
 */
export const fetchHistory = () => dispatch =>
  Promise.all([
    dispatch(fetchInvoices({ reset: true })),
    dispatch(fetchPeers()),
    dispatch(fetchChannels()),
    dispatch(fetchPayments({ reset: true })),
    dispatch(fetchTransactions({ reset: true })),
  ])

/**
 * Fetches the Node's info
 * @returns {import('redux-thunk').ThunkAction<Promise<void>, {}, {}, import('redux').AnyAction>}
 */
export const fetchRecentTransactions = () => async dispatch => {
  const [invoiceResponse, payments, transactions] = await Promise.all([
    Wallet.listInvoices({
      itemsPerPage: 100,
      page: 1,
    }),
    Wallet.listPayments({
      include_incomplete: false,
      itemsPerPage: 100,
      page: 1,
      paginate: true,
    }),
    Wallet.getTransactions({
      itemsPerPage: 100,
      page: 1,
      paginate: true,
    }),
  ])

  const recentTransactions = [
    ...invoiceResponse.content,
    ...payments.content,
    ...transactions.content,
  ]

  dispatch({
    type: ACTIONS.LOAD_RECENT_TRANSACTIONS,
    data: recentTransactions,
  })
}
