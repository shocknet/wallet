import produce from 'immer'
//import { Schema } from 'shock-common'

/**
 * @typedef {import('../app/actions').Action} Action
 *
 */
//TODO: add @typedef {Schema.Follow} Follow
/**
 * @typedef {object} Follow
 * @prop {string} user
 * @prop {boolean} private
 * @prop {'processing'|'ok'} status
 */
/**
 * @typedef {Record<string, Follow>} State
 */

/** @type {State} */
const INITIAL_STATE = {}

/**
 *
 * @param {string} publicKey
 * @returns {Follow}
 */
const createEmptyFollow = publicKey => ({
  private: false,
  status: 'processing',
  user: publicKey,
})

/**
 * @param {State} state
 * @param {Action} action
 * @returns {State}
 */
const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'follows/beganFollow':
      return produce(state, draft => {
        const { publicKey: pk } = action.data
        draft[pk] = createEmptyFollow(pk)
      })
    case 'follows/finishedFollow':
      return produce(state, draft => {
        const { publicKey: pk } = action.data
        draft[pk] = {
          ...createEmptyFollow(pk),
          ...(draft[pk] || {}),
          status: 'ok',
        }
      })
    case 'follows/followError':
      return produce(state, draft => {
        const { publicKey: pk } = action.data
        delete draft[pk]
      })
    case 'follows/beganUnfollow':
      return produce(state, draft => {
        const { publicKey: pk } = action.data
        draft[pk] = {
          ...createEmptyFollow(pk),
          ...(draft[pk] || {}),
          status: 'processing',
        }
      })
    case 'follows/finishedUnfollow':
      return produce(state, draft => {
        const { publicKey: pk } = action.data
        delete draft[pk]
      })
    case 'follows/unfollowError':
      return produce(state, draft => {
        const { publicKey: pk } = action.data
        draft[pk] = {
          ...createEmptyFollow(pk),
          ...(draft[pk] || {}),
          status: 'ok',
        }
      })
    case 'follows/receivedFollow':
      return produce(state, draft => {
        /**
         * @param {Follow} follow
         */
        const followHandler = follow => {
          const { user: pk } = follow
          draft[pk] = {
            ...createEmptyFollow(pk),
            ...(draft[pk] || {}),
            ...follow,
          }
        }
        Object.values(action.data.follows).forEach(followHandler)
      })
    default:
      return state
  }
}

export default reducer
