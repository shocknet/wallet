import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import ShockWebView from './ShockWebView'
import { newLogo } from '../res'
import Pad from '../components/Pad'
import { Schema } from 'shock-common'

/**
 *
 * @param {Schema.Post} post
 */
export default function FeedItem(post) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Image source={newLogo} style={styles.image} />
        <Text style={styles.title}>post.username</Text>
      </View>

      {/**<Text>{post.paragraphs[0]}</Text>
      <ShockWebView
        ratio_x={media.ratio_x}
        ratio_y={media.ratio_y}
        magnet={media.magnetUri}
      />**/}
      {Object.entries(post.contentItems).map(entry => {
        const [key, item] = entry
        switch (item.type) {
          case 'text/paragraph':
            return mediaParagraph([key, item])
          case 'video/embedded':
            return mediaVideo([key, item])
          case 'image/embedded':
            return mediaImage([key, item])
          default:
            return null
        }
      })}
      <Pad amount={10} />
    </View>
  )
}
/**
 * @param {[string, Schema.Paragraph]} entry
 */
const mediaParagraph = entry => {
  const [key, paragraph] = entry
  return <Text key={key}>{paragraph.text}</Text>
}

/**
 * @param {[string, Schema.EmbeddedVideo]} entry
 */
const mediaVideo = entry => {
  const [key, video] = entry
  return (
    <ShockWebView
      key={key}
      width={video.width}
      height={video.height}
      magnet={video.magnetURI}
    />
  )
}

/**
 * @param {[string, Schema.EmbeddedImage]} entry
 */
const mediaImage = entry => {
  //eslint-disable-next-line
  console.log(entry)
  //TODO
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 5,
    marginBottom: 3,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  title: {
    fontSize: 32,
  },
  image: {
    width: 100,
    height: 100,
  },
})
