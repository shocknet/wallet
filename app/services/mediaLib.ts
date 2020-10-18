import * as SeedServer from './seedServer'
import { FilePickerFile } from 'react-native-file-picker'
import { Schema } from 'shock-common'
import { generateRandomBytes } from './encryption'

export type FilePickerExtended = FilePickerFile & { isPreview: boolean }
export type MediaType = {
  files: FilePickerExtended[]
  localID: string
  serviceToken: string
  serviceUrl: string
}

export type uploadedFileInfo = {
  torrent: string
  type: 'image/embedded' | 'video/embedded'
}
type CompleteEmbImage = Schema.EmbeddedImage & {
  isPreview: boolean
  isPrivate: boolean
}
type CompleteEmbVideo = Schema.EmbeddedVideo & {
  isPreview: boolean
  isPrivate: boolean
}
export type CompleteAnyMedia = CompleteEmbImage | CompleteEmbVideo

export const uploadPreviewContent = async (
  mediaData: MediaType,
): Promise<uploadedFileInfo> => {
  const [firstFile] = mediaData.files //only one media for preview for the moment
  if (!firstFile || !firstFile.isPreview) {
    throw new Error('no preview file was provided to uploadPreviewContent')
  }
  if (!SeedServer.isAllowedFormat(firstFile.type)) {
    throw new Error('Unknown media type in preview, got:' + firstFile.type)
  }
  const mediaToken: string = await SeedServer.enrollToken(
    mediaData.serviceUrl,
    mediaData.serviceToken,
  )
  const torrentFile: SeedServer.TorrentFile = await SeedServer.putFile(
    mediaData.serviceUrl,
    mediaToken,
    [firstFile as FilePickerFile],
    mediaData.localID,
  )
  return {
    torrent: torrentFile.magnet,
    type: SeedServer.getMediaType(firstFile.type),
  }
}

export const uploadMediaContent = async (
  mediaData: MediaType,
): Promise<uploadedFileInfo> => {
  const [firstFile, secondFile] = mediaData.files //only support one file for preview and one for media for the moment
  const filesToSend: FilePickerFile[] = []
  let legend: {
    previewName: string
    mediaName: string
    localID: string
  } | null = null
  let mediaType: 'image/embedded' | 'video/embedded' = 'video/embedded'
  if (firstFile) {
    //in case there is no preview, the second file must be undefined
    if (!secondFile) {
      //if only one exists it is the media
      filesToSend.push(firstFile)
      mediaType = SeedServer.getMediaType(firstFile.type)
    } else {
      //if both exist, the first must be preview and the second must be main media
      filesToSend.push(firstFile, secondFile)
      if (firstFile.isPreview) {
        legend = {
          previewName: firstFile.fileName,
          mediaName: secondFile.fileName,
          localID: mediaData.localID,
        }
        mediaType = SeedServer.getMediaType(secondFile.type)
      } else {
        //just in case
        legend = {
          previewName: secondFile.fileName,
          mediaName: firstFile.fileName,
          localID: mediaData.localID,
        }
        mediaType = SeedServer.getMediaType(firstFile.type)
      }
    }
  } else {
    throw new Error('no media file was provided to uploadMediaContent')
  }
  filesToSend.forEach(file => {
    if (!SeedServer.isAllowedFormat(file.type)) {
      throw new Error('Unknown media type in media, got:' + file.type)
    }
  })
  const extraInfo = legend ? JSON.stringify(legend) : mediaData.localID
  const mediaToken: string = await SeedServer.enrollToken(
    mediaData.serviceUrl,
    mediaData.serviceToken,
  )
  const torrentFile: SeedServer.TorrentFile = await SeedServer.putFile(
    mediaData.serviceUrl,
    mediaToken,
    filesToSend,
    extraInfo,
  )
  return {
    torrent: torrentFile.magnet,
    type: mediaType,
  }
}

export const createLibEntry = async (media: CompleteAnyMedia[]) => {
  //Http post -> create lipb entity
  //return gun object id as contentID
  console.log(media)
  //notificationService.Log("TESTING","createLibEntry not implemented yet, sending random bytes as response")
  const contentID = await generateRandomBytes(16)
  return contentID
}

export const getMediaContent = (contentID: string): any => {
  console.log(contentID)
}

export const getPreviewContent = (contentID: string): string => {
  console.log(contentID)
  const magnet = ''
  return magnet
}

export const isContentPrivate = (content: any): boolean => {
  console.log(content)
  return false
}

export const getPublicContent = (contentID: any): string => {
  console.log(contentID)
  const magnet = ''
  return magnet
}
export const getPrivateContent = async (
  images: MediaToCheck[],
  videos: MediaToCheck[],
): Promise<{ images: MediaToCheck[]; videos: MediaToCheck[] }> => {
  console.log(images) //send to API for the check
  console.log(videos) //send to API for the check
  await new Promise(res => setTimeout(() => res(), 1000)) //some delay to not make it instant, to remove later
  const res = { images, videos } //api call to place the order and obtain the data
  return res
}
type MediaToCheck = {
  id: string
  data: string
  width: number
  height: number
  isPreview: boolean
  isPrivate: boolean
}
export const isContentAvailable = async (
  images: MediaToCheck[],
  videos: MediaToCheck[],
): Promise<boolean | { images: MediaToCheck[]; videos: MediaToCheck[] }> => {
  console.log(images) //send to API for the check
  console.log(videos) //send to API for the check
  await new Promise(res => setTimeout(() => res(), 100)) //some delay to not make it instant, to remove later
  //TODO: API call to check if the content was already paid
  //if the content is paid "data" should contain the content magnet if the op failed, return false
  return false
}
