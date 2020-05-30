//@ts-nocheck
import produce from 'immer'
//import { Schema } from 'shock-common'

/**
 * @typedef {import('../app/actions').Action} Action
 * 
 */
/**
 * @typedef {object} FeedMedia
 *
 * @property {'VIDEO'|'AUDIO'|'IMAGE'} type
 * @property {string} magnetUri
 * @property {number} ratio_x
 * @property {number} ratio_y
 *
 */

/**
 * @typedef {object} PartialFeed
 * @property {string} id
 * @property {string} username
 * @property {string} profilePic
 * @property {string[]} paragraphs
 * @property {FeedMedia[]} media
 *
 */
/**
 * @typedef {Record<string, PartialFeed[]>} State
 */

/** @type {State} */
const INITIAL_STATE = {
  feed: [
      {
          id:'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
          paragraphs:[
              "SOme text and stuff 111"
          ],
          profilePic:"",
          username:"bobni",
          media:[
              {
                  type:'VIDEO',
                  ratio_x: 1024,
                  ratio_y: 436,
                  magnetUri:'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent',
              },
          ]
      }
  ]
}

/**
 * 
 * @param {string} id 
 * @returns {PartialFeed}
 */
const createEmptyPartialFeed = id => ({
  id,
  paragraphs:[''],
  profilePic:'',
  username:'',
  media:[]

})

/**
 * @param {State} state
 * @param {Action} action
 * @returns {State}
 */
const reducer = (state = INITIAL_STATE,action) => {
  switch(action.type){
    case 'feed/beganLoadFeed':
      return produce(state, draft =>{
        //TODO
      })
    case 'feed/finishedLoadFeed':
      return produce(state, draft =>{
        /**
         * 
         * @param {PartialFeed} feedElement 
         * @param {string} id 
         */
        const FeedLoader = (feedElement,id) => {
          draft[id] = {
            ...createEmptyPartialFeed(id),
            ...(draft[id] || {}),
            ...feedElement
          }
        } 
        action.data.feed.forEach(FeedLoader)
      })
    case 'feed/loadFeedError':
      return produce(state, draft =>{
        //TODO 
      })
    case 'feed/beganAddPost':
      return produce(state, draft =>{
        //TODO
      })
    case 'feed/finishedAddPost':
      return produce(state, draft =>{
        const {post} = action.data
        const {id} = post
        draft[id] = {
          ...createEmptyPartialFeed(id),
            ...(draft[id] || {}),
            ...post
        }
      })
    case 'feed/addPostError':
      return produce(state, draft =>{
        //TODO
      })
    default :
      return state
  }
}

export default reducer