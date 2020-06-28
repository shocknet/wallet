import React from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
// @ts-ignore
import Carousel from 'react-native-smart-carousel'

import * as CSS from '../../res/css'

import UserInfo from './UserInfo'

const { width } = Dimensions.get('window')

/**
 * @typedef {object} Props
 * @prop {string} authorPublicKey
 * @prop {string} authorDisplayName
 * @prop {number} date
 * @prop {{ id: string , text: string}[]} paragraphs
 * @prop {{id: string , data: string }[]} images
 */

/**
 * @type {React.FC<Props>}
 */
const Post = ({
  authorDisplayName = 'Shock User',
  date,
  paragraphs = [],
  images = [],
}) => {
  const carouselWidth = Math.round(width) - 20
  const dataCarousel = images.map(image => ({
    id: image.id,
    imagePath: `data:image/jpeg;base64,${image.data}`,
  }))

  return ((
    <View style={styles.postContainer}>
      <UserInfo authorDisplayName={authorDisplayName} date={date} />
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
        />
      )}
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
