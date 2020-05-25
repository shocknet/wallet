import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import ShockWebView from './ShockWebView'
import { newLogo } from '../res'
import Pad from '../components/Pad'

/**
 *
 * @param {import('../actions/FeedActions').PartialFeed} post
 */
export default function FeedItem(post) {
  const [media] = post.media
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Image source={newLogo} style={styles.image} />
        <Text style={styles.title}>{post.username}</Text>
      </View>

      <Text>{post.paragraphs[0]}</Text>
      <ShockWebView
        ratio_x={media.ratio_x}
        ratio_y={media.ratio_y}
        magnet={media.magnetUri}
      />
      <Pad amount={10} />
    </View>
  )
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
