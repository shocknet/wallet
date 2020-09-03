import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
// @ts-ignore
import Carousel from 'react-native-smart-carousel'
import * as Common from 'shock-common'

import * as CSS from '../../res/css'

import UserInfo from './UserInfo'
import ShockWebView from '../ShockWebView'

interface Props {
  author: Common.Schema.User
  date: number
  paragraphs: { id: string; text: string }[]
  images: { id: string; data: string; width: number; height: number }[]
  videos: { id: string; data: string; width: number; height: number }[]
  parentScrollViewRef: ScrollView | undefined
}

export default class Post extends React.Component<Props> {
  shouldComponentUpdate() {
    return false
  }

  render() {
    const {
      author,

      date,
      paragraphs = [],
      images = [],
      videos = [],
      //parentScrollViewRef,
    } = this.props

    /*const carouselWidth = Math.round(width) - 20
    const dataCarousel = images.map(image => ({
      id: image.id,
      imagePath: image.data,
    }))*/

    return (
      <View style={styles.postContainer}>
        <UserInfo author={author} date={date} />
        {paragraphs.map(paragraph => (
          <Text style={xStyles.paragraph} key={paragraph.id}>
            {paragraph.text}
          </Text>
        ))}
        {videos.length > 0 && (
          <ShockWebView
            type="video"
            width={videos[0].width}
            height={videos[0].height}
            magnet={videos[0].data}
          />
        )}
        {videos.length === 0 && images.length > 0 && (
          <ShockWebView
            type="image"
            width={images[0].width}
            height={images[0].height}
            magnet={images[0].data}
          />
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  postContainer: {
    width: '100%',
    backgroundColor: '#16191C',
  },
  paragraphBase: {
    margin: 10,
    color: '#F3EFEF',
  },
})

const xStyles = {
  paragraph: [
    styles.paragraphBase,
    CSS.styles.fontMontserrat,
    CSS.styles.fontSize14,
  ],
}
