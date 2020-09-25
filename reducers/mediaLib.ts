import produce from 'immer'

import * as MediaLibActions from '../app/actions/mediaLib'
import {Action} from '../app/actions'
import {CompleteAnyMedia} from '../app/services/mediaLib'
export type State = {
    medias:Record<string,CompleteAnyMedia[]>
    currentLocalID:string
    currentPreview:MediaLibActions.MediaBasicInfo
    currentMedia:MediaLibActions.MediaBasicInfo
    status:string
    error:string|null
    seedServerUrl:string
    seedServerToken:string
}
const createEmptyMedia = ():MediaLibActions.MediaBasicInfo => ({
    height:0,
    width:0,
    magnet:''
})

const INITIAL_STATE:State = {
    currentLocalID:'',
    currentMedia:createEmptyMedia(),
    currentPreview:createEmptyMedia(),
    medias:{},
    status:'',
    error:null,
    //handle seed server
    seedServerToken:'jibberish',
    seedServerUrl:'https://webtorrent.shock.network'
}

const reducer = (state:State = INITIAL_STATE,action:Action) => {
    switch(action.type){
        case 'mediaLib/beganContentUpload':{
            return produce(state,draft => {
                draft.status='starting...'
            })
        }
        case 'mediaLib/gotLocalID':{
            return produce(state,draft => {
                const {data:localID} = action
                draft.currentLocalID = localID
                draft.status='processing...'
            })
        }
        case 'mediaLib/beganPreviewUpload':{
            return produce(state, draft => {
                draft.status='uploading preview...'
            })
        }
        case 'mediaLib/beganMediaUpload':{
            return produce(state, draft => {
                const {data:preview} = action
                draft.currentPreview = preview
                draft.status='uploading media...'
            })
        }
        case 'mediaLib/beganMetadataUpload':{
            return produce(state,draft => {
                const {data:media} = action
                draft.currentMedia = media
                draft.status='uploading metadata...'
            })
        }
        case 'mediaLib/finishedContentUpload':{
            return produce(state,draft => {
                const {contentID,contents} = action.data
                draft.medias[contentID] = contents
                draft.status = ''
                draft.currentLocalID = ''
                draft.currentMedia = createEmptyMedia()
                draft.currentPreview = createEmptyMedia()
            })
        }
        case 'mediaLib/contentUploadError':{
            return produce(state,draft => {
                const {data:error} = action
                draft.error = error
            })
        }
        case 'mediaLib/clearContentUpload':{
            return produce(state,draft => {
                draft.error = null
                draft.status = ''
                draft.currentLocalID = ''
                draft.currentMedia = createEmptyMedia()
                draft.currentPreview = createEmptyMedia()
            })
        }
        default:{
            return state
        }
    }
}

export default reducer