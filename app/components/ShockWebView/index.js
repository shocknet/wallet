import React from 'react'
import { WebView } from 'react-native-webview'
import notificationService from '../../../notificationService'

export default class ShockWebView extends React.Component {
  render() {
    const { width, height, magnet,type } = this.props
    const playerString = type === 'video' ?
      `<video id="player" style="width:100%"></video>` :
      `<img id="player" style="width:100%"></img>`
    const fileExtension = type === 'video' ?
      `(file.name.endsWith('.mp4') || file.name.endsWith('.webm'))` :
      `(file.name.endsWith('.jpg') || file.name.endsWith('.png'))`
    const domID = type === 'video' ? 
    `video#player` :
    `img#player`
    return (
      <WebView
        // eslint-disable-next-line
        ref={ref => (this.webview = ref)}
        // eslint-disable-next-line
        style={{ width: '100%', aspectRatio: width / height }}
        allowUniversalAccessFromFileURLs
        allowsFullscreenVideo
        mixedContentMode="always"
        originWhitelist={['*']}
        // eslint-disable-next-line
        onMessage={event => {
          notificationService.Log(
            'TESTING',
            'MESSAGE >>>>' + event.nativeEvent.data,
          )
        }}
        source={{
          html: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document</title>
      </head>
      <body style="margin:0;padding:0">
        
        ${playerString}
        
        <script src="https://cdn.jsdelivr.net/npm/webtorrent@latest/webtorrent.min.js"></script>
          <script type="text/javascript">
          this.document.addEventListener('message', e => {
            window.ReactNativeWebView.postMessage(event.data);
          })
          //document.getElementById("input").addEventListener("focus", function() {  
            //window.ReactNativeWebView.postMessage("THIS IS IT");
         // });
          var client = new WebTorrent()
      
      //var torrentId = 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent'
      var torrentId = '${magnet}'
      
      client.add(torrentId, function (torrent) {
        // Torrents can contain many files. Let's use the .mp4 file
        var file = torrent.files.find(function (file) {
          return ${fileExtension}
        })
        //file.appendTo('body') // append the file to the DOM
        file.renderTo('${domID}')
      })
           </script>
      </body>
      </html>`,
        }}
      />
    )
  }
}
