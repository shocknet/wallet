import {
  TransactionDetails,
  GetTransactionsRequest,
  Schema,
} from 'shock-common'

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

export const receivedSingleChainTX = (tx: Schema.ChainTransaction) =>
  ({
    type: 'chainTXs/receivedSingle',
    payload: {
      tx,
    },
  } as const)

export type ChainTXsAction =
  | ReturnType<typeof receivedChainTransactions>
  | ReturnType<typeof chainTXsRefreshForced>
  | ReturnType<typeof receivedSingleChainTX>
