import { generateRandomBytes } from '../services/encryption'
import * as MediaLib from '../services/mediaLib'
import * as Actions from '../actions/mediaLib'
import {FilePickerFile} from 'react-native-file-picker'
//import { Schema } from 'shock-common'

export type MediaToUpload = {
    mainMedia:FilePickerFile
    previewMedia:FilePickerFile|null
    privateContent:boolean
    seedServerUrl:string
    seedServerToken:string
    mainMediaWidth:number
    mainMediaHeight:number
    previewMediaWidth:number
    previewMediaHeight:number
    title:string
    description:string
}


export const uploadMedia = (media:MediaToUpload) => async (dispatch:any) =>{

    try{
        dispatch(Actions.beganContentUpload())
        const localID:string = await generateRandomBytes(32)
        dispatch(Actions.gotLocalID(localID))
        const mediaComplete:Array<MediaLib.CompleteAnyMedia> = []
        if(media.previewMedia){
            const previewParams:MediaLib.MediaType = {
                file:media.previewMedia,
                localID,
                serviceToken:media.seedServerToken,
                serviceUrl:media.seedServerUrl
            }
            dispatch(Actions.beganPreviewUpload())
            const preview:MediaLib.uploadedFileInfo = await MediaLib.uploadPreviewContent(previewParams)
            mediaComplete.push({
                //@ts-ignore
                height:media.previewMediaHeight,
                //@ts-ignore
                width:media.previewMediaWidth,
                isPreview:true,
                magnetURI:preview.torrent,
                type:preview.type,
                isPrivate:false
            })
            dispatch(Actions.beganMediaUpload({
                height:media.previewMediaHeight,
                width:media.previewMediaWidth,
                magnet:preview.torrent
            }))
        } else {
            dispatch(Actions.beganMediaUpload({
                height:0,
                width:0,
                magnet:''
            }))
        }
        const mainParams:MediaLib.MediaType = {
            file:media.mainMedia,
            localID,
            serviceToken:media.seedServerToken,
            serviceUrl:media.seedServerUrl
        }
        
        const main:MediaLib.uploadedFileInfo = await MediaLib.uploadMediaContent(mainParams)
        mediaComplete.push({
            //@ts-ignore
            height:media.previewMediaHeight,
            //@ts-ignore
            width:media.previewMediaWidth,
            isPreview:false,
            magnetURI:main.torrent,
            type:main.type,
            isPrivate:media.privateContent
        })
        dispatch(Actions.beganMetadataUpload({
            height:media.mainMediaHeight,
            width:media.mainMediaWidth,
            magnet:main.torrent
        }))
        const contentID:string = await MediaLib.createLibEntry(mediaComplete)
        dispatch(Actions.finishedContentUpload(contentID,mediaComplete))
    } catch(e) {
        dispatch(Actions.contentUploadError(e))
    }

}
//NEED A PREVIEW CONTENT TYPE