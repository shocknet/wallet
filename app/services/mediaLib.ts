import * as SeedServer from './seedServer'
import {FilePickerFile} from 'react-native-file-picker'
import { Schema } from 'shock-common'
import { generateRandomBytes } from './encryption'
import notificationService from '../../notificationService'
export type MediaType = {
    file:FilePickerFile,
    localID:string,
    serviceToken:string,
    serviceUrl:string
}

export type uploadedFileInfo = {
    torrent:string,
    type:'image/embedded'|'video/embedded'
}
type CompleteEmbImage = Schema.EmbeddedImage & {isPreview:boolean,isPrivate:boolean}
type CompleteEmbVideo = Schema.EmbeddedVideo & {isPreview:boolean,isPrivate:boolean}
export type CompleteAnyMedia = CompleteEmbImage|CompleteEmbVideo

export const uploadPreviewContent = async (mediaData:MediaType):Promise<uploadedFileInfo> => {
    if(!SeedServer.isAllowedFormat(mediaData.file.type)){
        throw new Error('Unknown media type in preview, got:'+mediaData.file.type)
    }
    const mediaToken:string = await SeedServer.enrollToken(mediaData.serviceUrl,mediaData.serviceToken)
    const torrentFile:SeedServer.TorrentFile = await SeedServer.putFile(mediaData.serviceUrl,mediaToken,mediaData.file,mediaData.localID)
    return {
        torrent:torrentFile.magnet,
        type:SeedServer.getMediaType(mediaData.file.type)
    }
}

export const uploadMediaContent = async (mediaData:MediaType):Promise<uploadedFileInfo> => {
    if(!SeedServer.isAllowedFormat(mediaData.file.type)){
        throw new Error('Unknown media type in media, got:'+mediaData.file.type)
    }
    const mediaToken:string = await SeedServer.enrollToken(mediaData.serviceUrl,mediaData.serviceToken)
    const torrentFile:SeedServer.TorrentFile = await SeedServer.putFile(mediaData.serviceUrl,mediaToken,mediaData.file,mediaData.localID)
    return {
        torrent:torrentFile.magnet,
        type:SeedServer.getMediaType(mediaData.file.type)
    }
}

export const createLibEntry = async (media:CompleteAnyMedia[])=>{
    //Http post -> create lipb entity
    //return gun object id as contentID
    console.log(media)
    notificationService.Log("TESTING","createLibEntry not implemented yet, sending random bytes as response")
    const contentID = await generateRandomBytes(16)
    return contentID
}

export const getMediaContent = (contentID:string):any => {
    console.log(contentID)
}

export const getPreviewContent = (contentID:string):string => {
    console.log(contentID)
    const magnet = ''
    return magnet
}

export const isContentPrivate = (content:any):boolean => {
    console.log(content)
    return false
}

export const getPublicContent = (contentID:any):string => {
    console.log(contentID)
    const magnet = ''
    return magnet
}
export const getPrivateContent = async (images:MediaToCheck[],videos:MediaToCheck[]):Promise<{images:MediaToCheck[],videos:MediaToCheck[]}> => {
    console.log(images) //send to API for the check
    console.log(videos) //send to API for the check 
    await new Promise(res => setTimeout(() => res(), 1000))//some delay to not make it instant, to remove later
    const res = {images,videos} //api call to place the order and obtain the data
    return res
}
type MediaToCheck = { 
    id: string
    data: string
    width: number
    height: number
    isPreview:boolean
    isPrivate:boolean
}
export const isContentAvailable = async (images:MediaToCheck[],videos:MediaToCheck[]):Promise<boolean|{images:MediaToCheck[],videos:MediaToCheck[]}> => {
    console.log(images) //send to API for the check
    console.log(videos) //send to API for the check
    await new Promise(res => setTimeout(() => res(), 100))//some delay to not make it instant, to remove later
     //TODO: API call to check if the content was already paid
    //if the content is paid "data" should contain the content magnet if the op failed, return false
    return false
}


