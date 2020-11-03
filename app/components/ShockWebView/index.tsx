import React from 'react'
import { WebView, WebViewProps } from 'react-native-webview'
import produce from 'immer'

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
  source: { html: string }
  style: { width: '100%'; aspectRatio: number }
}

type CompleteWebView = WebView & { postMessage: (message: string) => void }

export default class ShockWebView extends React.PureComponent<Props, State> {
  state: State = {
    source: { html: '' },
    style: { width: '100%', aspectRatio: this.props.width / this.props.height },
  }

  componentDidMount() {
    const { magnet, type: finalType, noControls } = this.props
    this.setState({ source: { html: getHTML(magnet, finalType, noControls) } })
  }

  componentDidUpdate({ height: prevHeight, width: prevWidth }: Props) {
    const { height: currHeight, width: currWidth } = this.props

    if (currHeight !== prevHeight || currWidth !== prevWidth) {
      this.setState((state, { height, width }) =>
        produce(state, draft => {
          draft.style.aspectRatio = width / height
        }),
      )
    }
  }

  webview: CompleteWebView | null = null

  assignRef = (ref: WebView) => {
    this.webview = ref as CompleteWebView
  }

  onMessage: WebViewProps['onMessage'] = event => {
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
    notificationService.Log('TESTING', 'MESSAGE >>>>' + event.nativeEvent.data)
  }

  render() {
    return (
      <WebView
        ref={this.assignRef}
        style={this.state.style}
        allowUniversalAccessFromFileURLs
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        allowsFullscreenVideo
        mixedContentMode="always"
        originWhitelist={ORIGIN_WHITE_LIST}
        onMessage={this.onMessage}
        source={this.state.source}
      />
    )
  }
}

const ORIGIN_WHITE_LIST = ['*']
const commonHTMLTop: string = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
    </head>
    <body style="margin:0;padding:0" id="body">
`
const commonHTMLMid: string = `
  <script src="https://cdn.jsdelivr.net/npm/webtorrent@latest/webtorrent.min.js"></script>
  <script type="text/javascript">
    
    var client = new WebTorrent()
    document.getElementById("player").addEventListener("click", e => {
      e.preventDefault();
      window.ReactNativeWebView.postMessage("generalClickOnPlayer");
    
    })
`
const commonHTMLBot: string = `
    </script>
  </body>
</html>
`
const getVideoTorrentHTML = (magnet: string, controls: string) => `
  ${commonHTMLTop} 
  <video id="player" style="width:100%"></video>
  ${commonHTMLMid}
  var torrentId = '${magnet}'
  client.add(torrentId, function (torrent) {
      var file = torrent.files.find(function (file) {
          return (file.name.endsWith('.mp4') || file.name.endsWith('.webm'))
      })
      file.renderTo('video#player')
      const video = document.getElementById("player")
      video.onloadeddata =  (l => video.pause())
      video.play()
      ${controls}
  })
  ${commonHTMLBot}
`
const getImageTorrentHTML = (magnet: string) => `
  ${commonHTMLTop} 
  <img id="player" style="width:100%"></img>
  ${commonHTMLMid}
  var torrentId = '${magnet}'
  client.add(torrentId, function (torrent) {
      var file = torrent.files.find(function (file) {
          return (file.name.endsWith('.jpg') || file.name.endsWith('.png'))
      })
      file.renderTo('img#player')
  })
  ${commonHTMLBot}
`
const getImageHTML = (url: string) => `
  ${commonHTMLTop} 
  <img id="player" style="width:100%"></img>
  ${commonHTMLMid}
  var image = document.querySelector('#player')
  image.setAttribute("src","${url}")
  ${commonHTMLBot}
`
const getVideoHTML = (url: string, controls: string) => `
  ${commonHTMLTop} 
  <video id="player" style="width:100%"></video>
  ${commonHTMLMid}
  var video = document.querySelector('#player')
  video.setAttribute("src","${url}")
  video.onloadeddata =  (l => video.pause())
  video.play()
  ${controls}
  ${commonHTMLBot}
`

const getHTML = (
  magnet: string,
  type: 'video' | 'image',
  noControls?: boolean,
) => {
  const contentUrl = magnet
    .replace(/%2F/g, '/')
    .replace(/%3A/g, ':')
    .replace(/.*(ws\=)/gi, '')
  if (contentUrl) {
    if (type === 'video') {
      if (noControls) {
        notificationService.LogT('HTTP - VIDEO - NO')
        return getVideoHTML(contentUrl, 'video.removeAttribute("controls")')
      } else {
        notificationService.LogT('HTTP - VIDEO - YES')
        return getVideoHTML(contentUrl, 'video.setAttribute("controls",true)')
      }
    } else {
      notificationService.LogT('HTTP - IMAGE')
      return getImageHTML(contentUrl)
    }
  } else {
    if (type === 'video') {
      if (noControls) {
        notificationService.LogT('TORRENT - VIDEO - NO')
        return getVideoTorrentHTML(magnet, 'video.removeAttribute("controls")')
      } else {
        notificationService.LogT('TORRENT - VIDEO - YES')
        return getVideoTorrentHTML(magnet, '')
      }
    } else {
      notificationService.LogT('TORRENT - IMAGE')
      return getImageTorrentHTML(magnet)
    }
  }
}
