import {ACTIONS} from '../app/actions/FeedActions'

/**
 * @typedef {import('../app/actions/FeedActions').PartialFeed} PartialFeed
 * @typedef {import('../app/actions/FeedActions').FeedMedia} FeedMedia
 */

/**
 * @typedef {object} State
 * @prop {PartialFeed[]} feed
 */

/**
 * @typedef {object} Action
 * @prop {string} type
 * @prop {PartialFeed[]|(PartialFeed)=} data
 */

/**@type {State} */
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
 * @param {State} state
 * @param {Action} action
 * @returns {State}
 */

const feed = (state = INITIAL_STATE, action) =>{
    if(!action.data){
        return state
    }
    switch (action.type) {
        case ACTIONS.ADD_POST:{
            const {data} = action
            if (Array.isArray(data)){
                return state
            }
            state.feed.unshift(data)
            return {
                ...state
            }
        }
        case ACTIONS.LOAD_FEED:{
            const {data} = action
            if(!Array.isArray(data)){
                return state
            }
            return {
                feed:data
            }
        }

        default:
            return state
    }
}

export default feed