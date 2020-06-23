import {generateRandomBytes} from './encryption'
import FilePickerManager from 'react-native-file-picker';
import {
  FilePickerCancel,
  FilePickerError,
  FilePickerFile
} from 'react-native-file-picker'

export const enrollToken = async (
  serviceUrl:string,
  seedToken : string
) :Promise<string> => {
  const token : string = await generateRandomBytes(128)
  const data : object = {
    seed_token:seedToken,
    wallet_token:token
  }
  const res = await fetch(`${serviceUrl}/api/enroll_token`, {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data) 
  })
  if(res.ok){
    return token
  }
  throw new Error ("enroll token res NOT ok")
}

export const pickFile = () : Promise<FilePickerFile> =>{
  return new Promise((res,rej)=>{
    FilePickerManager.showFilePicker(response => {
      if ((response as FilePickerCancel).didCancel) {
        rej('User cancelled file picker');
      }
      else if ((response as FilePickerError).error) {
        rej('FilePickerManager Error: '+ (response as FilePickerError).error);
      }
      else {
        res(response as FilePickerFile)
      }
    })
  })
  
}
interface TorrentFile {
  name:string
  web_seed:string
  hash:string
  magnet:string
}

interface TorrentFileRes {
  data :{
    torrent:TorrentFile
  }
}

export const putFile = async (
  serviceUrl: string,
  token : string,
  file : FilePickerFile
) : Promise<TorrentFile> =>  {
  const formData = new FormData()
  formData.append("file",file)
  formData.append("info","")
  formData.append("comment","")
  const res = await fetch(`${serviceUrl}/api/put_file`,{
    method: 'POST', 
    headers:{
      Authorization:`Bearer ${token}`
    },
    body: formData 
  })
  if (res.ok){
    const torrent = await res.json() as TorrentFileRes
    return torrent.data.torrent as TorrentFile
  }
  throw new Error ("put file res NOT ok")
}

const allowedTypes:string[] = ['image/jpeg','video/mpeg','video/mp4','image/png']

export const isAllowedFormat = (type : string) :boolean => {

  return allowedTypes.includes(type)
}


export const getMediaType = (type : string) :'image/embedded'|'video/embedded' =>{
  if (type.includes(`image/`)) return "image/embedded"
  return 'video/embedded'
}