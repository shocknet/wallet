
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
 * @prop {'processing'|'ok'|'error'} status
 * @prop {string|null} err
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
  err: null,
  private: false,
  status:'processing',
  user:publicKey
})

/**
 * @param {State} state
 * @param {Action} action
 * @returns {State}
 */
const reducer = (state = INITIAL_STATE,action) => {
  switch(action.type){
    case 'follow/follow':
      return produce(state, draft =>{
        const {user: pk} = action.data.followData
        draft[pk] = {
          ...createEmptyFollow(pk),
          ...(draft[pk] || {}),
          ...action.data.followData
        }
      })
    default:
      return state
  }
}

export default reducer