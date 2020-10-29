import { generateRandomBytes } from './encryption'
import ImagePicker from 'react-native-image-crop-picker'
import { FilePickerFile } from 'react-native-file-picker'
import notificationService from '../../notificationService'

export const enrollToken = async (
  serviceUrl: string,
  seedToken: string,
): Promise<string> => {
  const token: string = await generateRandomBytes(32)
  const data: object = {
    seed_token: seedToken,
    wallet_token: token,
  }
  const res = await fetch(`${serviceUrl}/api/enroll_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (res.ok) {
    return token
  }
  throw new Error('enroll token res NOT ok')
}

export const pickFile = async (
  contentType?: 'photo' | 'video' | 'mixed',
  otherOptions?: object,
): Promise<
  FilePickerFile & { width: number; height: number; name: string }
> => {
  const type = contentType ? contentType : 'video'
  const vid: {
    path: string
    name: string
    mime: string
    width: number
    height: number
  } = ((await ImagePicker.openPicker({
    mediaType: type,
    ...otherOptions,
  })) as unknown) as {
    path: string
    name: string
    mime: string
    width: number
    height: number
  }
  notificationService.LogT(JSON.stringify(vid))
  const name = vid.path.split('/').pop()
  if (!name) {
    throw new Error('no name found for file')
  }
  const vidReady: {
    name: string
    fileName: string
    type: string
    uri: string
    path: string
    width: number
    height: number
  } = {
    name: name,
    fileName: name,
    type: vid.mime,
    uri: vid.path,
    path: vid.path,
    height: vid.height,
    width: vid.width,
  }
  //throw new Error("AAAAAH")
  return vidReady
}
export interface TorrentFile {
  name: string
  web_seed: string
  hash: string
  magnet: string
}

interface TorrentFileRes {
  data: {
    torrent: TorrentFile
  }
}
/*WARNING FilePickerFile does not provide a field "name" but it must be provided to putFile,
  make sure to add it before passing the object file.name = file.fileName*/
export const putFile = async (
  serviceUrl: string,
  token: string,
  files: FilePickerFile[],
  extraInfo: string = '',
  comment: string = '',
): Promise<TorrentFile> => {
  const formData = new FormData()
  files.forEach(file => {
    const fileComplete: FilePickerFile & { name: string } = {
      ...file,
      name: file.fileName,
    }
    formData.append('files', fileComplete)
  })
  formData.append('info', extraInfo)
  formData.append('comment', comment)
  const res = await fetch(`${serviceUrl}/api/put_file`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })
  if (res.ok) {
    const torrent = (await res.json()) as TorrentFileRes
    return torrent.data.torrent as TorrentFile
  }
  throw new Error('put file res NOT ok')
}

const allowedTypes: string[] = [
  'image/jpeg',
  'video/mpeg',
  'video/mp4',
  'image/png',
]

export const isAllowedFormat = (type: string): boolean => {
  return allowedTypes.includes(type)
}

export const getMediaType = (
  type: string,
): 'image/embedded' | 'video/embedded' => {
  if (type.includes(`image/`)) return 'image/embedded'
  return 'video/embedded'
}
