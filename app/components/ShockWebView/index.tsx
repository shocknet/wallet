import React from 'react'
import { WebView } from 'react-native-webview'
import notificationService from '../../../notificationService'

type Props = {
  width:number,
  height:number,
  magnet:string,
  type:'video'|'image',
  permission:'private'|'public'
  //selectedView:'preview'|'media',
  updateToMedia:(()=>void)|null
}
type State = {
  html:string
}
type CompleteWebView = (WebView & {postMessage:(message:string)=>void})

export default class ShockWebView extends React.Component<Props,State> {
  state = {
    html:''
  }
  componentDidMount(){
    const { magnet, type,permission  } = this.props
    const finalType = /*permission === 'public' ? 'image' :*/ type
    const playerString =
      finalType === 'video'
        ? `<video id="player" style="width:100%"></video>`
        : `<img id="player" style="width:100%"></img>`
    const fileExtension =
      finalType === 'video'
        ? `(file.name.endsWith('.mp4') || file.name.endsWith('.webm'))`
        : `(file.name.endsWith('.jpg') || file.name.endsWith('.png'))`
    const domID = finalType === 'video' ? `video#player` : `img#player`
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
    
    //document.getElementById("input").addEventListener("focus", function() {  
      //window.ReactNativeWebView.postMessage("THIS IS IT");
    // });
    var client = new WebTorrent()
    
    //var torrentId = 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent'
    var torrentId = '${magnet}'
    var permission = '${permission}'
    
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
      //window.ReactNativeWebView.postMessage("E"+JSON.stringify(infoBuff))
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
                //window.ReactNativeWebView.postMessage("YE!!!P");
                node.play()
              }
            }
          
          })
        }
        //this.document.addEventListener('message',)
        //document.getElementById("swag").innerText =  (!!check1).toString() +" " + (!!check2).toString() +" " + (!!check3).toString() +" " + (!!check4).toString() +" "
      } else {
        //window.ReactNativeWebView.postMessage("YEAH")
        var file = torrent.files.find(function (file) {
          return ${fileExtension}
        })
        //file.appendTo('body') // append the file to the DOM
        file.renderTo('${domID}')
      }
    })
        </script>
    </body>
    </html>`

    this.setState({html})
  }

  webview: CompleteWebView | null = null
  /*componentDidUpdate(prevProps:Props){
    if(prevProps.selectedView !== this.props.selectedView){
      if(this.webview){
        this.webview.postMessage( this.props.selectedView );
      }
    }
  }*/
  assignRef = (ref:WebView) => {
    this.webview = ref as CompleteWebView
  }
  render() {
    const { width, height } = this.props
    
    return (
      <WebView
        ref={this.assignRef}
        // eslint-disable-next-line
        style={{ width: '100%', aspectRatio: width / height }}
        allowUniversalAccessFromFileURLs
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        allowsFullscreenVideo
        mixedContentMode="always"
        originWhitelist={['*']}
        // eslint-disable-next-line
        onMessage={event => {
          const { data } = event.nativeEvent
          if (data === 'updateSelectedMediaSizes') {
            if (this.props.updateToMedia) {
              this.props.updateToMedia()
            }
            return
          }
          notificationService.Log(
            'TESTING',
            'MESSAGE >>>>' + event.nativeEvent.data,
          )
        }}
        source={{
          html:this.state.html ,
        }}
      />
    )
  }
}
