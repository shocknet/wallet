import { createSelector } from 'reselect'
import pickBy from 'lodash/pickBy'

import { State } from '../reducers'

export const getFollowsTree = (state: State) => state.follows

export const getFollowedPublicKeys = createSelector<
  State,
  ReturnType<typeof getFollowsTree>,
  string[] // Return type
>(
  getFollowsTree,
  followsTree => {
    const withoutProcessing = pickBy(followsTree, v => v.status === 'ok')

    return Object.keys(withoutProcessing)
  },
)
