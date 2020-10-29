import React from 'react'
import { WebView } from 'react-native-webview'

import notificationService from '../../../notificationService'

type Props = {
  width: number
  height: number
  magnet: string
  type: 'video' | 'image'
  noControls?: boolean
  updateToMedia?: () => void
  onPress?: () => void
}

type State = {
  html: string
}

type CompleteWebView = WebView & { postMessage: (message: string) => void }

export default class ShockWebView extends React.Component<Props, State> {
  state = {
    html: '',
  }

  componentDidMount() {
    const { magnet, type: finalType, noControls } = this.props
    const playerString =
      finalType === 'video'
        ? `<video id="player" style="width:100%"></video>`
        : `<img id="player" style="width:100%"></img>`
    const fileExtension =
      finalType === 'video'
        ? `(file.name.endsWith('.mp4') || file.name.endsWith('.webm'))`
        : `(file.name.endsWith('.jpg') || file.name.endsWith('.png'))`
    const domID = finalType === 'video' ? `video#player` : `img#player`
    const videoControls = noControls ? "video.removeAttribute('controls')" : ''
    const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body style="margin:0;padding:0" id="body">
      
      ${playerString}
      
      
  <script src="https://cdn.jsdelivr.net/npm/webtorrent@latest/webtorrent.min.js"></script>
    <script type="text/javascript">
    
    var client = new WebTorrent()
    document.getElementById("player").addEventListener("click", e => {
      e.preventDefault();
      window.ReactNativeWebView.postMessage("generalClickOnPlayer");
    
    })
    
    var torrentId = '${magnet}'
    client.add(torrentId, function (torrent) {
      let cont = 0
      let infoBuff = ''
      while(torrent.info[cont]){
        const [charCode] =torrent.info[cont]
        infoBuff = infoBuff + String.fromCharCode(charCode)
        cont++
      }
      try{
        infoBuff = JSON.parse(infoBuff)
      } catch(e){}
      if(typeof infoBuff === 'object'){
        const previewFile = !!infoBuff.previewName && torrent.files.find(function (file) {
          return (file.name == infoBuff.previewName) 
        })
        const mainFile = !!infoBuff.mediaName && torrent.files.find(function (file) {
          return (file.name == infoBuff.mediaName) 
        })
        if(previewFile){
          previewFile.renderTo('${domID}')
          document.getElementById("player").addEventListener("click", e => {
            window.ReactNativeWebView.postMessage("updateSelectedMediaSizes");
            if(mainFile){
              document.getElementById("player").remove()
              var element = "img"
              var id = "img#player"
              if(mainFile.name.endsWith('.mp4') || mainFile.name.endsWith('.webm')){
                element = "video"
                id="video#player"
              }
              var node = document.createElement(element);
              node.style.cssText = "width:100%"
              node.id ="player"
              document.getElementById("body").appendChild(node)
              mainFile.renderTo(id)
              if(element === "video"){
                node.play()
              }
            }
          
          })
        }
      } else {
        var file = torrent.files.find(function (file) {
          return ${fileExtension}
        })
        file.renderTo('${domID}')
        if("${finalType}" === 'video'){
          const video = document.getElementById("player")
          video.onloadeddata =  (l => video.pause())
          video.play()
          ${videoControls}
        }
      }
    })
        </script>
    </body>
    </html>`

    this.setState({ html })
  }

  webview: CompleteWebView | null = null

  assignRef = (ref: WebView) => {
    this.webview = ref as CompleteWebView
  }

  render() {
    const { width, height } = this.props

    return (
      <WebView
        ref={this.assignRef}
        style={{ width: '100%', aspectRatio: width / height }}
        allowUniversalAccessFromFileURLs
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        allowsFullscreenVideo
        mixedContentMode="always"
        originWhitelist={['*']}
        onMessage={event => {
          const { data } = event.nativeEvent
          if (data === 'updateSelectedMediaSizes') {
            if (this.props.updateToMedia) {
              this.props.updateToMedia()
            }
            return
          }
          if (data === 'generalClickOnPlayer') {
            if (this.props.onPress) {
              this.props.onPress()
            }
            return
          }
          notificationService.Log(
            'TESTING',
            'MESSAGE >>>>' + event.nativeEvent.data,
          )
        }}
        source={{
          html: this.state.html,
        }}
      />
    )
  }
}
