import { Schema } from 'shock-common'
import { createSelector } from 'reselect'

import { State } from '../../reducers'

const getChainTXs = (state: State) => state.chainTXs

const getChainTXHash = (_: State, props: string) => props

export const makeGetChainTransaction = () =>
  createSelector<
    State,
    string, // Props to selectors
    ReturnType<typeof getChainTXs>,
    ReturnType<typeof getChainTXHash>,
    Schema.ChainTransaction | null // Return type
  >(
    getChainTXs,
    getChainTXHash,
    (chainTXs, chainTXHash) => chainTXs.byId[chainTXHash] || null,
  )

export const getLatestChainTransactionIDs = (state: State) => state.chainTXs.ids

export const getLatestChainTransactions = createSelector<
  State,
  ReturnType<typeof getLatestChainTransactionIDs>,
  ReturnType<typeof getChainTXs>,
  Schema.ChainTransaction[]
>(
  getLatestChainTransactionIDs,
  getChainTXs,
  (chainTXHashes, chainTXs) =>
    chainTXHashes.map(txHash => chainTXs.byId[txHash]),
)
