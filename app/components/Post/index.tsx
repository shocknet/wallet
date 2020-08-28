import React from 'react'
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native'
// @ts-ignore
import Carousel from 'react-native-smart-carousel'
import * as Common from 'shock-common'

import * as CSS from '../../res/css'

import UserInfo from './UserInfo'

const { width } = Dimensions.get('window')

interface Props {
  author: Common.Schema.User
  date: number
  paragraphs: { id: string; text: string }[]
  images: { id: string; data: string }[]
  parentScrollViewRef: ScrollView
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
      parentScrollViewRef,
    } = this.props

    const carouselWidth = Math.round(width) - 20
    const dataCarousel = images.map(image => ({
      id: image.id,
      imagePath: image.data,
    }))

    return (
      <View style={styles.postContainer}>
        <UserInfo author={author} date={date} />
        {paragraphs.map(paragraph => (
          <Text style={xStyles.paragraph} key={paragraph.id}>
            {paragraph.text}
          </Text>
        ))}
        {dataCarousel.length > 0 && (
          <Carousel
            width={carouselWidth}
            data={dataCarousel}
            navigationType="dots"
            navigationColor={CSS.Colors.BUTTON_BLUE}
            navigation
            parentScrollViewRef={parentScrollViewRef}
          />
        )}
      </View>
    )
  }
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
