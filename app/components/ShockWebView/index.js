import React from 'react'
import { WebView } from 'react-native-webview'
import notificationService from '../../../notificationService'

export default class ShockWebView extends React.Component {
  render() {
    return (
      <WebView
        // eslint-disable-next-line
        ref={ref => (this.webview = ref)}
        // eslint-disable-next-line
        style={{ width: 400, height: 100 }}
        allowUniversalAccessFromFileURLs
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
      <body>
        <script src="https://cdn.jsdelivr.net/npm/webtorrent@latest/webtorrent.min.js"></script>
          <script type="text/javascript">
          this.document.addEventListener('message', e => {
            window.ReactNativeWebView.postMessage(event.data);
          })
          //document.getElementById("input").addEventListener("focus", function() {  
            //window.ReactNativeWebView.postMessage("THIS IS IT");
         // });
          var client = new WebTorrent()
      
      var torrentId = 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent'
      
      client.add(torrentId, function (torrent) {
        // Torrents can contain many files. Let's use the .mp4 file
        var file = torrent.files.find(function (file) {
          return file.name.endsWith('.mp4')
        })
        file.appendTo('body') // append the file to the DOM
      })
           </script>
      </body>
      </html>`,
        }}
      />
    )
  }
}
