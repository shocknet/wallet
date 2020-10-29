import { CompleteAnyMedia } from '../../services/mediaLib'
import { ThumbnailFile } from '../thunks'

export type MediaBasicInfo = {
  magnet: string
  width: number
  height: number
}

export type BeganContentUploadAction = {
  type: 'mediaLib/beganContentUpload'
}
export type GotLocalIDAction = {
  type: 'mediaLib/gotLocalID'
  data: string
}
export type BeganPreviewUploadAction = {
  type: 'mediaLib/beganPreviewUpload'
}
export type BeganMediaUploadAction = {
  type: 'mediaLib/beganMediaUpload'
  data: MediaBasicInfo
}
export type BeganMetadataUploadAction = {
  type: 'mediaLib/beganMetadataUpload'
  data: {
    media: MediaBasicInfo
    thumbnail?: ThumbnailFile
  }
}
export type FinishedContentUploadAction = {
  type: 'mediaLib/finishedContentUpload'
  data: {
    contentID: string
    contents: CompleteAnyMedia[]
  }
}
export type ContentUploadErrorAction = {
  type: 'mediaLib/contentUploadError'
  data: string
}
export type ClearContentUploadAction = {
  type: 'mediaLib/clearContentUpload'
}
export type MediaLibAction =
  | BeganContentUploadAction
  | GotLocalIDAction
  | BeganPreviewUploadAction
  | BeganMediaUploadAction
  | BeganMetadataUploadAction
  | FinishedContentUploadAction
  | ContentUploadErrorAction
  | ClearContentUploadAction

export const beganContentUpload = (): BeganContentUploadAction => ({
  type: 'mediaLib/beganContentUpload',
})

export const gotLocalID = (localID: string): GotLocalIDAction => ({
  type: 'mediaLib/gotLocalID',
  data: localID,
})

export const beganPreviewUpload = (): BeganPreviewUploadAction => ({
  type: 'mediaLib/beganPreviewUpload',
})
export const beganMediaUpload = (
  mediaInfo: MediaBasicInfo,
): BeganMediaUploadAction => ({
  type: 'mediaLib/beganMediaUpload',
  data: mediaInfo,
})

export const beganMetadataUpload = (
  mediaInfo: MediaBasicInfo,
  thumbnailInfo?: ThumbnailFile,
): BeganMetadataUploadAction => ({
  type: 'mediaLib/beganMetadataUpload',
  data: {
    media: mediaInfo,
    thumbnail: thumbnailInfo,
  },
})
export const finishedContentUpload = (
  contentID: string,
  contents: CompleteAnyMedia[],
): FinishedContentUploadAction => ({
  type: 'mediaLib/finishedContentUpload',
  data: {
    contentID,
    contents,
  },
})
type ErrMessage = {
  errorMessage: string
}
export const contentUploadError = (
  error: Error | string | ErrMessage,
): ContentUploadErrorAction => {
  let message = ''
  if (typeof error === 'string') {
    message = error
  } else if ((error as ErrMessage).errorMessage) {
    message = (error as ErrMessage).errorMessage
  } else if ((error as Error).message) {
    message = (error as Error).message
  }

  return {
    type: 'mediaLib/contentUploadError',
    data: message,
  }
}
export const clearContentUpload = (): ClearContentUploadAction => ({
  type: 'mediaLib/clearContentUpload',
})
