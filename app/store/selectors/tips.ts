import { createSelector } from 'reselect'

import { State } from '../reducers'
import { Tip } from '../../schema'

export const getTips = (state: State) => state.tips

const getPublicKey = (_: State, props: string) => props

export const makeGetTip = () =>
  createSelector<
    State,
    string, // Props to selectors
    ReturnType<typeof getTips>,
    ReturnType<typeof getPublicKey>,
    Tip | null // Return type
  >(
    getTips,
    getPublicKey,
    (tips, publicKey) => tips[publicKey] || null,
  )
