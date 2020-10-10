import { TransactionDetails, GetTransactionsRequest } from 'shock-common'

export const receivedChainTransactions = (data: {
  transactions: TransactionDetails['transactions']
  originRequest: GetTransactionsRequest
}) =>
  ({
    type: 'chainTXs/receivedOwn',
    data,
  } as const)

export const chainTXsRefreshForced = () =>
  ({
    type: 'chainTXs/refreshForced',
  } as const)

export type ChainTXsAction =
  | ReturnType<typeof receivedChainTransactions>
  | ReturnType<typeof chainTXsRefreshForced>
