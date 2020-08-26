import React from 'react'
import { WebView } from 'react-native-webview'
import notificationService from '../../../notificationService'

export default class ShockPreview extends React.Component {
  render() {
    const { width, height, uri } = this.props
    return (
      <WebView
        // eslint-disable-next-line
        ref={ref => (this.webview = ref)}
        // eslint-disable-next-line
        style={{ width: '100%', aspectRatio: 1 }}
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
            <h1>${uri}</h1>
        <video id="player" src="${uri}" style="width:100%;border-style: solid;border-width: 1px;">
        </video>
      </body>
      </html>`,
        }}
      />
    )
  }
}
