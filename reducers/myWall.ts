//import produce from 'immer'
import {Action} from '../app/actions'
export type State = {
    pinnedPostID:string|null
    postToDeleteID:string|null
    error:string|null
    status:string
}

const INITIAL_STATE:State = {
    pinnedPostID:null,
    postToDeleteID:null,
    error:null,
    status:''
}

const reducer = (state:State = INITIAL_STATE,action:Action) => {
    switch(action.type){
        case 'myWall/beganSettingPinned':{
            return state
        }
        case 'myWall/finishedSettingPinned':{
            return state
        }
        case 'myWall/ErrorSettingPinned':{
            return state
        }
        case 'myWall/beganDeletePost':{
            return state
        }
        case 'myWall/finishedDeletePost':{
            return state
        }
        case 'myWall/ErrorDeletePost':{
            return state
        }
        default:{
            return state
        }
    }
}

export default reducer