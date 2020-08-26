import React from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
// @ts-ignore
import Carousel from 'react-native-smart-carousel'
import * as Common from 'shock-common'
/**
 * @typedef {import('react-native').ScrollView} ScrollView
 */

import * as CSS from '../../res/css'

import UserInfo from './UserInfo'
import ShockWebView from '../ShockWebView'

const { width } = Dimensions.get('window')

/**
 * @typedef {object} Props
 * @prop {Common.Schema.User} author
 * @prop {number} date
 * @prop {{ id: string , text: string}[]} paragraphs
 * @prop {{id: string , data: string,width:number,height:number }[]} images
 * @prop {{id: string , data: string,width:number,height:number }[]} videos
 * @prop {ScrollView} parentScrollViewRef
 */

/**
 * @type {React.FC<Props>}
 */
const Post = ({
  author,
  date,
  paragraphs = [],
  images = [],
  videos = [],
  parentScrollViewRef,
}) => {
  const carouselWidth = Math.round(width) - 20
  const dataCarousel = images.map(image => ({
    id: image.id,
    imagePath: image.data,
  }))

  return ((
    <View style={styles.postContainer}>
      <UserInfo author={author} date={date} />
      {paragraphs.map(paragraph => (
        <Text style={xStyles.paragraph} key={paragraph.id}>
          {paragraph.text}
        </Text>
      ))}
      {videos.length > 0 && <ShockWebView 
        type='video'
        width={videos[0].width}
        height={videos[0].height}
        magnet={videos[0].data}
      />}
      {videos.length === 0 && images.length > 0 && <ShockWebView 
      type='image'
        width={images[0].width}
        height={images[0].height}
        magnet={images[0].data}
      />}
    </View>
  ))
}

const styles = StyleSheet.create({
  postContainer: {
    width: '100%',
    backgroundColor: CSS.Colors.BACKGROUND_NEAR_WHITE,
  },
  paragraphBase: {
    margin: 10,
  },
})

const xStyles = {
  paragraph: [
    styles.paragraphBase,
    CSS.styles.fontMontserrat,
    CSS.styles.fontSize14,
  ],
}

export default Post
